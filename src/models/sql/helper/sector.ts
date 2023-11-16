import { getRepository } from 'typeorm';
import { Sector } from '../';

/**
 * create sector
 */
export const createSector: any = async (body) => {
    const sectorRepository = getRepository(Sector);
    return await sectorRepository.save(body);
};

/**
 * update sector
 */
export const updateSector: any = async (id, body) => {
    const sectorRepository = getRepository(Sector);
    body.updatedAt = new Date();
    return await sectorRepository.update({ id }, body);
};

/**
 * get sector list
 */
export const getSectorList: any = async () => {
    const sectorRepository = getRepository(Sector);
    let response = await sectorRepository.createQueryBuilder("sector")
        .select(['sector.id', 'sector.key', 'sector.value'])
        .getRawMany();
    let count = await sectorRepository.count();
    response["count"] = count;
    return response;
};


/**
 * get sector By Id
 */
export const getSectorById: any = async (id) => {
    const sectorRepository = getRepository(Sector);
    return await sectorRepository.createQueryBuilder("sector")
        .where("sector.id = :id", { id })
        .select(['id'])
        .getRawOne();
};