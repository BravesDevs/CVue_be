import { AddAndEditNewShiftSchema, dropDownSchema, QueryParamsSchemaWithIdOnly } from '../common';
import { addShiftService, getShiftService, editShiftService } from '../services';
import { validateRequestData, notifyBugsnag } from './../utils';

/**
 * API to add the shift.
 * @param req Request
 * @param res Response
 */
export const addShift = async (req, res, next) => {
    try {
        await validateRequestData(AddAndEditNewShiftSchema, req.body);
        let response = await addShiftService(req.body, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};
/**
 * API to edit the shift.
 * @param req Request
 * @param res Response
 */
export const editShift = async (req, res, next) => {
    try {
        await validateRequestData(QueryParamsSchemaWithIdOnly, req.params);
        await validateRequestData(AddAndEditNewShiftSchema, req.body);
        let response = await editShiftService(req.params.id, req.body, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

/**
 * API to get the shifts.
 * @param req Request
 * @param res Response
 */
export const getShifts = async (req, res, next) => {
    try {
        await validateRequestData(dropDownSchema, req.query);
        let response = await getShiftService(req.query);
        res.status(response[0]).json(response[1])
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}
