import { validateRequestData, notifyBugsnag } from './../utils';
import { CreateJobRequestSchema, QueryParamsSchemaWithIdOnly, PaginationSchemaWithClientId, UpdateJobRequestSchema } from './../common';
import { createJobService, updateJobService, getJobListService, getJobListingForDropDownService, getJobNameListingForDropDownService } from '../services'


/**
 * create job
 * @param req Request
 * @param res Response
 */
export const createJob = async (req, res, next) => {
    try {
        // Validate request body
        await validateRequestData(CreateJobRequestSchema, req.body);
        let response = await createJobService(req.body, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

/**
 * update job
 * @param req Request
 * @param res Response
 */
export const updateJob = async (req, res, next) => {
    try {
        // Validate query params
        await validateRequestData(QueryParamsSchemaWithIdOnly, req.params);
        // Validate request body
        await validateRequestData(UpdateJobRequestSchema, req.body);
        let response = await updateJobService(req.params.id, req.body, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

/**
 * get list of job
 * @param req Request
 * @param res Response
 */
export const getJobList = async (req, res, next) => {
    try {
        // Validate query params
        await validateRequestData(PaginationSchemaWithClientId, req.query);
        let response = await getJobListService(req.query);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

/**
 * API to get the Job Listing for the dropdown.
 * @param req
 * @param res
 * @param next
 */
export const getJobListForDropDown = async (req, res, next) => {
    try {
        let response = await getJobListingForDropDownService(req.params.site_id);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to get the job name listing for the drop down.
 * @param req
 * @param res
 * @param next
 */
export const getJobNameListForDropDown = async (req, res, next) => {
    try {
        let response = await getJobNameListingForDropDownService(req.params.site_id);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}