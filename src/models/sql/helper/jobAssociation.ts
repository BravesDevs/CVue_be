import { getRepository } from 'typeorm';
import { JobAssociation } from '../';

/**
 * create Job Association
 */
export const createJobAssociation: any = async (data) => {
    try {
        const jobAssociationRepository = getRepository(JobAssociation);
        let response = await jobAssociationRepository.insert(data);
        return response.generatedMaps[0];
    } catch (error) {
        throw error;
    }
};

/**
 * delete Job Association
 */
export const deleteJobAssociation: any = async (filter) => {
    const jobAssociationRepository = getRepository(JobAssociation);
    return await jobAssociationRepository.delete(filter);
};

/**
 * get Job Association
 */
export const getJobAssociation: any = async (page, limit, whereClause) => {

    const jobAssociationRepository = getRepository(JobAssociation);
    return await jobAssociationRepository
        .createQueryBuilder('job_association')
        .innerJoin('job_association.job', 'job')
        .innerJoin('job.shift', 'shift')
        .innerJoin('job_association.department', 'department')
        .innerJoin('job_association.site', 'site')
        .where(whereClause)
        .select(['job_association.id AS id', 'job.id AS job_id', 'job.name AS job_name',
            'job.type AS job_type', 'job.shift_id AS job_shift_id', 'shift.name AS job_shift', 'job.hours_per_week AS job_hours_per_week',
            'department.id AS department_id', 'department.name AS department_name',
            'site.id AS site_id', 'site.name AS site_name'])
        .orderBy('job.name', 'ASC')
        .addOrderBy('job_association.id', 'ASC')
        .skip((page - 1) * limit)
        .take(limit)
        .execute();
};

export const getJobAssociationWithRateCardByJobIds: any = async (jobIds) => {
    const jobAssociationRepository = getRepository(JobAssociation);
    return await jobAssociationRepository
        .createQueryBuilder('job_association')
        .innerJoin('job_association.rateCard', 'rateCard')
        .where("job_association.job_id IN (:...jobIds)", { jobIds })
        .select(['job_association.job_id AS job_id', 'rateCard.id AS rate_card_id', 'rateCard.currency AS currency', 'rateCard.pay_per_hour AS pay_per_hour',
            'rateCard.insurance_rate AS insurance_rate', 'rateCard.holiday_pay_rate AS holiday_pay_rate', 'rateCard.apprenticeship_rate AS apprenticeship_rate',
            'rateCard.full_time_hours AS full_time_hours', 'rateCard.pension_rate AS pension_rate', 'rateCard.overtime_pay_dynamic AS overtime_pay_dynamic',
            'rateCard.overtime_pay AS overtime_pay', 'rateCard.pay_per_hour_dynamic AS pay_per_hour_dynamic',
            'rateCard.insurance_rate_dynamic AS insurance_rate_dynamic', 'rateCard.holiday_pay_rate_dynamic AS holiday_pay_rate_dynamic',
            'rateCard.apprenticeship_rate_dynamic AS apprenticeship_rate_dynamic', 'rateCard.full_time_hours_dynamic AS full_time_hours_dynamic',
            'rateCard.pension_rate_dynamic AS pension_rate_dynamic'])
        .execute();
};

export const jobDropDownListingHelper: any = async (whereClause) => {
    return await getRepository(JobAssociation).createQueryBuilder('job_association')
        .innerJoin('job_association.job', 'job')
        .innerJoin('job_association.department', 'department')
        .leftJoin('job.shift', 'shift')
        .select(['job.id as job_id', 'job.name as job_name', 'job.type as job_type', 'department.name as department_name', 'shift.name as shift_name'])
        .where(whereClause)
        .execute();
}

export const getJobsByClientID: any = async (clientId, siteId) => {
    let jobRepo = await getRepository(JobAssociation);
    return await jobRepo.createQueryBuilder('job_association')
        .innerJoin('job_association.job', 'job')
        .innerJoin('job_association.department', 'department')
        .leftJoin('job.shift', 'shift')
        .where({ clientId, siteId })
        .select(['job_association.id AS id', 'job.id AS job_id', 'LOWER(job.name) AS job_name',
            'job.type AS job_type', 'LOWER(department.name) AS department_name', 'LOWER(shift.name) AS shift_name'])
        .getRawMany();
}

export const jobNameDropDownListingHelper: any = async (whereClause) => {
    return await getRepository(JobAssociation).createQueryBuilder('job_association')
        .innerJoin('job_association.job', 'job')
        .select(['job.id as id', 'job.name as name'])
        .where(whereClause)
        .execute();
}