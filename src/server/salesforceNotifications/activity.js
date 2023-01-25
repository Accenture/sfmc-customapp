import express from "express";
import { getConnection } from "../sfdc.js";
import { decodeJwt, logger } from "../utils.js";
import { config } from "./config.js";

async function publishNotification(
	typeId,
	content,
	recipientId,
	targetId,
	mid
) {
	const payload = [
		{
			customNotifTypeId: typeId,
			recipientIds: [recipientId],
			title: "Marketing Cloud Notification",
			body: content,
			targetId: targetId
		}
	];
	logger.info(
		"PUBLISH NOTIFICATION - Request",
		JSON.stringify({
			inputs: payload
		})
	);
	const res = await (
		await getConnection(mid)
	).requestPost("/actions/standard/customNotificationAction", {
		inputs: payload
	});
	logger.info("PUBLISH NOTIFICATION - Response", res);
	return res;
}
export const salesforceNotifications = express.Router();

salesforceNotifications.get("/config.json", config);
salesforceNotifications.get("/v1/notificationTypes", async (req, res) => {
	console.log("GETTING NOTIFICATIONS", req.session);
	const conn = await getConnection(req.session.context.organization.member_id);
	const notifs = await conn.tooling.query(
		"Select Id,CustomNotifTypeName from CustomNotificationType"
	);
	res.json(notifs);
});

/*
 * we strongly recommend versioning here (esp for the execute command)
 * to support existing activities when payload shape changes
 */
salesforceNotifications.post("/v1/execute", decodeJwt, async (req, res) => {
	logger.info("LOGGING EXECUTE", req.body);
	try {
		const notificationRes = await publishNotification(
			req.body.inArguments[0].type,
			req.body.inArguments[1].content,
			req.body.inArguments[2].recipient,
			req.body.inArguments[3].target,
			req.body.inArguments[4].mid
		);
		res.json(notificationRes);
	} catch (ex) {
		logger.error("ERROR: Publishing Notification Failed", ex.message);
		res.status(500).json(ex.message);
	}
});
salesforceNotifications.post("/v1/save", (req, res) => {
	logger.info("LOGGING SAVE", req.body);
	res.json({ status: "accepted" });
});
salesforceNotifications.post("/v1/publish", (req, res) => {
	logger.info("LOGGING PUBLISH", req.body);
	res.json({ status: "accepted" });
});
salesforceNotifications.post("/v1/validate", (req, res) => {
	logger.info("LOGGING VALIDATE", req.body);
	res.json({ status: "accepted" });
});
salesforceNotifications.post("/v1/stop", (req, res) => {
	logger.info("LOGGING STOP", req.body);
	res.json({ status: "accepted" });
});
