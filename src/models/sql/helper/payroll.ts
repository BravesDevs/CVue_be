import { getRepository } from 'typeorm';
import { Payroll } from '../';

export const addPayrollData: any = async (data) => {
    const payrollRepository = getRepository(Payroll);
    const response = await payrollRepository.insert(data);
    return response.generatedMaps[0];
};

export const getPayrollsByTimeAndAttendanceId: any = async (timeAndAttendanceId, whereClause, page, limit, sortBy, sortType) => {
    const payrollRepository = getRepository(Payroll);
    return await payrollRepository.createQueryBuilder('payroll')
        .innerJoin('payroll.agency', 'agency')
        .innerJoin('payroll.client', 'client')
        .innerJoin('payroll.worker', 'worker')
        .innerJoin('payroll.timeAndAttendanceData', 'timeAndAttendanceData', 'timeAndAttendanceData.timeAndAttendanceId = :id', { id: timeAndAttendanceId })
        .select([
            'payroll.id AS id', 'payroll.time_and_attendance_data_id AS time_and_attendance_data_id', 'timeAndAttendanceData.timeAndAttendanceId AS time_and_attendance_id',
            'payroll.national_insurance AS national_insurance', 'payroll.pay_per_hour AS pay_per_hour', 'payroll.holiday AS holiday', 'payroll.pension AS pension', 'payroll.apprenticeship_levy AS apprenticeship_levy',
            'payroll.national_insurance_dynamic AS national_insurance_dynamic', 'payroll.holiday_dynamic AS holiday_dynamic', 'payroll.pension_dynamic AS pension_dynamic', 'payroll.apprenticeship_levy_dynamic AS apprenticeship_levy_dynamic', 'payroll.pay_per_hour_dynamic AS pay_per_hour_dynamic',
            'payroll.margin AS margin', 'payroll.payroll_static_total AS payroll_static_total', 'payroll.payroll_dynamic_total AS payroll_dynamic_total', 'payroll.clearvue_savings AS clearvue_savings',
            'payroll.agency_id AS agency_id', 'agency.name AS agency_name', 'payroll.client_id', 'client.name AS client_name', 'payroll.worker_id', 'worker.first_name AS worker_first_name', 'worker.last_name AS worker_last_name'
        ])
        .where(whereClause)
        .orderBy(sortBy, sortType)
        .offset((page - 1) * limit)
        .limit(limit)
        .execute();
}

export const getPayrollsByPayrollMetaId: any = async (payrollMetaId) => {
    const payrollRepository = getRepository(Payroll);
    return await payrollRepository.createQueryBuilder('payroll')
        .innerJoin('payroll.worker', 'worker')
        .select([ 'worker.nationalInsuranceNumber AS national_insurance_number', 'worker.employeeId AS employee_id', 'payroll.totalCharge AS total_charge', 'payroll.actualCostToEmploy AS actual_employment_costs', 
        'payroll.totalAgencyMargin AS total_margin', 'payroll.actualMargin AS actual_margin_per_hour', 'payroll.rateCardMargin AS rate_card_margin', 
        'payroll.creditPerHour AS credit_per_hour', 'payroll.clearvue_savings AS total_savings'
        ])
        .where(`payroll.payrollMetaId = ${payrollMetaId}`)
        .execute()
}

export const deletePayrollByMetaId: any = async (payrollMetaId) => {
    const payrollRepository = getRepository(Payroll);
    return await payrollRepository.delete({ payrollMetaId });
};