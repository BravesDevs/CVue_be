import { ErrorResponse } from "../common/errors";
import { verifyJwtToken } from "../utils";
import { config } from "../configurations";

/**
 * Method to verify JWT token
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const authorizeJwtToken = (req, res, next) => {
	let token = req.headers["authorization"];

	// Return Forbidden error response if token is not provided
	if (!token) {
		return res.status(403).send(ErrorResponse.Forbidden);
	}

	token = token.replace("Bearer ","");
	let tokenData = verifyJwtToken(token);

	if (!tokenData) {
		// Return unauthorized error response if token is not valid
		return res.status(401).send(ErrorResponse.Unauthorized);
	}
	req.user = tokenData;
	return next();
};


/**
 * Method to verify required authentication for scheduler events
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
 export const schedulerEventsAuth = (req, res, next) => {
	let token = req.headers["authorization"];

	// Return Forbidden error response if token is not provided
	if (!token) {
		return res.status(403).send(ErrorResponse.Forbidden);
	}

	if (token !== config.CRONJOB_ACCESS_TOKEN) {
		return res.status(401).send(ErrorResponse.CronJobUnauthorizedError);
	}
	return next();
};
