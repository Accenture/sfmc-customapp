import SDK from "sfmc-sdk";
import axios from "axios";
import { logger } from "./utils.js";

// Used for Journey Token Validation
export async function JourneySessionAuthentication(req, res) {
	try {
		//todo add check here for headers to avoid accidental loading
		console.log("RUNNING AUTH");

		// await getContextFromToken(req.body.access_token);
		const authOptions = {
			access_token: req.body.access_token,
			expiration: req.body.expires_in, //not sure if this is the correct key
			auth_url:
				"https://mcxxxxxxxxxxxxxxxxxxxxxxxxxx.auth.marketingcloudapis.com/",
			client_id: "xxxxx",
			client_secret: "xxxxx",
			rest_instance_url: "https://www-mc-s7.exacttargetapis.com/",
			account_id: 9999
		};
		const sdk = new SDK(authOptions);
		const tokenContext = await sdk.rest.get("platform/v1/tokenContext");
		if (tokenContext.organization.id) {
			req.session.context = tokenContext;
			res.json(tokenContext);
		} else {
			res.status(401).send({
				message: "Unauthorized",
				details:
					"Unfortunately, only authorized users in the SFMC context can use this site."
			});
		}
	} catch (error) {
		if (error.response && error.response.data) {
			logger.info("checkAuth Failed", error.response.data);
		} else {
			logger.info("checkAuth Failed", error);
		}

		res.status(500).send({
			message: error.message,
			details: error.response ? error.response.data : error.response
		});
	}
}
// No sure if still needed
async function getContextFromToken(token) {
	try {
		const res = await axios({
			method: "get",
			baseURL: "https://www-mc-s7.exacttargetapis.com",
			url: "/platform/v1/endpoints/?IsTSE=true",
			headers: { Authorization: `Bearer ${token}` }
		});
		console.log("GET CONTEXT", res.data);
	} catch (error) {
		console.error(error.response.data);
	}
}

export async function getAuthRedirect(req, res) {
	//either use appname param OR use the html page name for redirect
	const redirectUrl = new URL(
		(req.params.appname || req.path.replace(".html", "")) + "/oauth/response",
		`https://${req.get("host")}`
	);
	const urlObj = new URL("v2/authorize", process.env.AUTH_URL);

	urlObj.searchParams.append("response_type", "code");
	urlObj.searchParams.append("client_id", process.env.CLIENT_ID);
	urlObj.searchParams.append("redirect_uri", redirectUrl.href);
	//If existing session, pass as state, to allow response to reconnect to session
	if (req.sessionID) {
		urlObj.searchParams.append("state", req.sessionID);
	}
	res.redirect(302, urlObj.toString());
}
export async function getAccessToken(req, res, next) {
	try {
		const urlObj = new URL("https://" + req.hostname + req.originalUrl);
		const payload = {
			grant_type: "authorization_code",
			code: urlObj.searchParams.get("code"),
			client_id: process.env.CLIENT_ID,
			redirect_uri: "https://" + req.get("host") + req.path
		};
		//gets token
		const response = await axios({
			method: "post",
			url: "/v2/token",
			baseURL: process.env.AUTH_URL,
			data: payload
		});
		//gets user details for better context
		const user = await axios({
			method: "get",
			url: "/v2/userinfo",
			baseURL: process.env.AUTH_URL,
			headers: {
				Authorization: `Bearer ${response.data.access_token}`
			}
		});
		const t = new Date();
		t.setSeconds(t.getSeconds() + response.data.expires_in);
		response.data.expiry = t;
		req.session.auth = response.data;
		req.session.context = user.data;
		next();
	} catch (error) {
		console.error(error);
		res.status(500).json(error);
	}
}
