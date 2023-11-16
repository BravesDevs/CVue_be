import { getRepository } from 'typeorm';
import { PayrollSummary } from '..';

export const addPayrollSummaryData: any = async (data) => {
    const payrollSummaryRepository = getRepository(PayrollSummary);
    const response = await payrollSummaryRepository.insert(data);
    return response.generatedMaps[0];
};

export const getPayrollSummary: any = async (whereClause, page, limit, sortBy, sortType) => {
    const payrollRepository = getRepository(PayrollSummary);
    return await payrollRepository.createQueryBuilder('payroll_summary')
        .innerJoin('payroll_summary.agency', 'agency')
        .innerJoin('payroll_summary.client', 'client')
        .select([
            'payroll_summary.id AS id', 'payroll_summary.payroll_meta_id AS payroll_meta_id', 'payroll_summary.client_id AS client_id', 'client.name AS client_name', 'agency.name AS agency_name',
            'payroll_summary.total_hours AS total_hours', 'payroll_summary.total_charge AS total_charge', 'payroll_summary.total_pay AS total_pay', 'payroll_summary.total_agency_margin AS total_agency_margin', 'payroll_summary.actual_margin AS actual_margin',
            'payroll_summary.rate_card_margin AS rate_card_margin', 'payroll_summary.credit_per_hour AS credit_per_hour', 'payroll_summary.clearvue_savings AS clearvue_savings', 'payroll_summary.week AS week', 'payroll_summary.created_by AS created_by',
            'payroll_summary.updated_by AS updated_by', 'payroll_summary.created_at AS created_at', 'payroll_summary.updated_at AS updated_at'
        ])
        .where(whereClause)
        .orderBy(sortBy, sortType)
        .offset((page - 1) * limit)
        .limit(limit)
        .execute()
}