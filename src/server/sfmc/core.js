import SDK from "sfmc-sdk";

export function flattenResults(Results) {
	return Results.map((obj) => {
		const flattenedObj = {};
		for (const key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				flattenedObj[key] = obj[key][0];
			}
		}
		return flattenedObj;
	});
}

export function getSDKFromSession(auth, mid) {
	const sfmc = new SDK({
		client_id: "XXXXX",
		client_secret: "YYYYYY",
		auth_url: auth.soap_instance_url.replace(".soap.", ".auth."),
		account_id: mid
	});
	sfmc.auth.authObject = auth;
	return sfmc;
}