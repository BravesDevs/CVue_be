import { AddAndUpdateRegionSchema, QueryParamsSchemaWithIdOnly } from '../common/schema';
import { addNewRegion, getRegionByClient, updateRegionService, getRegionDropDownService } from '../services';
import { validateRequestData, notifyBugsnag } from './../utils';

/**
 * API to add the new region.
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const addRegion = async (req, res, next) => {
    try {
        let payload = req.body;
        await validateRequestData(AddAndUpdateRegionSchema, payload);
        let response = await addNewRegion(payload, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};


/**
 * API to get the regions from client id.
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const getRegionByClientId = async (req, res, next) => {
    try {
        let response = await getRegionByClient(req.query.client_id, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

export const getRegionDropDown = async (req, res, next) => {
    try {
        let response = await getRegionDropDownService(req.query.client_id);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

/**
 * update region
 * @param req Request
 * @param res Response
 */
export const updateRegion = async (req, res, next) => {
    try {
        // Validate query params
        await validateRequestData(QueryParamsSchemaWithIdOnly, req.params);
        // Validate request body
        await validateRequestData(AddAndUpdateRegionSchema, req.body);
        let response = await updateRegionService(req.params.id, req.body, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

