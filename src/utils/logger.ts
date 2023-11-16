import * as winston from "winston";
import * as expressWinston from "express-winston";
const { createLogger, format, transports } = require('winston');
const WinstonGraylog2 = require('winston-graylog2');
import { config, graylogOptions, getSlackLoggerTransport } from "../configurations";
require('winston-daily-rotate-file');
const path = require('path');
import { addCustomData } from '.';
import { shouldIgnoreCustomeErrorLog } from '../common';
// const fs = require('fs');
import { loggerPath } from '../common/constants';

export const logTransports = [];

// if (!fs.existsSync(loggerPath)) {
//     fs.mkdirSync(loggerPath);
// }

/**
 * Add File logger. Create new logger file on daily basic as per the date.
 */
let addFileLogger = () => {
	logTransports.push(
		new (transports.DailyRotateFile)({
			filename: path.join(`${loggerPath}/log-%DATE%.log`),
			datePattern: 'YYYY-MM-DD',
			prepend: true,
			level: 'info',
			handleExceptions: true
		})
	);
}

/**
 * Enable loggers as per the configurations. 
 * Add file logs by default if none of the logger is enabled.
 */
if (config.ENABLE_CONSOLE_LOGGER) logTransports.push(new transports.Console({handleExceptions: true}));
if (config.ENABLE_FILE_LOGGER) addFileLogger();;
if (config.ENABLE_SLACK_ERROR_NOTIFICATION) logTransports.push(getSlackLoggerTransport());
if (config.grayLog.ENABLE_GRAYLOG) logTransports.push(new WinstonGraylog2(graylogOptions));
if (!logTransports) addFileLogger();


/**
 * Create logger object with the configured log-transports.
 */
export const logger = createLogger({
	format: format.combine(
		format.metadata(),
		format.json(),
	),
	transports: logTransports,
	expressFormat: true,
	meta: true,
	metaField: null,
	level: 'info',
	exitOnError: false
});


/**
 * Request Error logger initializer.
 */
export const expressWinstonRequestErrorLogger = () => {
	return expressWinston.errorLogger({
		transports: logTransports,
		format: winston.format.combine(
			winston.format.metadata(),
			addCustomData(),
			winston.format.json(),
		),
		meta: true,
		metaField: null,
		skip: function (req, res, err) {
			return shouldIgnoreCustomeErrorLog(err);
		}
	})
};
