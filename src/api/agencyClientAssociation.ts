import { validateRequestData, notifyBugsnag } from './../utils';
import { CreateAgencyAssociationRequestSchema, UpdateAgencyAssociationRequestSchema, QueryParamsSchemaWithIdOnly } from './../common';
import { createAgencyAssociationService, updateAgencyAssociationService, getAgencyAssociationListService } from '../services'

/**
 * create agency
 * @param req Request
 * @param res Response
 */
export const createAgencyAssociation = async (req, res, next) => {
    try {
        // Validate request body
        await validateRequestData(CreateAgencyAssociationRequestSchema, req.body);
        let response = await createAgencyAssociationService(req.body, req.user);
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
export const updateAgencyAssociation = async (req, res, next) => {
    try {
        // Validate query params
        await validateRequestData(QueryParamsSchemaWithIdOnly, req.params);
        // Validate request body
        await validateRequestData(UpdateAgencyAssociationRequestSchema, req.body);
        let response = await updateAgencyAssociationService(req.params.id, req.body, req.user);
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
export const getAgencyAssociationList = async (req, res, next) => {
    try {
        // Validate query params
        // await validateRequestData(PaginationSchema, req.query);
        let response = await getAgencyAssociationListService(req.query, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};
