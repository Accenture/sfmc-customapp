import express from "express";

import { logger } from "../utils.js";
import { parse } from "./profiler.js";
import { createDataExtension } from "../sfmc/data.js";
export const dataAssessor = express.Router();

dataAssessor.post("/exampledata", async (req, res) => {
	try {
		logger.info("locale", req.query);
		const metadata = await parse(
			req.body,
			req.query.phonelocale,
			req.query.delimiter
		);
		res.status(200).json(metadata);
	} catch (error) {
		console.log(error);
		logger.error(error);
		res.status(500).json(error.message);
	}
});

dataAssessor.get("/getDataExtensions", async (req, res) => {
	try {
		res.json(await data.getDataExtensions(req));
	} catch (error) {
		logger.error(error);
		res.status(500).json(error.message);
	}
});
dataAssessor.get(
	"/getDataExtension/:key/fields",

	async (req, res) => {
		try {
			res.json(await data.getDataExtensionFields(req));
		} catch (error) {
			res.status(500).json(error.message);
		}
	}
);

dataAssessor.post("/getDataExtensionData", async (req, res) => {
	try {
		const fieldSet = req.body.fields.map((field) => field.fieldName);
		//add _CustomObjectKey
		fieldSet.push("_CustomObjectKey");
		if (fieldSet) {
			const objectData = await data.getDataExtensionData(
				req,
				req.body.name,
				fieldSet
			);
			if (objectData) {
				res.json(objectData);
			} else {
				res.status(204).json({
					message: "No Rows Found",
					status: "warn"
				});
			}
		} else {
			res.status(500).json({
				message: "No Fields Available",
				status: "error"
			});
		}
	} catch (error) {
		logger.error(error);
		res.status(500).json(error);
	}
});

dataAssessor.get("/getFolders", async (req, res) => {
	try {
		res.json(await platform.getFolders(req));
	} catch (error) {
		res.status(500).json(error.message);
	}
});
dataAssessor.post("/createDataExtension", async (req, res) => {
	console.log("CREATE DATA EXTENSION", req.session);
	try {
		res.json(
			await createDataExtension(
				req.body,
				req.session.auth,
				req.session.context.organization.member_id
			)
		);
	} catch (error) {
		console.error(error.json);
		res.status(500).json(error.json);
	}
});
