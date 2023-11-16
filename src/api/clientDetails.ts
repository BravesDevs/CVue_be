import { validateRequestData, notifyBugsnag } from '../utils';
import { AddNewClientSchema, MimeType } from '../common';
import { addClient, updateClient, getSectorsService, getClientDetailsById, getAllClientDetails, getClientUsersService, addClientUsersService, updateClientUserService, siteAndClientRatingsService, workerTypeWiseSiteAndClientRatingService } from '../services'
import { AddClientUserSchema, clientRatingsSchema, PaginationSchema, updateClientParamsSchema, UpdateClientSchema, UpdateClientUserSchema, siteRatingsSchema } from '../common/schema';
import { config } from '../configurations';
const path = require("path");


/**
 * Renew access token as per the refresh-token
 * @param req Request
 * @param res Response
 */

export const addNewClients = async (req, res, next) => {
    try {
        let payload = req.body;
        payload["user_id"] = req.user.user_id;
        await validateRequestData(AddNewClientSchema, payload);
        let response = await addClient(payload, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

/**
 * API to update the client details.
 * @param req Request
 * @param res Response
 */
export const updateClients = async (req, res, next) => {
    try {
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
        let payload = req.body;
        payload["client_id"] = req.params.clientId;
        payload["user_id"] = req.user.user_id;
        await validateRequestData(UpdateClientSchema, payload);
        let response = await updateClient(payload, image, req.user);
        res.status(response[0]).json(response[1])
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * Get particular client details.
 * @param {any} res
 * @param {any} next
 * @returns {any}
 */
export const getClientById = async (req, res, next) => {
    try {
        let response = await getClientDetailsById(req.params.clientId);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * Get list of all client details.
 * @param {any} res
 * @param {any} next
 * @returns {any}
 */
export const getClients = async (req, res, next) => {
    try {
        await validateRequestData(PaginationSchema, req.query);
        let response = await getAllClientDetails(req.user, req.query);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * Get list of available sectors
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const getSectors = async (req, res, next) => {
    try {
        let response = await getSectorsService();
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * Get list of users created by client.
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const getClientUsers = async (req, res, next) => {
    try {
        let response = await getClientUsersService(req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to add the client sub-users for Site and Region.
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const addClientUsers = async (req, res, next) => {
    try {
        await validateRequestData(AddClientUserSchema, req.body);
        let response = await addClientUsersService(req.body, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to amend the client sub-users profile details.
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const updateClientUsers = async (req, res, next) => {
    try {
        await validateRequestData(updateClientParamsSchema, req.params);
        await validateRequestData(UpdateClientUserSchema, req.body);
        let response = await updateClientUserService(req.params.id, req.body, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to fetch the ratings of the client.
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const clientRatingsAPI = async (req, res, next) => {
    try {
        await validateRequestData(clientRatingsSchema, req.query);
        let response = await siteAndClientRatingsService(req.query, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to fetch the rating of client by worker type wise.
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const workerTypeWiseClientRatingsAPI = async (req, res, next) => {
    try {
        await validateRequestData(siteRatingsSchema, req.query);
        let response = await workerTypeWiseSiteAndClientRatingService(req.query);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}
