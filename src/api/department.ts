import { validateRequestData, notifyBugsnag } from './../utils';
import { CreateAndUpdateDepartmentRequestSchema, QueryParamsSchemaWithIdOnly, departmentPaginationSchema } from './../common';
import { createDepartmentService, updateDepartmentService, getDepartmentListService } from '../services'


/**
 * create department
 * @param req Request
 * @param res Response
 */
export const createDepartment = async (req, res, next) => {
    try {
        // Validate request body
        await validateRequestData(CreateAndUpdateDepartmentRequestSchema, req.body);
        let response = await createDepartmentService(req.body, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

/**
 * update department
 * @param req Request
 * @param res Response
 */
export const updateDepartment = async (req, res, next) => {
    try {
        // Validate query params
        await validateRequestData(QueryParamsSchemaWithIdOnly, req.params);
        // Validate request body
        await validateRequestData(CreateAndUpdateDepartmentRequestSchema, req.body);
        let response = await updateDepartmentService(req.params.id, req.body, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

/**
 * get list of department
 * @param req Request
 * @param res Response
 */
export const getDepartmentList = async (req, res, next) => {
    try {
        let response = await getDepartmentListService(req.query, await validateRequestData(departmentPaginationSchema, req.query));
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};