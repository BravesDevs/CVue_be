/**
 * All the service layer methods for the Agency Client Association.
 */
import { CreateAgencyAssociationDTO, UpdateAgencyAssociationDTO, ErrorResponse, MessageActions } from "./../common";
import {
    createAgencyAssociation, updateAgencyAssociation, getAgencyAssociationList,
    getAgencyAssociationById, getAgencyAssociationByAgencyIdAndClientId
} from "./../models";
import { UserType } from '../common';
import { notifyBugsnag } from '../utils'

/**
 * create agencyAssociation.
 * @param  {CreateAgencyAssociationDTO} payload
 */
export const createAgencyAssociationService = async (payload: CreateAgencyAssociationDTO, loggedInUser) => {
    try {
        const existingAssociation = await getAgencyAssociationByAgencyIdAndClientId(payload.agency_id, payload.client_id)
        if (existingAssociation) {
            return [409, ErrorResponse.AssociationAlreadyExists]
        }
        if (parseInt(loggedInUser.user_type_id) === UserType.CLIENT_ADMIN && loggedInUser.user_id != payload.client_id) {
            return [403, ErrorResponse.AssociationPermissionDenied]
        }
        const agencyAssociationPayload = {
            clientId: payload.client_id,
            agencyId: payload.agency_id,
            margin: payload.margin,
            currency: payload.currency,
            createdBy: loggedInUser.user_id,
            updatedBy: loggedInUser.user_id,
        }
        let agencyAssociation = await createAgencyAssociation(agencyAssociationPayload);
        return [201, {
            ok: true,
            message: MessageActions.CREATE_AGENCY_ASSOCIATION,
            agency_association_id: agencyAssociation.id
        }];
    } catch (error) {
        notifyBugsnag(error);
        return [500, error.message]
    }
};

/**
 * update agencyAssociation.
 * @param  {id}
 * @param  {UpdateAgencyAssociationDTO} payload
 */
export const updateAgencyAssociationService = async (id: string, payload: UpdateAgencyAssociationDTO, loggedInUser) => {
    let agencytoUpdate = await getAgencyAssociationById(id);

    if (!agencytoUpdate) {
        return [404, ErrorResponse.ResourceNotFound];
    }
    const agencyAssociationPayload = {
        clientId: payload.client_id,
        agencyId: payload.agency_id,
        margin: payload.margin,
        currency: payload.currency,
        updatedBy: loggedInUser.user_id,
    }
    let agencyAssociation = await updateAgencyAssociation(id, agencyAssociationPayload);
    return [200, {
        ok: true,
        message: MessageActions.UPDATE_AGENCY_ASSOCIATION,
        agency_association_id: agencyAssociation.id
    }];
};

/**
 * get agencyAssociation list.
 */
export const getAgencyAssociationListService = async (params, loggedInUser) => {
    let whereClause = ''
    if (params.agency_id && params.client_id) {
        whereClause = `agency_id = ${params.agency_id} AND client_id = ${params.client_id}`
    } else if (params.client_id) {
        whereClause = `client_id = ${params.client_id}`
    } else if (params.agency_id) {
        whereClause = `agency_id = ${params.agency_id}`
    }
    let agencyAssociationList = await getAgencyAssociationList(params.page, params.limit, params.sort_by, params.sort_type, whereClause);
    let count = agencyAssociationList.count;

    if (parseInt(loggedInUser.user_type_id) === UserType.CLIENT_ADMIN) {
        agencyAssociationList = agencyAssociationList.map(({ id, margin, agency_id, client_id, agency_name, currency, agency_city, agency_country }) => ({ id, margin, agency_id, client_id, agency_name, currency, agency_city, agency_country }));
    } else if (parseInt(loggedInUser.user_type_id) === UserType.AGENCY_ADMIN) {
        agencyAssociationList = agencyAssociationList.map(({ id, margin, agency_id, client_id, client_name, currency, client_city, client_country, client_sector }) => ({ id, margin, agency_id, client_id, client_name, currency, client_city, client_country, client_sector }));
    }

    return [200, {
        "ok": true,
        count,
        "agency_association_list": agencyAssociationList
    }];
};