const axios = require('axios');

import { logger } from './logger'
import { InternalServerError } from './../common';

/**
 * Invoke requested endpoint with the provided data.
 * Throw INTERNAL_SERVER_ERROR if API response in not coming within timeout time.
 * @param  {string} endPoint
 * @param  {string} method
 * @param  {object=null} headers
 * @param  {object=null} requestPayload
 * @param  {number=61000} timeout
 * @returns {[number, object]} Returns API response status code and JSON data 
 */
export const invokeApi = async (
    endPoint: string,
    method: string,
    headers: object = null,
    requestPayload: object = null,
    timeout: number = 61000) => {
        let configData = {
            method: method,
            url: endPoint,
            headers: headers,
            data: requestPayload,
            timeout: timeout
        }
    return await axios(configData).then((response) => {
        return [response.status, response.data || {}];
    }).catch((error) => {
        logger.info("Got Error response while invoking API.", {
            endPoint: endPoint,
            method: method,
            requestPayload: requestPayload,
            timeout: timeout,
            error: error
        });
        // Throw INTERNAL_SERVER_ERROR if API response doesn't come within timeout time
        if (error.code === 'ECONNABORTED' || error.code === "ENOTFOUND") {
            logger.info("Error: API invokation.", configData)
            throw new InternalServerError(
                "INTERNAL_SERVER_ERROR",
                "Something went wrong while processing your request."
            )
            }
        else
            return [error.response.status, error.response.data || {}];
    })
};
