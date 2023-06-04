import express from "express";
import { getConnection } from "../admin/sfdc.js";
import { decodeJwt, logger } from "../utils.js";
import { config } from "./config.js";
const SF_API_VERSION = "57.0";

export const platformEvent = express.Router();

platformEvent.get("/config.json", config);

platformEvent.get("/v1/platformEvents", async (req, res) => {
	try {
		const conn = await getConnection(
			req.session.context.organization.member_id
		);
		const describe = await conn.describeGlobal();
		res.json(
			await Promise.all(
				describe.sobjects
					.filter(
						(obj) =>
							obj.name.endsWith("__e") &&
							obj.createable &&
							!obj.deprecatedAndHidden
					)
					.map((obj) => conn.describe(obj.name))
			)
		);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

async function publishEvent(evt, fields, mid) {
	const conn = await getConnection(req.session.context.organization.member_id);
	const createRes = await conn.sobject(evt).create(fields);
	logger.info("createRes", createRes);
	return createRes;
}

/*
 * we strongly recommend versioning here (esp for the execute command)
 * to support existing activities when payload shape changes
 */
platformEvent.post("/v1/execute", decodeJwt, async (req, res) => {
	logger.info("LOGGING EXECUTE", req.body);

	logger.info("execute request:", req.body);
	publishEvent(
		req.body.inArguments[0].event,
		req.body.inArguments[1].fields,
		req.body.inArguments[2].mid
	);

	res.json({ status: "ok" });
});
platformEvent.post("/v1/save", decodeJwt, (req, res) => {
	logger.info("LOGGING SAVE", req.body);
	res.json({ status: "accepted" });
});
platformEvent.post("/v1/publish", decodeJwt, (req, res) => {
	logger.info("LOGGING PUBLISH", req.body);
	res.json({ status: "accepted" });
});
platformEvent.post("/v1/validate", decodeJwt, (req, res) => {
	logger.info("LOGGING VALIDATE", req.body);
	res.json({ status: "accepted" });
});
platformEvent.post("/v1/stop", decodeJwt, (req, res) => {
	logger.info("LOGGING STOP", req.body);
	res.json({ status: "accepted" });
});
