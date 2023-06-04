import express from "express";

import { logger } from "../utils.js";
import { parse } from "./profiler.js";
import { createDataExtension } from "../sfmc/data.js";
export const dataAssessor = express.Router();

dataAssessor.post("/exampledata", async (req, res) => {
	try {
		const metadata = await parse(
			req.body,
			req.query.phonelocale,
			req.query.delimiter
		);
		res.status(200).json(metadata);
	} catch (error) {
		logger.error(error);
		res.status(500).json(error.message);
	}
});
dataAssessor.post("/createDataExtension", async (req, res) => {
	try {
		res.json(
			await createDataExtension(
				req.body,
				req.session.auth,
				req.session.context.organization.member_id
			)
		);
	} catch (error) {
		logger.error(error.json);
		res.status(500).json(error.json);
	}
});
