const _ = require('lodash');
import { AddAndUpdateRegionDTO, ErrorResponse, ErrorCodes } from "../common";
import { addRegion, getClientRegion, getRegionById, updateRegion, getRegionForDropdown } from "../models";
import { MessageActions, UserType } from "./../common";
import { notifyBugsnag } from '../utils'

/**
 * Service to add new region
 * @param  {AddAndUpdateRegionDTO} payload
 */
export const addNewRegion = async (payload: AddAndUpdateRegionDTO, loggedInUser) => {
    try {
        const data = {
            name: payload.name,
            clientId: payload.client_id,
            createdBy: loggedInUser.user_id,
            updatedBy: loggedInUser.user_id,
        }
        let regionDetails = await addRegion(data);
        if (!regionDetails) {
            return [404, ErrorResponse.ResourceNotFound];
        }
        return [
            201,
            {
                ok: true,
                message: MessageActions.CREATE_REGION,
                region_id: parseInt(regionDetails.id)
            },
        ];
    } catch (err) {
        if (err.code === ErrorCodes.duplicateKeyError) {
            return [409, ErrorResponse.RegionAlreadyExists]    // Return 409 if worker already exists
        } else if (err.code === ErrorCodes.dbReferenceError) {
            return [404, ErrorResponse.ResourceNotFound]    // Return 404 if any foreign key contraint is not available in DB
        } else {
            notifyBugsnag(err);
            return [500, err.message]
        }
    }
};

/**
 * Service to GET regions by client.
 */
export const getRegionByClient = async (clientId, loggedInUser) => {
    try {
        if (!clientId) {
            return [400, ErrorResponse.BadRequestError];
        }
        let filter = { clientId };
        if (loggedInUser.user_type_id == UserType.CLIENT_REGIONAL) {
            _.extend(filter, { adminId: loggedInUser.user_id });
        }
        else if (loggedInUser.user_type_id == UserType.CLIENT_ADMIN || loggedInUser.user_type_id == UserType.AGENCY_ADMIN) {
            filter = filter;
        }
        let regionDetails = await getClientRegion(filter);
        if (!regionDetails) {
            return [404, ErrorResponse.ResourceNotFound];
        }
        return [
            200,
            {
                ok: true,
                region_details: regionDetails
            },
        ];
    } catch (err) {
        if (err.code === ErrorCodes.dbReferenceError) {
            return [404, ErrorResponse.ResourceNotFound]    // Return 404 if any foreign key contraint is not available in DB
        } else {
            notifyBugsnag(err);
            return [500, err.message]
        }
    }
};

/**
 * update region.
 * @param  {id}
 * @param  {CreateAndUpdateDepartmentDTO} payload
 */
export const updateRegionService = async (id: string, payload: AddAndUpdateRegionDTO, loggedInUser) => {
    let regionToUpdate = await getRegionById(id);

    if (!regionToUpdate) {
        return [404, ErrorResponse.ResourceNotFound];
    }
    const regionPayload = {
        name: payload.name,
        clientId: payload.client_id,
        updatedBy: loggedInUser.user_id,
    }
    let region = await updateRegion(id, regionPayload);
    return [200, {
        ok: true,
        message: MessageActions.UPDATE_REGION,
        region_id: region.id
    }];
};

/**
 * Service to GET region for drop-down.
 */
export const getRegionDropDownService = async (clientId: number) => {
    let regionDetails = await getRegionForDropdown(clientId);
    return [
        200,
        {
            ok: true,
            regions: regionDetails
        },
    ];
};