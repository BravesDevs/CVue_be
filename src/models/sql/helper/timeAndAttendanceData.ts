import { getRepository, In, MoreThan } from 'typeorm';
import { TimeAndAttendanceData } from '../entities/TimeAndAttendanceData';
import { AgencyClientAssociation } from '../entities/AgencyClientAssociation';
import { config } from '../../../configurations';

export const addTimeAndAttendanceData: any = async (data) => {
    const timeAndAttendanceDataRepository = getRepository(TimeAndAttendanceData);
    let response = await timeAndAttendanceDataRepository.insert(data);
    return response.generatedMaps[0];
};

export const listOfTimeAndAttendanceData: any = async (data) => {
    const timeAndAttendanceDataRepository = getRepository(TimeAndAttendanceData);
    return await timeAndAttendanceDataRepository.find(data);
};

export const getTimeAndAttendanceDetail: any = async (id, page, limit, sortBy, sortType) => {
    const timeAndAttendanceDataRepository = getRepository(TimeAndAttendanceData);
    return await timeAndAttendanceDataRepository
        .createQueryBuilder('time_and_attendance_data')
        // .innerJoin('time_and_attendance_data.client', 'client')
        .innerJoin('time_and_attendance_data.agency', 'agency')
        .innerJoin('time_and_attendance_data.worker', 'worker')
        // .innerJoin('time_and_attendance_data.site', 'site')
        .innerJoin('time_and_attendance_data.job', 'job')
        .innerJoin('time_and_attendance_data.timeAndAttendance', 'timeAndAttendance')
        .where('time_and_attendance_data.timeAndAttendanceId = :id', { id })
        .select(['time_and_attendance_data.id AS id', 'time_and_attendance_data.hoursApproved AS hour_approved',
            'time_and_attendance_data.agencyId AS agency_id', 'time_and_attendance_data.clientId AS client_id',
            'agency.name AS agency_name', 'time_and_attendance_data.clientName AS client_name',
            'time_and_attendance_data.siteName AS site_name', 'time_and_attendance_data.siteId AS site_id',
            'worker.firstName AS worker_first_name', 'worker.lastName AS worker_last_name', 'time_and_attendance_data.workerId AS worker_id',
            'job.name AS job_name', 'time_and_attendance_data.jobId AS job_id',
            'timeAndAttendance.name AS time_and_attendance_name', 'time_and_attendance_data.timeAndAttendanceId AS time_and_attendance_id',
            'timeAndAttendance.path AS time_and_attendance_path', 'timeAndAttendance.status AS time_and_attendance_status',
            'time_and_attendance_data.date AS date', 'time_and_attendance_data.paymentWeek AS payment_week'])
        .orderBy(sortBy, sortType)
        .offset((page - 1) * limit)
        .limit(limit)
        .execute();
};


export const getTimeAndAttendanceDataCount: any = async (timeAndAttendanceId) => {
    const timeAndAttendanceDataRepository = getRepository(TimeAndAttendanceData);
    return await timeAndAttendanceDataRepository.count({ timeAndAttendanceId })
};

export const getTimeAndAttendanceDataForPayroll: any = async (timeAndAttendanceId) => {
    const timeAndAttendanceDataRepository = getRepository(TimeAndAttendanceData);
    return await timeAndAttendanceDataRepository
        .createQueryBuilder('time_and_attendance_data')
        .innerJoin('time_and_attendance_data.worker', 'worker')
        .innerJoinAndSelect(AgencyClientAssociation, 'agentAssociation', 'time_and_attendance_data.agencyId = agentAssociation.agencyId AND time_and_attendance_data.clientId = agentAssociation.clientId')
        .where('time_and_attendance_data.timeAndAttendanceId = :timeAndAttendanceId', { timeAndAttendanceId })
        .select(['time_and_attendance_data.id AS id', 'time_and_attendance_data.hoursApproved AS hour_approved',
            'time_and_attendance_data.agencyId AS agency_id', 'time_and_attendance_data.clientId AS client_id',
            'time_and_attendance_data.jobId AS job_id', 'time_and_attendance_data.typeOfHours AS type_of_hours',
            'worker.startDate AS start_date', 'agentAssociation.margin AS margin', 'time_and_attendance_data.worker_id AS worker_id'
        ])
        .execute();
}

export const getStandardAndOvertimeHourAndPay: any = async (whereClause) => {
    return await getRepository(TimeAndAttendanceData).createQueryBuilder("tadata")
        .innerJoin("tadata.worker", "workers")
        .select('SUM(total_charge) AS total')
        .addSelect('SUM(weekly_hours) AS weekly_hours')
        .addSelect('tadata.pay_type AS pay_type')
        .where(whereClause)
        .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
        .groupBy("tadata.pay_type")
        .execute();
}

export const getWorkerShiftsCompleted: any = async (workerList) => {
    return getRepository(TimeAndAttendanceData).count({
        where: {
            workerId: In(workerList),
            weeklyHours: MoreThan(0)
        }
    })
}