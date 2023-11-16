/**
 * All the common Utility methods which are used in the service.
 */
import * as winston from "winston";
const AWS = require('aws-sdk');
import { logger } from './logger';
import { BadRequestError } from '../common/errors';
import { config } from '../configurations';
import { MimeType, ErrorResponse } from '../common';
import { getAllSites } from '../services';
let moment = require('moment');
const jwt = require("jsonwebtoken");
const s3 = new AWS.S3({
    accessKeyId: config.ACCESS_KEY_ID,
    secretAccessKey: config.SECRET_ACCESS_KEY,
    region: config.S3_REGION
});
const JoiBase = require("joi");
const Bugsnag = require('@bugsnag/js');

// AWS.config.update()


export const addCustomData = winston.format(info => {
    // TODO: Identify and add extra req objects here
    try {
        info.metadata.correlation_id = info.metadata.req.headers['correlation_id'] || '-'
        info.metadata.user_id = info.metadata.req.headers['user_id'] || '-'
        info.metadata.path_info = info.metadata.req.url || '-'
        info.metadata.user_agent = info.metadata.req.headers['user-agent'] || '-'
        info.metadata.method = info.metadata.req.method || '-'
    } catch (error) {
        logger.debug("Correlation ID not found", { 'error': error });
    }
    return info;
});


/**
 * Ignore log messages if they have { private: true }
 * @param  {} (info
 * @param  {} opts
 */
export const ignorePrivate = winston.format((info, opts) => {
    if (info.private) { return false; }
    return info;
});


/**
 * Return response for system status APIs.
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const service_status = (req, res, next) => {
    res.status(204).json();
}


/**
 * Validate Payload with the Joi schema
 * @param  {} joiSchema
 * @param  {} payload
 */
export const validateRequestData = async (joiSchema, payload, isArrayValidation = false) => {
    let validatedData = isArrayValidation ? await JoiBase.array().items(joiSchema).validate(payload) : joiSchema.validate(payload);

    // Return validated data if validated data doen't contain any error.
    if (!validatedData.error) return validatedData.value;

    // Throw bad request if schema validation gets failed.
    throw new BadRequestError(
        "BAD_REQUEST",
        validatedData.error.details ? fetchJoiSchemaValidationErrors(validatedData.error.details) : validatedData.error.message
    );
};


/**
 * Remove extra fields context and type from Joi schema error details
 * @param  {} data
 */
let fetchJoiSchemaValidationErrors = (data) => {
    data.forEach((obj) => {
        delete obj.context;
        delete obj.type;
    });
    return data;
};


/**
 * Return object with required headers
 * @param  {} correlation_id
 * @param  {} request_user_id
 */
export let getHeaders = (correlation_id, request_user_id) => {
    return {
        'CORRELATION_ID': correlation_id,
        'USER_ID': request_user_id.toString(),
        'Content-Type': "application/json",
    }
}


/**
 * Return whole API endpoint with combining port, host and endpoint
 * @param  {} endpoint
 * @param  {} host
 * @param  {} port
 */
export const getEndpoint = (endpoint, host, port) => {
    return `http://${host}:${port}/${endpoint}`
}


/**
 * Validate token and return decoded token data.
 * @param  {string} token
 */
export const verifyJwtToken = (token: string) => {
    try {
        token = token.replace("Bearer ", "");
        let tokenData = jwt.verify(token, config.JWT_TOKEN_KEY);

        // Remove extra JWT token keys
        delete tokenData.iat;
        delete tokenData.exp;

        // Return user object data
        return tokenData;
    } catch (err) {
        return null;
    }
};

export const getSignedUrlForGetObject = async (bucket, folder, fileName) => {
    try {
        const params = {
            Bucket: bucket,
            Key: `${folder}/${fileName}`,
            Expires: config.SIGNED_URL_EXPIRE_TIME
        };
        const url = s3.getSignedUrl('getObject', params);
        return {
            url,
        };
    } catch (error) {
        notifyBugsnag(error);
        throw error;
    }
}

export const getObject = async (bucket, folder, fileName) => {
    try {
        const params = {
            Bucket: bucket,
            Key: `${folder}/${fileName}`,
        };
        return (await (s3.getObject(params).promise())).Body;
    } catch (error) {
        notifyBugsnag(error);
        throw error;
    }
}

export const getSignedUrlForPutObject = async (bucket, folder, fileName, fileType, expireSeconds = 1800, ACL = 'bucket-owner-full-control') => {
    try {
        const contentType = MimeType[fileType.toUpperCase()];
        const params = {
            Bucket: bucket,
            Key: `${folder}/${fileName}`,
            Expires: expireSeconds,
            ACL,
            ContentType: contentType,
        };
        const promise = new Promise((resolve, reject) => {
            s3.getSignedUrl('putObject', params, (err, uri) => (err ? reject(err) : resolve(uri)));
        });
        const url = await promise;
        return {
            url,
            contentType,
        };
    } catch (error) {
        notifyBugsnag(error);
        throw error;
    }
}

export const uploadFileOnS3 = async (bucket, folder, fileName, fileType, fileContent) => {
    try {
        const contentType = MimeType[fileType.toUpperCase()];
        const params = {
            Bucket: bucket,
            Key: `${folder}/${fileName}`,
            Body: fileContent,
            ContentType: contentType,
        };
        const promise = new Promise((resolve, reject) => {
            s3.upload(params, (err, data) => (err ? reject(err) : resolve(data.Location)));
        });
        const s3Data = await promise;
        return {
            location: s3Data,
            contentType,
        };
    } catch (error) {
        notifyBugsnag(error);
        throw error;
    }
}

export const deleteObject = async (bucket, folder, fileName) => {
    try {
        const params = {
            Bucket: bucket,
            Key: `${folder}/${fileName}`,
        };
        const promise = new Promise((resolve, reject) => {
            s3.deleteObject(params, (err, data) => (err ? reject(err) : resolve(data)));
        });
        await promise;
    } catch (error) {
        notifyBugsnag(error);
        throw error;
    }
}

export const snakeCaseToCamelCase = (key) => {
    return key.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
}

export const getOffsetAsPerPage = (page: number, limit: number) => {
    return (page - 1) * limit + 1
}

export const getWeeksOfTwoDates = (startDate: string, endDate: string = moment.utc()) => {
    return moment(endDate || moment.utc()).diff(startDate, "week") + 1;
}

export const dayRangeAsPerDayCount = (count: number) => {
    switch (true) {
        case (1 <= count && count <= 2): {
            return '1-2'
        }
        case (3 <= count && count <= 4): {
            return '3-4'
        }
        case (5 <= count && count <= 8): {
            return '5-8'
        }
        case (9 <= count && count <= 12): {
            return '9-12'
        }
        case (13 <= count && count <= 16): {
            return '13-16'
        }
        case (17 <= count && count <= 26): {
            return '17-26'
        }
        case (27 <= count && count <= 52): {
            return '27-52'
        }
        case (52 <= count): {
            return '52+'
        }
    }
};

export const removeKeyFromObject = (existingKey: string, newKey: string, objectValue: any) => {
    objectValue[newKey] = objectValue[existingKey];
    delete objectValue[existingKey];
    return objectValue
}

export const objectToMySQLConditionString = (obj: any, whereClauseString: string = "") => {
    for (let key in obj) {
        whereClauseString += key + "=" + obj[key] + " AND "
    }
    return whereClauseString ? whereClauseString.substring(0, whereClauseString.length - 4) : "";
};

export const getWeekWiseWorkingDays = arr => {
    let arrayLength = arr.filter(x => x > 0).length;
    return (1 <= arrayLength && arrayLength <= 3) ? '1-3' : (arrayLength >= 4) ? '4+' : null
}


export const notifyBugsnag = (error, url = '') => {
    logger.info("error", {
        message: error.message
    })
    const errorKeys = Object.keys(ErrorResponse);
    const errorCodes = [];
    errorKeys.map((key) => {
        errorCodes.push(ErrorResponse[key].error);
    });
    if (!errorCodes.includes(error.error)) {
        Bugsnag.addMetadata('request', { url: url })
        Bugsnag.notify(error);
    }
}

export const snakeCaseToPascalCase = (key) => {
    let camelCase = snakeCaseToCamelCase(key);
    return camelCase[0].toUpperCase() + camelCase.substr(1);
}

/**
 * Convert array to object
 * @param  {} arr
 * @param  {} key
 */
export const arrayToObject = (arr, key) => Object.assign({}, ...arr.map(item => ({ [item[key]]: item })))


/**
 * Convert array of objects to objects
 * @param  {} payload
 * @param  {} key
 * @param  {} valueKey
 */
export const arrayOfObjectsToObject = (payload, key, valueKey) => {
    return Object.assign({}, ...payload.map(state => { 
        return { [state[key]]: state[valueKey] } 
      }))
}

export const getWeeklabels = (numberOfWeeks) => {
    let weeks = [];
    for (let i = 1; i <= numberOfWeeks; i++) {
        weeks.push("Week " + i);
    }
    return weeks;
}

/**
 * Cast value to the number and return 0 if value is not valid num
 * @param  {} value
 */
export const getNumberValue = (value) => {
    return parseFloat(value) || 0;
}


export const addTrendsAnalysisRegion = async (selectQuery, region_id, client_id) => {
    if (region_id) {
        let siteDetails: any = await getAllSites(client_id, region_id);
        let site = siteDetails[1].sites;
        site.map((key) => {
            selectQuery = selectQuery.andWhere(`site_id = ('${key.id}')`)
        });
    }
    return selectQuery;
}

export const objectToMySQLConditionStrings = (obj: any, whereClauseString: string = "") => {
    for (let key in obj) {
        if (key == 'client_id') {
            whereClauseString += "time_and_attendance_data." + key + "=" + obj[key] + " AND "
        } else if (key == 'region_id') {
            whereClauseString += "site." + key + "=" + obj[key] + " AND "
        } else {
            whereClauseString += key + "=" + obj[key] + " AND "
        }
    }
    return whereClauseString ? whereClauseString.substring(0, whereClauseString.length - 4) : "";
};

export const objectToMySQLConditionStringForTAData = (obj: any, whereClauseString: string = "") => {
    for (let key in obj) {
        whereClauseString += "tadata." + key + "=" + obj[key] + " AND "
    }
    return whereClauseString ? whereClauseString.substring(0, whereClauseString.length - 4) : "";
};