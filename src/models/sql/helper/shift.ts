import { getRepository, In, Not } from 'typeorm';
import { Shift } from '../entities/Shift';

export const addShiftHelper: any = async (data) => {
    const shiftRepository = getRepository(Shift);
    let response = await shiftRepository.insert(data);
    return response.generatedMaps[0];
};

export const updateShift: any = async (id, body) => {
    const shiftRepository = getRepository(Shift);
    return await shiftRepository.update({ id }, body);
};

export const getShiftHelper: any = async (whereClause) => {
    const shiftRepository = getRepository(Shift);
    let selectQuery = shiftRepository.createQueryBuilder('shift')
        .select(['DISTINCT(shift.id) AS id', 'shift.name AS name', 'shift.created_by AS createdBy', 'shift.created_at AS createdAt',
            'shift.updated_by AS updatedBy', 'shift.updated_at AS updatedAt', 'shift.client_id AS clientId'])
        .where(whereClause)
        .orderBy('shift.name', 'ASC')

    if (whereClause.includes('site_id') || whereClause.includes('region_id')) {
        selectQuery = selectQuery.innerJoin('shift.jobs', 'job')
            .innerJoin('job.jobAssociations', 'jobAssociations')
            .innerJoin('jobAssociations.site', 'site')
    }
    return selectQuery.getRawMany();
};


export const getShiftsByNames: any = async (names) => {
    const shiftRepository = getRepository(Shift);
    return await shiftRepository.find(
        {
            where: { name: In(names) },
            select: ['id', 'name']
        }
    );
};

/**
 * get shift By whereclase
 */
export const getShiftByWhereClause: any = async (whereClause) => {
    const shiftRepository = getRepository(Shift);
    return await shiftRepository.findOne(
        {
            where: whereClause,
            select: ['id']
        }
    );
};

/**
 * get shifts by where clause
 */
 export const getShiftNames: any = async (shiftIds) => {
    return await getRepository(Shift).find(
        {
            where: `id IN (${shiftIds.join(",")})`,
            select: ['id', 'name']
        }
    );
};
