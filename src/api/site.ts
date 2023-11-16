import { addAndUpdateSiteSchema, detailedSiteRatingsSchema, QueryParamsSchemaWithIdOnly, siteRatingsSchema } from '../common';
import { addNewSite, getAllSites, updateSiteService, getSitesDropDownService, siteAndClientRatingsService, detailedSiteRatingsService, workerTypeWiseSiteAndClientRatingService } from '../services';
import { validateRequestData, notifyBugsnag } from './../utils';

/**
 * API to add the new site.
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const addSite = async (req, res, next) => {
    try {
        await validateRequestData(addAndUpdateSiteSchema, req.body);
        let response = await addNewSite(req.body, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

/**
 * API for the site listing.
 * @param req
 * @param res
 * @param next
 */
export const getSites = async (req, res, next) => {
    try {
        let response = await getAllSites(req.query.client_id, req.query.region_id);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

/**
 * API to get the site listing for drop-down.
 * @param req
 * @param res
 * @param next
 */
export const getSitesDropDown = async (req, res, next) => {
    try {

        // Validate query params
        await validateRequestData(detailedSiteRatingsSchema, req.params);
        let response = await getSitesDropDownService(req.query);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};


/**
 * update site
 * @param req Request
 * @param res Response
 */
export const updateSite = async (req, res, next) => {
    try {
        // Validate query params
        await validateRequestData(QueryParamsSchemaWithIdOnly, req.params);
        // Validate request body
        await validateRequestData(addAndUpdateSiteSchema, req.body);
        let response = await updateSiteService(req.params.id, req.body, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};


/**
 * Site Ratings API.
 * @param req Request
 * @param res Response
 */
export const siteRatingsAPI = async (req, res, next) => {
    try {
        //Validate the request data.
        await validateRequestData(siteRatingsSchema, req.query)
        let response = await siteAndClientRatingsService(req.query, req.user);
        res.status(response[0]).json(response[1]);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * Site Ratings API.
 * @param req Request
 * @param res Response
 */
export const detailedSiteRatingsAPI = async (req, res, next) => {
    try {
        //Validate the request data.
        await validateRequestData(detailedSiteRatingsSchema, req.query)
        let response = await detailedSiteRatingsService(req.query, req.user);
        res.status(response[0]).json(response[1]);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to fetch the rating of site by worker type wise.
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const workerTypeWiseSiteRatingsAPI = async (req, res, next) => {
    try {
        await validateRequestData(siteRatingsSchema, req.query);
        let response = await workerTypeWiseSiteAndClientRatingService(req.query);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

