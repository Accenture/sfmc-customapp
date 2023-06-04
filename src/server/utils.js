import winston from "winston";
/* 
levels
    error: 0, 
    warn: 1, 
    info: 2, 
    http: 3,
    verbose: 4, 
    debug: 5, 
    silly: 6
*/
import jwt from "jsonwebtoken";

export const logger = winston.createLogger({
	format: winston.format.json(),
	defaultMeta: { service: "sfmc-lwcactivity" },
	transports: [
		new winston.transports.Console({
			level: process.env.LOG_LEVEL || "info",
			handleExceptions: true,
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.simple()
			)
		})
	]
});

export function decodeJwt(req, res, next) {
	if (!req.body) {
		res.status(500).send("Body was empty");
	}
	if (!process.env.SFMC_JWT) {
		res.status(500).send("JWT Signature not found to decode");
	}
	try {
		req.body = jwt.verify(req.body.toString("utf8"), process.env.SFMC_JWT, {
			algorithm: "HS256"
		});
		return next();
	} catch (error) {
		console.error("JWT ERROR", error);
		console.error("JWT PAYLOAD", req.body);
		console.error("JWT KEY", process.env.SFMC_JWT);

		res.status(401).send("JWT was not correctly signed");
	}
}
