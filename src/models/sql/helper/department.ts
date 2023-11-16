import { getRepository, In } from 'typeorm';
import { Departments } from '../';

/**
 * create department
 */
export const createDepartment: any = async (body) => {
    const departmentRepository = getRepository(Departments);
    return await departmentRepository.save(body);
};

/**
 * update department
 */
export const updateDepartment: any = async (id, body) => {
    const departmentRepository = getRepository(Departments);
    body.updatedAt = new Date();
    return await departmentRepository.update({ id }, body);
};

/**
 * get department list with pagination
 */
export const getDepartmentListWithPagination: any = async (page, limit, whereClause) => {
    const departmentRepository = getRepository(Departments);
    let selectQuery = departmentRepository.createQueryBuilder("departments").where(whereClause)

    if (whereClause.includes('site_id') || whereClause.includes('region_id')) {
        selectQuery = selectQuery.innerJoin('departments.jobAssociations', 'jobAssociations').innerJoin('jobAssociations.site', 'site');
    }

    let totalDepartment = await selectQuery.select(['COUNT(DISTINCT(departments.id)) AS count']).getRawOne();

    let list = await selectQuery.select('DISTINCT(departments.id) AS id')
        .addSelect('departments.name AS name')
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy("departments.name", "ASC")
        .getRawMany();
    return { list, totalDepartment };
};

/**
 * get department By Id
 */
export const getDepartmentById: any = async (id) => {
    const departmentRepository = getRepository(Departments);
    return await departmentRepository.createQueryBuilder("departments")
        .where("departments.id = :id", { id })
        .select(['name'])
        .getRawOne();
};

/**
 * get department By whereclase
 */
export const getDepartmentByWhereClause: any = async (whereClause) => {
    const departmentRepository = getRepository(Departments);
    return await departmentRepository.findOne(
        {
            where: whereClause,
            select: ['id']
        }
    );
};


export const getDepartmentsByNames: any = async (names) => {
    const departmentRepository = getRepository(Departments);
    return await departmentRepository.find(
        {
            where: { name: In(names) },
            select: ['id', 'name']
        }
    );
};

/**
 * get department names
 */
 export const getDepartmentNames: any = async (departmentIds) => {
    return await getRepository(Departments).find(
        {
            where: `id IN (${departmentIds.join(",")})`,
            select: ['id', 'name']
        }
    );
};