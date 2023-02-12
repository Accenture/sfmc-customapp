import { logger } from "../utils.js";
import { flattenResults, getSDKFromSession } from "./core.js";

/** @description returns all data extensions (up to 2500)
 * @memberof server/sfmc
 * @function
 * @param {Object} req express request object
 * @return {Array} name of Attribute Set if found
 */
export async function getDataExtensions(auth, mid) {
	const sdk = getSDKFromSession(auth, mid);
	const response = await sdk.soap.retrieveBulk("DataExtension", [
		"Name",
		"CustomerKey",
		"CategoryID",
		"ObjectID"
	]);
	return response.Results;
}
/** @description returns all data extensions (up to 2500)
 * @memberof server/sfmc
 * @function
 * @param {Object} req request
 * @return {Array} name of Attribute Set if found
 */
export async function getDataExtensionFields(auth, mid, fields, key) {
	const fieldProperties = fields || ["Name", "FieldType"];
	const sdk = getSDKFromSession(auth, mid);
	const response = await sdk.soap.retrieve(
		"DataExtensionField",
		fieldProperties,
		{
			filter: {
				leftOperand: "DataExtension.CustomerKey",
				operator: "equals",
				rightOperand: key
			}
		}
	);
	return response.Results;
}
/** @description returns all data extension rows (up to 2500)
 * @memberof server/sfmc
 * @function
 * @param {Object} req request
 * @return {Array} name of Attribute Set if found
 */
export async function getDataExtensionData(auth, mid, fields, name, filter) {
	const sdk = getSDKFromSession(auth, mid);
	const response = await sdk.soap.retrieveBulk(
		"DataExtensionObject[" + name + "]",
		fields,
		filter
	);
	//todo some logic here on parsing
	return response.Results;
}

/** @description creates data extension
 * @memberof server/sfmc
 * @function
 * @param {Object} req request
 * @return {Array} name of Attribute Set if found
 */
export async function createDataExtension(metadata, auth, mid) {
	// const metadata = JSON.parse(req.body);
	const sdk = getSDKFromSession(auth, mid);
	const regex = /[()]/g; //not supported as data extension field names
	metadata.fields = metadata.fields.map((field) => {
		field.Name = field.Name.replace(regex, "");
		return field;
	});
	return sdk.soap.create("DataExtension", {
		Name: metadata.name,
		CustomerKey: metadata.name,
		Fields: {
			Field: metadata.fields
		}
	});
}
