import { flattenResults, getSDKFromSession } from "./core.js";

export async function getFolders(auth, mid) {
	const sdk = getSDKFromSession(auth, mid);
	const response = await sdk.soap.retrieveBulk(
		"DataFolder",
		["Name", "ParentFolder.ID", "ID", "ContentType"],
		{
			filter: {
				leftOperand: "ContentType",
				operator: "IN",
				rightOperand: [
					"dataextension",
					"salesforcedataextension",
					"shared_dataextension",
					"shared_salesforcedataextension",
					"synchronizeddataextension"
				]
			}
		}
	);
	return response.Results;
}
