import { logger } from "./utils.js";
import { Firestore } from "@google-cloud/firestore";
import { FirestoreStore } from "@google-cloud/connect-firestore";
import { getAuthRedirect, getAccessToken } from "./auth.js";
import { sfdcRoutes } from "./sfdc.js";
import { salesforceNotifications } from "./salesforceNotifications/activity.js";
import compression from "compression";
import helmet from "helmet";
import express from "express";
import bodyParser from "body-parser";
import { JourneySessionAuthentication } from "./auth.js";
import crypto from "crypto";
import * as dotenv from "dotenv";

import session from "express-session";
import rateLimit from "express-rate-limit";
import * as data from "./data.js"; // this file should be replaced spending on your data store for settings/caching

const HOST = process.env.API_HOST || "localhost";
const PORT = process.env.PORT || 3000;

if (
	process.env.NODE_ENV === "production" ||
	process.argv.includes("--production")
) {
	console.log("LOADING PRODUCTION");
	process.env.NODE_ENV = "production";
} else {
	console.log("LOADING DEVELOPMENT");
	process.env.NODE_ENV = "development";
	dotenv.config();
}

const app = express();

app.use((req, res, next) => {
	logger.info(req.path, req.body);
	next();
});

app.set("trust proxy", 1); // needed where server is not https itself (ie. with tunnel proxy)
app.use(express.static("./src/resources"));
app.use(express.static("./node_modules/@salesforce-ux/design-system/assets"));

app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text({ type: "text/plain", limit: "10mb" }));
app.use(bodyParser.json());
app.use(bodyParser.raw({ type: "application/jwt" }));

// add iframe protections, except frameguard which causes issues being rendered in iframe of SFMC
app.use(
	helmet({
		frameguard: false,
		crossOriginEmbedderPolicy: false, //needed for images  https://stackoverflow.com/questions/70752770/helmet-express-err-blocked-by-response-notsameorigin-200
		crossOriginResourcePolicy: { policy: "cross-origin" },
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'", "*.exacttarget.com"],
				scriptSrc: ["'self'", "*.exacttarget.com"],
				objectSrc: ["'none'"],
				imgSrc: ["'self'", "*.exacttarget.com", "'unsafe-inline'"],
				styleSrc: ["'self'", "'unsafe-inline'"],
				frameAncestors: [
					"'self'",
					"*.exacttarget.com", // used for apps
					"*.marketingcloudapps.com" // used for journey builder
				],
				upgradeInsecureRequests: []
			}
		}
	})
);
// Rate Limit API requests
// we exclude routes ending with execute since these may be used
// thousands of times be Journey Builder in short period
app.use(
	/.*[^execute]$/,
	rateLimit({
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 1000
	})
);

app.use(
	/.*(?<!\/login)$/, //everything BUT login
	session({
		store: new FirestoreStore({
			dataset: new Firestore(),
			kind: "express-sessions"
		}),
		secret: process.env.SECRET_TOKEN,
		cookie: {
			secure: true, // this will set depending on connection being https OR http - making testing easier
			// 	// maxAge: 24 * 60 * 60 * 1000 // 24 hours
			sameSite: "none"
			// httpOnly: true
		},
		resave: false,
		saveUninitialized: false,
		genid: (req) => {
			// we use the session ID from state if provided, otherwise generate new
			if (req?.query?.state) {
				console.log("HAS STATE", req.query.state);
				return req.query.state;
			} else {
				const val = crypto.randomUUID();
				console.log("NEW ID", val);
				return val;
			}
		}
	})
);
app.use(express.static("dist"));

//default auth handlers here
const apiRoutes = express.Router();

apiRoutes.get("/context", (req, res) => {
	res.json(req.session.context);
});

const baseRoutes = express.Router();

function logme(req, res, next) {
	console.log("LOG OAUTHRESPONSE", req.path, req.query);
	console.log("LOG ACCESSTOKEN", req.session);
	next();
}

baseRoutes.get(
	"/:appname/oauth/response",
	logme,
	getAccessToken,
	logme,
	(req, res) => res.redirect(`/${req.params.appname}.html`)
);
//login path assumed for login to activity or app
baseRoutes.get("/:appname/login", getAuthRedirect);

const sfmcConfig = await data.getConfig("SFMC");
process.env.SFMC_JWT = sfmcConfig.SFMC_JWT;
process.env.SECRET_TOKEN = sfmcConfig.SECRET_TOKEN;
process.env.AUTH_URL = sfmcConfig.AUTH_URL;
process.env.CLIENT_ID = sfmcConfig.CLIENT_ID;

app.use("/salesforceNotification", salesforceNotifications);
app.use("/sfdc", sfdcRoutes);
app.use("/api", apiRoutes);
app.use("/", baseRoutes);
app.listen(PORT, () =>
	console.log(`✅  Server started: http://${HOST}:${PORT}`)
);
