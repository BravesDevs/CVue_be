import { validateRequestData } from './../utils';
import { CreateAgencyRequestSchema, UpdateAgencyRequestSchema, QueryParamsSchemaWithIdOnly, PaginationSchema, MimeType, agencyRatingsSchema, detailedAgencyRatingsSchema, AddClientUserSchema, updateClientParamsSchema, UpdateClientUserSchema } from './../common';
import { createAgencyService, updateAgencyService, getAgencyListService, getAgencyByIdService, agencyRatingsService, detailedAgencyRatingsService, addAgencyUsersService, updateAgencyUserService, getAgencyUsersService } from '../services';
import { notifyBugsnag } from '../utils';
import { config } from '../configurations';

const path = require("path");

/**
 * create agency
 * @param req Request
 * @param res Response
 */
export const createAgency = async (req, res, next) => {
    try {
        // Validate request body
        await validateRequestData(CreateAgencyRequestSchema, req.body);
        let response = await createAgencyService(req.body, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

/**
 * update agency
 * @param req Request
 * @param res Response
 */
export const updateAgency = async (req, res, next) => {
    try {
        // Validate query params
        await validateRequestData(QueryParamsSchemaWithIdOnly, req.params);
        // Validate request body
        await validateRequestData(UpdateAgencyRequestSchema, req.body);

        let image = null;
        if (req.files) {
            if (req.files.profile.mimetype !== MimeType.JPG &&
                req.files.profile.mimetype !== MimeType.PNG) {
                return res.status(400).json({
                    "status": 400,
                    "ok": false,
                    "message": "Invalid file type.",
                    "error": "BAD_REQUEST"
                })
            }
            if (req.files.profile.size > config.MAX_IMAGE_SIZE) {
                return res.status(400).json({
                    "status": 400,
                    "ok": false,
                    "message": "File size is more than 5 MB",
                    "error": "BAD_REQUEST"
                })
            }
            let ext = path.extname(req.files.profile.name);
            image = {
                data: req.files.profile.data,
                mime: req.files.profile.mimetype,
                extension: ext
            };
        }
        let response = await updateAgencyService(req.params.id, req.body, req.user, image);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

/**
 * get list of agency
 * @param req Request
 * @param res Response
 */
export const getAgencyList = async (req, res, next) => {
    try {
        // Validate query params
        await validateRequestData(PaginationSchema, req.query);
        let response = await getAgencyListService(req.user, req.query);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

/**
 * get agency by Id
 * @param req Request
 * @param res Response
 */
export const getAgencyById = async (req, res, next) => {
    try {
        // Validate query params
        await validateRequestData(QueryParamsSchemaWithIdOnly, req.params);
        let response = await getAgencyByIdService(req.params.id);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

/**
 * Agency Ratings API.
 * @param req Request
 * @param res Response
 */
export const agencyRatingsAPI = async (req, res, next) => {
    try {
        // Validate query params
        await validateRequestData(agencyRatingsSchema, req.query);
        let response = await agencyRatingsService(req.query, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

/**
 * Agency Ratings API.
 * @param req Request
 * @param res Response
 */
export const detailedAgencyRatingsAPI = async (req, res, next ) => {
    try {
        // Validate query params
        await validateRequestData(detailedAgencyRatingsSchema, req.query);
        let response = await detailedAgencyRatingsService(req.query, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

/**
 * Add Agency Users API.
 * @param req Request
 * @param res Response
 */
export const addAgencyUsers = async (req, res, next) => {
    try {
        await validateRequestData(AddClientUserSchema, req.body);
        let response = await addAgencyUsersService(req.body, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * Update Agency Users API.
 * @param req Request
 * @param res Response
 */
export const updateAgencyUsers = async (req, res, next) => {
    try {
        await validateRequestData(updateClientParamsSchema, req.params);
        await validateRequestData(UpdateClientUserSchema, req.body);
        let response = await updateAgencyUserService(req.params.id, req.body, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * Get list of users created by agency.
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const getAgencyUsers = async (req, res, next) => {
    try {
        // Validate query params
        await validateRequestData(detailedAgencyRatingsSchema, req.query);
        let response = await getAgencyUsersService(req.query, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}
