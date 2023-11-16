const _ = require('lodash')
import { getRepository } from 'typeorm';
import { Region } from '../';

export const addRegion: any = async (data) => {
    const regionRepository = getRepository(Region);
    return await regionRepository.save(data);
};

export const getClientRegion: any = async (filter) => {
    const regionRepository = getRepository(Region);
    return await regionRepository.find(
        {
            where: filter,
            order: { name: "ASC" }
        }
    );
};

/**
 * get region By Id
 */
export const getRegionById: any = async (id) => {
    const regionRepository = getRepository(Region);
    return await regionRepository.createQueryBuilder("region")
        .where("region.id = :id", { id })
        .select(['name', 'client_id', 'admin_id', 'agency_region_admin_id'])
        .getRawOne();
};

/**
 * update region
 */
export const updateRegion: any = async (id, body) => {
    const regionRepository = getRepository(Region);
    body.updatedAt = new Date();
    return await regionRepository.update({ id }, body);
};

export const getRegionForDropdown: any = async (clientId) => {
    const regionRepository = getRepository(Region);
    let response = await regionRepository.createQueryBuilder('region')
        .select(['region.id AS id', 'region.name AS name'])
        .where('region.clientId = :clientId', { clientId })
        .orderBy('region.name', 'ASC')
        .getRawMany();
    return response;
};