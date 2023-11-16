import { validateRequestData, notifyBugsnag } from './../utils';
import { CreateAndUpdateSectorRequestSchema, QueryParamsSchemaWithIdOnly } from './../common';
import { createSectorService, updateSectorService, getSectorListService } from '../services'


/**
 * create sector
 * @param req Request
 * @param res Response
 */
export const createSector = async (req, res, next) => {
    try {
        // Validate request body
        await validateRequestData(CreateAndUpdateSectorRequestSchema, req.body);
        let response = await createSectorService(req.body, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

/**
 * update sector
 * @param req Request
 * @param res Response
 */
export const updateSector = async (req, res, next) => {
    try {
        // Validate query params
        await validateRequestData(QueryParamsSchemaWithIdOnly, req.params);
        // Validate request body
        await validateRequestData(CreateAndUpdateSectorRequestSchema, req.body);
        let response = await updateSectorService(req.params.id, req.body, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

/**
 * get list of sector
 * @param req Request
 * @param res Response
 */
export const getSectorList = async (req, res, next) => {
    try {
        // Validate query params
        // await validateRequestData(PaginationSchema, req.query);
        let response = await getSectorListService();
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};