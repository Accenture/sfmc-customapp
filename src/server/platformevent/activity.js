import express from "express";
import { getConnection } from "../sfdc.js";
import { decodeJwt, logger } from "../utils.js";
import { config } from "./config.js";


export const platformEvent = express.Router();

platformEvent.get("/config.json", config);

/*
 * we strongly recommend versioning here (esp for the execute command)
 * to support existing activities when payload shape changes
 */
platformEvent.post("/v1/execute", decodeJwt, async (req, res) => {
	logger.info("LOGGING EXECUTE", req.body);
	const notificationRes = await publishNotification(
		req.body.inArguments[0].type,
		req.body.inArguments[1].content,
		req.body.inArguments[2].recipient,
		req.body.inArguments[3].target,
		req.body.inArguments[4].mid
	);
	res.json(notificationRes);
});
platformEvent.post("/v1/save", (req, res) => {
	logger.info("LOGGING SAVE", req.body);
	res.json({ status: "accepted" });
});
platformEvent.post("/v1/publish", (req, res) => {
	logger.info("LOGGING PUBLISH", req.body);
	res.json({ status: "accepted" });
});
platformEvent.post("/v1/validate", (req, res) => {
	logger.info("LOGGING VALIDATE", req.body);
	res.json({ status: "accepted" });
});
platformEvent.post("/v1/stop", (req, res) => {
	logger.info("LOGGING STOP", req.body);
	res.json({ status: "accepted" });
});
