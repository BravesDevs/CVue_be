/**
 * All the service layer methods for the Sector.
 */
const _ = require('lodash');
import { CreateAndUpdateSectorRequestDTO, ErrorResponse } from "./../common";
import { createSector, updateSector, getSectorList, getSectorById } from "./../models";
import { MessageActions } from "./../common";


/**
 * create sector.
 * @param  {CreateAndUpdateSectorRequestDTO} payload
 */
export const createSectorService = async (payload: CreateAndUpdateSectorRequestDTO, loggedInUser) => {
    const sectorPayload = {
        key: payload.key,
        value: payload.value,
        createdBy: loggedInUser.user_id,
        updatedBy: loggedInUser.user_id,
    }
    let sector = await createSector(sectorPayload);
	return [201, {
		ok: true,
        message: MessageActions.CREATE_SECTOR,
        sector_id: sector.id,
	}];
};

/**
 * update sector.
 * @param  {id}
 * @param  {CreateAndUpdateSectorRequestDTO} payload
 */
export const updateSectorService = async (id: string, payload: CreateAndUpdateSectorRequestDTO, loggedInUser) => {
    let sectorToUpdate = await getSectorById(id);

	if (!sectorToUpdate) {
		return [404, ErrorResponse.ResourceNotFound];
	}
    const sectorPayload = {
        key: payload.key,
        value: payload.value,
        updatedBy: loggedInUser.user_id,
    }
    let sector = await updateSector(id, sectorPayload);
	return [200, {
		ok: true,
        message: MessageActions.UPDATE_SECTOR,
        sector_id: sector.id
	}];
};

/**
 * get sector list.
 */
export const getSectorListService = async () => {
    
    let sectorList = await getSectorList();
	return [200, {
        ok: true,
        count : parseInt(sectorList.count),
        sector_list: sectorList
    }];
};