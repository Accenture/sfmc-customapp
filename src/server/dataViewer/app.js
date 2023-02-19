import express from "express";

import { logger } from "../utils.js";
import {
	getDataExtensions,
	getDataExtensionFields,
	getDataExtensionData
} from "../sfmc/data.js";
import fs from "fs-extra";
import { getFolders } from "../sfmc/platform.js";
import { arrayToTree } from "performant-array-to-tree";

export const dataViewer = express.Router();
dataViewer.get("/DataExtensions", async (req, res) => {
	try {
		res.json(
			await getDataExtensions(
				req.session.auth,
				req.session.context.organization.member_id
			)
		);
	} catch (error) {
		logger.error(error);
		res.status(500).json(error.message);
	}
});
dataViewer.get(
	"/DataExtension/:key/fields",

	async (req, res) => {
		try {
			res.json(
				await getDataExtensionFields(
					req.session.auth,
					req.session.context.organization.member_id,
					req.body.fields,
					req.params.key
				)
			);
		} catch (error) {
			res.status(500).json(error.message);
		}
	}
);

dataViewer.post("/DataExtensionData", async (req, res) => {
	try {
		const fieldSet = req.body.fields.map((field) => field.fieldName);
		//add _CustomObjectKey
		fieldSet.push("_CustomObjectKey");
		if (fieldSet) {
			try {
				const objectData = await getDataExtensionData(
					req.session.auth,
					req.session.context.organization.member_id,
					fieldSet,
					req.body.name,
					req.body.filter
						? {
								filter: {
									leftOperand: req.body.filter.field,
									operator: req.body.filter.operator,
									rightOperand: req.body.filter.value
								}
						  }
						: null
				);
				if (objectData) {
					res.json(
						objectData.map((row) =>
							row.Properties.Property.reduce((r, field) => {
								r[field.Name] = field.Value;
								return r;
							}, {})
						)
					);
				} else {
					res.status(204).json({
						message: "No Rows Found",
						status: "warn"
					});
				}
			} catch (error) {
				res.status(500).json({
					message: error.message,
					status: "error"
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

dataViewer.get("/DataTree", async (req, res) => {
	const deList = await getDataExtensions(
		req.session.auth,
		req.session.context.organization.member_id
	);
	const deCorrected = deList.map((de) => {
		return {
			label: de.Name,
			name: de.CustomerKey,
			parentId: de.CategoryID,
			metatext: "dataExtension",
			id: de.ObjectID
		};
	});

	const r = await getFolders(
		req.session.auth,
		req.session.context.organization.member_id
	);
	//todo some logic here on parsing
	const t = r.map((folder) => {
		return {
			label: folder.Name,
			name: "FOLDER:" + folder.Name,
			id: folder.ID,
			parentId: folder.ParentFolder?.ID,
			metatext: "folder"
		};
	});

	//push the root
	t.push({
		label: "Parent",
		name: "Parent",
		id: 0
	});
	t.push(...deCorrected);
	fs.writeJSON("test.json", t);

	try {
		res.json({
			keyValue: deCorrected.reduce((r, e) => {
				r[e.name] = e;
				return r;
			}, {}),
			tree: arrayToTree(t, {
				id: "id",
				parentId: "parentId",
				childrenField: "items",
				dataField: null
			})
		});
	} catch (error) {
		res.status(500).json(error.message);
	}
});
