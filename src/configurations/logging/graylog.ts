import { config } from './../config';

const graylogConfig = {
    servers: [{
        host: config.grayLog.GRAYLOG_HOST,
        port: config.grayLog.GRAYLOG_PORT
    }],
    hostname: config.APP_NAME,
    facility: config.PRODUCT_NAME,
    bufferSize: 1400
};
  
export const graylogOptions = {
    name: config.APP_NAME,
    level: 'debug',
    silent: false,
    handleExceptions: true,
    graylog: graylogConfig,
    staticMeta: {environment: config.ENVIRONMENT, app: config.APP_NAME}
};
