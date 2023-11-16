import { validateRequestData, notifyBugsnag } from './../utils';
import { CreateRateCardRequestSchema, UpdateRateCardRequestSchema, QueryParamsSchemaWithIdOnly, PaginationSchemaWithClientId, dropDownSchema } from './../common';
import { createRateCardService, updateRateCardService, getRateCardListService, rateCardDropDownService } from '../services'


/**
 * create Rate Card
 * @param req Request
 * @param res Response
 */
export const createRateCard = async (req, res, next) => {
    try {
        // Validate request body
        await validateRequestData(CreateRateCardRequestSchema, req.body);
        let response = await createRateCardService(req.body, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

/**
 * update Rate Card
 * @param req Request
 * @param res Response
 */
export const updateRateCard = async (req, res, next) => {
    try {
        // Validate query params
        await validateRequestData(QueryParamsSchemaWithIdOnly, req.params);
        // Validate request body
        await validateRequestData(UpdateRateCardRequestSchema, req.body);
        let response = await updateRateCardService(req.params.id, req.body, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

/**
 * get list of Rate Card
 * @param req Request
 * @param res Response
 */
export const getRateCardList = async (req, res, next) => {
    try {
        // Validate query params
        await validateRequestData(PaginationSchemaWithClientId, req.query);
        let response = await getRateCardListService(req.query.page, req.query.limit, req.query.client_id);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

/**
 * API to GET the rate-card for Drop down.
 * @param req
 * @param res
 * @param next
 */
export const rateCardDropDown = async (req, res, next) => {
    try {
        // Validate query params
        await validateRequestData(dropDownSchema, req.query);
        let response = await rateCardDropDownService(req.query.client_id);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};