import { getRepository } from 'typeorm';
import { PayrollMeta } from '../entities/PayrollMeta';

export const createPayrollMeta: any = async (data) => {
    const PayrollMetaRepository = getRepository(PayrollMeta);
    let response = await PayrollMetaRepository.insert(data);
    return response.generatedMaps[0];
};

export const getPayrollMetaList: any = async (whereClause, page, limit, sortBy, sortType) => {
    const PayrollMetaRepository = getRepository(PayrollMeta);
    let response = await PayrollMetaRepository.createQueryBuilder("time_and_attendance")
        .offset((page - 1) * limit)
        .limit(limit)
        .select(['time_and_attendance.id AS id', 'time_and_attendance.name AS name', 'time_and_attendance.path AS path', 'time_and_attendance.status AS status'])
        .orderBy(sortBy, sortType)
        .where(whereClause)
        .getRawMany();
    return response;
}

export const getPayrollMetaById: any = async (id) => {
    const PayrollMetaRepository = getRepository(PayrollMeta);
    return await PayrollMetaRepository.findOne({ id });
};

export const deletePayrollMetaById: any = async (id) => {
    const PayrollMetaRepository = getRepository(PayrollMeta);
    return await PayrollMetaRepository.delete({ id });
};

export const getPayrollMetaCount: any = async (filter = {}) => {
    const PayrollMetaRepository = getRepository(PayrollMeta);
    return await PayrollMetaRepository.count(filter)
};

export const updatePayrollMeta: any = async (id, body) => {
    const PayrollMetaRepository = getRepository(PayrollMeta);
    return await PayrollMetaRepository.update({ id }, body);
};

export const getPayrollMeta: any = async (filter) => {
    const PayrollMetaRepository = getRepository(PayrollMeta);
    return await PayrollMetaRepository.findOne(filter);
};
