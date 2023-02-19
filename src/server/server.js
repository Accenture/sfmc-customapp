import { logger } from "./utils.js";
import { Firestore } from "@google-cloud/firestore";
import { FirestoreStore } from "@google-cloud/connect-firestore";
import { getAuthRedirect, getAccessToken } from "./auth.js";
import { sfdcRoutes } from "./adminApp/sfdc.js";
import { salesforceNotifications } from "./salesforceNotifications/activity.js";
import { dataAssessor } from "./dataAssessor/app.js";
import { dataViewer } from "./dataViewer/app.js";
import compression from "compression";
import helmet from "helmet";
import express from "express";
import bodyParser from "body-parser";
import { JourneySessionAuthentication } from "./auth.js";
import crypto from "node:crypto";
import * as dotenv from "dotenv";

import session from "express-session";
import rateLimit from "express-rate-limit";
import * as data from "./data.js"; // this file should be replaced spending on your data store for settings/caching

const HOST = process.env.API_HOST || "localhost";
const PORT = process.env.PORT || 3000;
const apiRoutes = express.Router();
const baseRoutes = express.Router();

if (
	process.env.NODE_ENV === "production" ||
	process.argv.includes("--production")
) {
	process.env.NODE_ENV = "production";
} else {
	process.env.NODE_ENV = "development";
	dotenv.config();
}

//settings used for app login
const sfmcConfig = await data.getConfig("SFMC");
process.env.SFMC_JWT = sfmcConfig.SFMC_JWT;
process.env.SECRET_TOKEN = sfmcConfig.SECRET_TOKEN;
process.env.AUTH_URL = sfmcConfig.AUTH_URL;
process.env.CLIENT_ID = sfmcConfig.CLIENT_ID;

const app = express();

app.use((req, res, next) => {
	logger.info(req.path, req.body);
	next();
});

app.set("trust proxy", 1); // needed where server is not https itself (ie. with tunnel proxy)
app.use(compression());
app.use(express.static("./node_modules/@salesforce-ux/design-system/assets"));
app.use(express.static("./node_modules/@avonni/base-components/static")); //has slds illustrations in
app.use(express.static("dist"));
app.use(express.static("./src/resources"));

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
	/.*[^cetux]$/,
	rateLimit({
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 1000
	})
);

//login path before session being set
baseRoutes.get("/:appname/login", getAuthRedirect);
baseRoutes.get("/:appname/oauth/response", getAccessToken, (req, res) =>
	res.redirect(`/${req.params.appname}.html`)
);

app.use(
	session({
		store: new FirestoreStore({
			dataset: new Firestore(),
			kind: "express-sessions"
		}),
		secret: process.env.SECRET_TOKEN,
		cookie: {
			secure: true, // this will set depending on connection being https OR http - making testing easier
			maxAge: 20 * 60 * 1000, // 20 minutes
			sameSite: "none" //using lax and strict will result in cookies not being set inside of mc iframe
			// httpOnly: true
		},
		resave: false,
		saveUninitialized: false,
		genid: (req) => {
			// we use the session ID from state if provided, otherwise generate new

			if (req?.query?.state) {
				return req.query.state;
			} else {
				return crypto.randomUUID();
			}
		}
	})
);

// force login
app.use((req, res, next) => {
	if (req.url.endsWith(".html") && !req.session.auth) {
		res.redirect(req.url.replace(".html", "/login"));
	} else {
		next();
	}
});
app.use(express.static("./src/html"));

apiRoutes.get("/context", (req, res) => {
	res.json(req.session.context);
});

app.use("/salesforceNotification", salesforceNotifications);
app.use("/dataAssessor", dataAssessor);
app.use("/dataViewer", dataViewer);

app.use("/sfdc", sfdcRoutes);
app.use("/api", apiRoutes);
app.use("/", baseRoutes);

app.listen(PORT, () =>
	logger.info(`✅  Server started: http://${HOST}:${PORT}`)
);
