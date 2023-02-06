import { logger } from "./utils.js";
import jsforce from "jsforce";
import { getConfig, setConfig, deleteConfig } from "./data.js";
import express from "express";
export const sfdcRoutes = express.Router();

const SFDC_API_Version = "56.0";

const connectionMap = {};

export async function getConnection(mid) {
	if (!connectionMap[mid]) {
		const resp = await getConfig("SFDC:" + mid);
		connectionMap[mid] = new jsforce.Connection(resp);
		connectionMap[mid].on("refresh", (accessToken, res) => {
			logger.info("on Refresh", accessToken, res);
			resp.accessToken = accessToken;
			setConfig("SFDC:" + mid, resp);
		});
	}
	return connectionMap[mid];
}

sfdcRoutes.get("/status/:mid", async (req, res) => {
	res.json(await getConnection(req.param.mid).identity());
});
sfdcRoutes.post("/credentials", (req, res) => {
	console.log("SESSION", req.session);
	const connectionSettings = {
		loginUrl: req.body.instance_url,
		clientId: req.body.client_key,
		clientSecret: req.body.client_secret,
		redirectUri: `https://${req.get("host")}/sfdc/oauth/response`,
		mid: req.session.context.organization.member_id,
		appUri: req.body.appUri
	};
	const tempConn = new jsforce.OAuth2(connectionSettings);
	const redirUrl = tempConn.getAuthorizationUrl({
		scope: "api id web refresh_token offline_access",
		state: JSON.stringify(connectionSettings)
	});
	res.status(200).send(redirUrl);
});
sfdcRoutes.delete("/credentials", async (req, res) => {
	await deleteConfig("SFDC:" + req.session.context.organization.member_id);
	delete connectionMap[req.session.context.organization.member_id];
	res
		.status(200)
		.send({ status: "OK", statusMessage: "Credentials for SFDC deleted" });
});
sfdcRoutes.get("/oauth/response", async (req, res) => {
	const state = JSON.parse(req.query.state);
	const temp = {
		version: SFDC_API_Version,
		instanceUrl: state.loginUrl,
		oauth2: state
	};
	const conn = new jsforce.Connection(temp);

	try {
		const userInfo = await conn.authorize(req.query.code);
		logger.info("userInfo", userInfo);
		temp.refreshToken = conn.refreshToken;
		temp.accessToken = conn.accessToken;
		const key = "SFDC:" + state.mid;
		delete temp.oauth2.mid;
		await setConfig(key, temp);
		conn.on("refresh", async (accessToken, res) => {
			logger.info("on Refresh", accessToken, res);

			await setConfig(key, conn.OAuth2); // TODO not sure if this is really needed
			logger.info("refreshed and saved credentials");
			// Refresh event will be fired when renewed access token
			// to store it in your storage for next request
		});

		// Now you can get the access token, refresh token, and instance URL information.
		// Save them to establish connection next time.
		logger.info("User ID: " + userInfo.id);
		logger.info("Org ID: " + userInfo.organizationId);
		res.redirect(state.appUri);
	} catch (error) {
		logger.error("ERROR authorize:", error);
		throw error;
	}
});

sfdcRoutes.get("/connection", async (req, res) => {
	if (req.session?.context?.organization?.member_id) {
		try {
			const conn = await getConnection(
				req.session.context.organization.member_id
			);

			const resp = await conn.identity();
			res.json(resp);
		} catch (error) {
			if (error.message == "Key not found") {
				res.status(204).send();
			} else {
				res.status(401).send({
					status: "ERROR",
					statusMessage: error.message
				});
			}
		}
	} else {
		res.status(401).send({
			status: "ERROR",
			statusMessage: "No Marketing Cloud session, please login to SFMC first"
		});
	}
});
