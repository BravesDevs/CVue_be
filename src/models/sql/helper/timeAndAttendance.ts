import { getRepository } from 'typeorm';
import { TimeAndAttendance } from '../entities/TimeAndAttendance';
import { TimeAndAttendanceData } from '../entities/TimeAndAttendanceData';

export const createTimeAndAttendance: any = async (data) => {
    const TimeAndAttendanceRepository = getRepository(TimeAndAttendance);
    let response = await TimeAndAttendanceRepository.insert(data);
    return response.generatedMaps[0];
};

export const getTimeAndAttendanceList: any = async (whereClause, page, limit, sortBy, sortType) => {
    const TimeAndAttendanceRepository = getRepository(TimeAndAttendance);
    let response = await TimeAndAttendanceRepository.createQueryBuilder("time_and_attendance")
        .offset((page - 1) * limit)
        .limit(limit)
        .select(['time_and_attendance.id AS id', 'time_and_attendance.name AS name', 'time_and_attendance.path AS path', 'time_and_attendance.status AS status'])
        .orderBy(sortBy, sortType)
        .where(whereClause)
        .getRawMany();
    return response;
}

export const getTimeAndAttendanceListWithPayrollSummary: any = async (whereClause, page, limit, sortBy, sortType) => {
    const TimeAndAttendanceRepository = getRepository(TimeAndAttendance);
    let response = await TimeAndAttendanceRepository.createQueryBuilder("time_and_attendance")
        .innerJoin('time_and_attendance.agency', 'agency')
        .innerJoin('time_and_attendance.client', 'client')
        .innerJoin('time_and_attendance.site', 'site')
        .leftJoin('time_and_attendance.payrollMetas', 'payroll_meta')
        .leftJoin('payroll_meta.payrollSummaries', 'payroll_summary')
        .leftJoin('payroll_meta.payrolls','payroll')
        .select(["date_format(time_and_attendance.created_at,'%Y-%m-%d') as time_and_attendance_created_at", "date_format(payroll_meta.created_at,'%Y-%m-%d') as payroll_meta_created_at",
        'time_and_attendance.name AS time_and_attendance_name', 'payroll_meta.name AS payroll_meta_name', 'time_and_attendance.status AS time_and_attendance_status',
         'payroll_meta.status AS payroll_meta_status', 'time_and_attendance.id AS time_and_attendance_id', 'payroll_summary.payroll_meta_id AS payroll_meta_id', 'client.id AS client_id', 
         'client.name AS client_name', 'agency.id AS agency_id', 'agency.name AS agency_name', 'site.id AS site_id', 'site.name AS site_name', 
         'payroll_summary.total_hours AS total_hours', 'payroll_summary.total_charge AS total_charge', 'payroll_summary.total_pay AS total_pay',
         'payroll_summary.total_agency_margin AS total_agency_margin', 'payroll_summary.actual_margin AS actual_margin', 'payroll_summary.rate_card_margin AS rate_card_margin', 
         'payroll_summary.credit_per_hour AS credit_per_hour', 'payroll_summary.clearvue_savings AS clearvue_savings', 'time_and_attendance.week AS week',
         "date_format(time_and_attendance.start_date,'%Y-%m-%d') as start_date", "date_format(time_and_attendance.end_date,'%Y-%m-%d') as end_date",
         "ROUND(SUM(payroll.actual_cost_to_employ),2) AS actual_employment_costs"])
        .where(whereClause)
        .groupBy('time_and_attendance.id')
        .orderBy(sortBy, sortType)
        .addOrderBy('time_and_attendance.id', sortType.toUpperCase())
        .offset((page - 1) * limit)
        .limit(limit)
        .execute();
    return response;
}

export const getTimeAndAttendanceById: any = async (id) => {
    const TimeAndAttendanceRepository = getRepository(TimeAndAttendance);
    return await TimeAndAttendanceRepository.findOne({ id });
};

export const getTimeAndAttendance: any = async (filter) => {
    const TimeAndAttendanceRepository = getRepository(TimeAndAttendance);
    return await TimeAndAttendanceRepository.findOne(filter);
};

export const deleteTimeAndAttendanceById: any = async (id) => {
    const TimeAndAttendanceRepository = getRepository(TimeAndAttendance);
    return await TimeAndAttendanceRepository.delete({ id });
};

export const deleteTimeAndAttendanceDataById: any = async (timeAndAttendanceId) => {
    const TimeAndAttendanceDataRepository = getRepository(TimeAndAttendanceData);
    return await TimeAndAttendanceDataRepository.delete({ timeAndAttendanceId });
};

export const getTimeAndAttendanceCount: any = async (filter = {}) => {
    const TimeAndAttendanceRepository = getRepository(TimeAndAttendance);
    return await TimeAndAttendanceRepository.count(filter)
};

export const updateTimeAndAttendance: any = async (id, body) => {
    const TimeAndAttendanceRepository = getRepository(TimeAndAttendance);
    return await TimeAndAttendanceRepository.update({ id }, body);
};

export const getTimeAndAttendanceCountWithTotalPayrollSaving: any = async (whereClause) => {
    const TimeAndAttendanceRepository = getRepository(TimeAndAttendance);
    let response = await TimeAndAttendanceRepository.createQueryBuilder("time_and_attendance")
        .leftJoin('time_and_attendance.payrollMetas', 'payroll_meta')
        .innerJoin('time_and_attendance.site', 'site')
        .leftJoin('payroll_meta.payrollSummaries', 'payroll_summary')
        .select('COUNT(time_and_attendance.id) AS count')
        .addSelect('SUM(payroll_summary.clearvue_savings) AS total')
        .where(whereClause)
        .getRawOne();
    return response;
};