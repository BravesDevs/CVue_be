/**
 * wrap all requests through this middleware
 * log request and response
 */

import { logger } from "../utils";
import { sensitiveData } from "../common/constants";
import _ from "lodash";

const requestLogger = (req, res, next) => {
	let routeIgnorelist = ['/k8/readiness', '/k8/liveness'];
	if (routeIgnorelist.indexOf(req.originalUrl || req.url) == -1) {
		logger.info("Request-Start", {
			// 'headers': req.headers,
			'user_id': req.headers['user_id'] || '-',
			'path_info': req._parsedUrl.pathname || '-',
			'query_string': req._parsedUrl.query || '-',
			'method': req.method || '-',
			'ip_address': req.headers['x-forwarded-for'] || req.socket.remoteAddress || '-',
			'user-agent': req.headers['user-agent'] || '-',
			'body': _.omit(req.body, sensitiveData) || '-'
		});

		res.on('finish', () => {
			logger.info("Request-End", {
				'headers': res._header,
				'method': req.method || '-',
				'ip_address': req.headers['x-forwarded-for'] || req.socket.remoteAddress || '-',
				'status_code': res.statusCode,
				'status_message': res.statusMessage
			})
		});
	}

	next();
};

export default requestLogger;
