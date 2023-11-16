import { addShiftHelper, getShiftHelper, updateShift, getShiftByWhereClause } from "../models";
import {
    ErrorCodes,
    ErrorResponse,
    MessageActions,
} from "./../common";
import { notifyBugsnag } from "../utils";

/**
 * Service to add shift.
 */
export const addShiftService = async (payload, loggedInUser) => {
    try {
        let exisitingShift = await getShiftByWhereClause({ name: payload.name, clientId: loggedInUser.client_id });
        if (exisitingShift) {
            return [400, ErrorResponse.ShiftAlreadyExists];
        }
        const data = {
            name: payload.name,
            clientId: loggedInUser.client_id,
            createdBy: loggedInUser.user_id,
            updatedBy: loggedInUser.user_id
        }
        let addShiftDetails = await addShiftHelper(data);
        if (!addShiftDetails) {
            return [404, ErrorResponse.ResourceNotFound];
        }
        return [
            201,
            {
                ok: true,
                message: MessageActions.CREATE_SHIFT,
                shift_id: parseInt(addShiftDetails.id),
            },
        ];
    } catch (err) {
        if (err.code === ErrorCodes.duplicateKeyError) {
            return [409, ErrorResponse.ClientAlreadyExists]    // Return 409 if worker already exists
        } else if (err.code === ErrorCodes.dbReferenceError) {
            return [404, ErrorResponse.ResourceNotFound]    // Return 404 if any foreign key contraint is not available in DB
        } else {
            notifyBugsnag(err);
            return [500, err.message]
        }
    }
};

/**
 * Service to edit shift.
 */
export const editShiftService = async (id, body, loggedInUser) => {
    try {
        let exisitingShift = await getShiftByWhereClause({ name: body.name, clientId: loggedInUser.client_id });
        if (exisitingShift) {
            return [400, ErrorResponse.ShiftAlreadyExists];
        }
        body.updatedBy = loggedInUser.user_id;
        body.updatedAt = new Date();
        await updateShift(id, body);
        return [
            201,
            {
                ok: true,
                message: MessageActions.UPDATE_SHIFT,
            },
        ];
    } catch (err) {
        notifyBugsnag(err);
        return [500, err.message]
    }
};

/**
 * Service to GET shift.
 */
export const getShiftService = async (requestArgs) => {
    try {
        let whereClause = `shift.client_id = ${requestArgs.client_id}`;
        if (requestArgs.site_id) {
            whereClause += ` AND site_id = ${requestArgs.site_id}`;
        }
        if (requestArgs.region_id) {
            whereClause += ` AND region_id = ${requestArgs.region_id}`;
        }
        let getShiftDetails = await getShiftHelper(whereClause);
        return [200, {
            "ok": true,
            "count": getShiftDetails.length,
            "shifts": getShiftDetails,
        }]
    } catch (err) {
        notifyBugsnag(err);
        return [500, err.message]
    }
};
