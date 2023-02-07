import { logger } from "../utils.js";
// import core from "./core.js";
import SDK from "sfmc-sdk";

function getSDKFromSession(auth, mid) {
	const sfmc = new SDK({
		client_id: "XXXXX",
		client_secret: "YYYYYY",
		auth_url: auth.soap_instance_url.replace(".soap.", ".auth."),
		account_id: mid
	});
	sfmc.auth.authObject = auth;
	// Object.assign(sfmc.auth, auth);
	console.log(sfmc);
	return sfmc;
}

// /** @description returns all data extensions (up to 2500)
//  * @memberof server/sfmc
//  * @function
//  * @param {Object} req express request object
//  * @return {Array} name of Attribute Set if found
//  */
// export  async function getDataExtensions  (req)  {
// 	const body = {
// 		RetrieveRequestMsg: {
// 			RetrieveRequest: {
// 				ObjectType: "DataExtension",
// 				Properties: ["Name", "CustomerKey", "CategoryID", "ObjectID"]
// 			}
// 		}
// 	};

// 	const response = await core.soapRequest(body, "Retrieve", req.session.auth);
// 	return core.flattenResults(response.Results);
// };
// /** @description returns all data extensions (up to 2500)
//  * @memberof server/sfmc
//  * @function
//  * @param {Object} req request
//  * @return {Array} name of Attribute Set if found
//  */
// export async function getDataExtensionFields  (req) {
// 	const fieldProperties = req.body.fields || ["Name", "FieldType"];
// 	const body = {
// 		RetrieveRequestMsg: {
// 			RetrieveRequest: {
// 				ObjectType: "DataExtensionField",
// 				//QueryAllAccounts: "true",
// 				Properties: fieldProperties,
// 				Filter: {
// 					$: {
// 						"xsi:type": "SimpleFilterPart"
// 					},
// 					Property: "DataExtension.CustomerKey",
// 					SimpleOperator: "equals",
// 					Value: req.params.key
// 				}
// 			}
// 		}
// 	};
// 	const rawResults = await core.soapRequest(body, "Retrieve", req.session.auth);
// 	return core.parseSOAPResponse(rawResults).map((field) => {
// 		const obj = {};
// 		for (const key in field) {
// 			if (fieldProperties.includes(key)) {
// 				obj[key] = field[key][0];
// 			}
// 		}
// 		return obj;
// 	});
// };
// /** @description returns all data extension rows (up to 2500)
//  * @memberof server/sfmc
//  * @function
//  * @param {Object} req request
//  * @return {Array} name of Attribute Set if found
//  */
// export async function getDataExtensionData (req, name, fields)  {
// 	const body = {
// 		RetrieveRequestMsg: {
// 			RetrieveRequest: {
// 				ObjectType: "DataExtensionObject[" + name + "]",
// 				Properties: fields
// 			}
// 		}
// 	};
// 	if (req.body.filter) {
// 		body.RetrieveRequestMsg.RetrieveRequest.Filter = {
// 			$: {
// 				"xsi:type": "SimpleFilterPart"
// 			},
// 			Property: req.body.filter.field,
// 			SimpleOperator: req.body.filter.operator,
// 			Value: req.body.filter.value
// 		};
// 	}

//     const soapRetrieveBulk = await sfmc.soap.retrieveBulk('DataExtension', ['ObjectID'], {
//         filter: {
//             leftOperand: 'CustomerKey',
//             operator: 'equals',
//             rightOperand: 'SOMEKEYHERE',
//         },

//     const rawResults = await (getSDKFromSession(req.session.auth).soap.retrieve('DataExtension', body, {});
// 	const rawResults = await core.soapRequest(, "Retrieve", );
// 	const parsedresults = core.parseSOAPResponse(rawResults);
// 	// convert key value array to object
// 	if (parsedresults) {
// 		const rows = parsedresults.map((row) => {
// 			const obj = {};
// 			row.Properties[0].Property.filter((prop) =>
// 				fields.includes(prop.Name[0])
// 			).forEach((prop) => {
// 				obj[prop.Name[0]] = prop.Value[0];
// 			});
// 			return obj;
// 		});
// 		return rows;
// 	}
// 	return null;
// };
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
		console.log(field);
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
