const moment = require('moment');
import { getRepository, In, getManager } from 'typeorm';
import { Workers, BookingAssociation, TimeAndAttendanceData, Payroll } from "../";
import { databaseSeparator } from '../../../common';
import { addTrendsAnalysisRegion } from '../../../utils';
import { config } from '../../../configurations';

/**
 * Get worker demographics details with grouping with nationality/gender/post_code
 */
export const getWorkerDemographicsDetails: any = async (requestArgs, whereClauseString, groupBy = "workers.nationality") => {
    const workersRepository = getRepository(Workers);

    let response;

    if ((requestArgs.region_id)) {
        /*  For filters: 
                - For region filtered dashboard
            Tables:
                - Job
                - Job Association
                - Site
        */
        response = await workersRepository.createQueryBuilder("workers")
            .innerJoin("workers.job", "job")
            .innerJoin("job.jobAssociations", "job_association")
            .innerJoin("job_association.site", "site")
            .select(`COUNT(DISTINCT(workers.id)) AS value`)
            .addSelect(`${groupBy} AS label`)
            .groupBy(`label`)
            .where(whereClauseString)
            .getRawMany();
    } else if (requestArgs.site_id || requestArgs.department_id) {
        /*  For: 
                - Site admin dashboards
                - Department filtered dashboard
            Tables:
                - Worker
                - Job
                - Job Association
        */
        response = await workersRepository.createQueryBuilder("workers")
            .innerJoin("workers.job", "job")
            .innerJoin("job.jobAssociations", "job_association")
            .select(`COUNT(DISTINCT(workers.id)) AS value`)
            .addSelect(`${groupBy} AS label`)
            .groupBy(`label`)
            .where(whereClauseString)
            .getRawMany();
    } else if (requestArgs.shift_id) {
        /*  For: 
                - Shift filtered dashboard
            Tables:
                - Worker
                - Job
        */
        response = await workersRepository.createQueryBuilder("workers")
            .innerJoin("workers.job", "job")
            .select(`COUNT(DISTINCT(workers.id)) AS value`)
            .addSelect(`${groupBy} AS label`)
            .groupBy(`label`)
            .where(whereClauseString)
            .getRawMany();
    } else {
        /*  For: 
                - Client main dashboard
                - Agency main dashboard
            Tables:
                - Worker
                - Job
        */
        response = await workersRepository.createQueryBuilder("workers")
            .select(`COUNT(DISTINCT(workers.id)) AS value`)
            .addSelect(`${groupBy} AS label`)
            .groupBy(`label`)
            .where(whereClauseString)
            .getRawMany();
    }

    return response;
};


/**
 * Get workers start date & inactivated date to calculate legth of services
 */
export const getStartAndInactivatedDateForTheWorkers: any = async (requestArgs, whereClauseString: string) => {

    const workersRepository = getRepository(Workers);

    let response;

    if ((requestArgs.region_id)) {
        /*  For filters: 
                - For region filtered dashboard
            Tables:
                - Job
                - Job Association
                - Site
        */
        response = await workersRepository.createQueryBuilder("workers")
            .innerJoin("workers.job", "job")
            .innerJoin("job.jobAssociations", "job_association")
            .innerJoin("job_association.site", "site")
            .select('workers.start_date')
            .addSelect('workers.in_actived_at')
            .where(whereClauseString)
            .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
            .getRawMany();
    } else if (requestArgs.site_id || requestArgs.department_id) {
        /*  For: 
                - Site admin dashboards
                - Department filtered dashboard
            Tables:
                - Worker
                - Job
                - Job Association
        */
        response = await workersRepository.createQueryBuilder("workers")
            .innerJoin("workers.job", "job")
            .innerJoin("job.jobAssociations", "job_association")
            .select('workers.start_date')
            .addSelect('workers.in_actived_at')
            .where(whereClauseString)
            .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
            .getRawMany();
    } else if (requestArgs.shift_id) {
        /*  For: 
                - Shift filtered dashboard
            Tables:
                - Worker
                - Job
        */
        response = await workersRepository.createQueryBuilder("workers")
            .innerJoin("workers.job", "job")
            .select('workers.start_date')
            .addSelect('workers.in_actived_at')
            .where(whereClauseString)
            .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
            .getRawMany();
    } else {
        /*  For: 
                - Client main dashboard
                - Agency main dashboard
            Tables:
                - Worker
                - Job
        */
        response = await workersRepository.createQueryBuilder("workers")
            .select('workers.start_date')
            .addSelect('workers.in_actived_at')
            .where(whereClauseString)
            .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
            .getRawMany();
    }

    return response;
};


/**
 * Get agency wise worker demographics details with grouping with nationality
 */
export const getAgencyWiseWorkerDemographicsDetails: any = async (requestArgs, whereClauseString) => {

    const workersRepository = getRepository(Workers);

    let response;

    if ((requestArgs.region_id)) {
        /*  For filters: 
                - For region filtered dashboard
            Tables:
                - Job
                - Job Association
                - Site
        */
        response = await workersRepository.createQueryBuilder("workers")
            .innerJoin("workers.job", "job")
            .innerJoin("job.jobAssociations", "job_association")
            .innerJoin("job_association.site", "site")
            .innerJoin("workers.agency", "agency_details")
            .select('COUNT(DISTINCT(workers.id)) AS value')
            .addSelect('workers.nationality AS nationality')
            .addSelect("CONCAT(agency_details.id , '" + databaseSeparator + "', agency_details.name) AS agency_detail")
            .groupBy('workers.nationality')
            .addGroupBy('agency_details.id')
            .orderBy('agency_details.id')
            .where(whereClauseString)
            .getRawMany();
    } else if (requestArgs.site_id || requestArgs.department_id) {
        /*  For: 
                - Site admin dashboards
                - Department filtered dashboard
            Tables:
                - Worker
                - Job
                - Job Association
        */
        response = await workersRepository.createQueryBuilder("workers")
            .innerJoin("workers.job", "job")
            .innerJoin("job.jobAssociations", "job_association")
            .innerJoin("workers.agency", "agency_details")
            .select('COUNT(DISTINCT(workers.id)) AS value')
            .addSelect('workers.nationality AS nationality')
            .addSelect("CONCAT(agency_details.id , '" + databaseSeparator + "', agency_details.name) AS agency_detail")
            .groupBy('workers.nationality')
            .addGroupBy('agency_details.id')
            .orderBy('agency_details.id')
            .where(whereClauseString)
            .getRawMany();
    } else if (requestArgs.shift_id) {
        /*  For: 
                - Shift filtered dashboard
            Tables:
                - Worker
                - Job
        */
        response = await workersRepository.createQueryBuilder("workers")
            .innerJoin("workers.job", "job")
            .innerJoin("workers.agency", "agency_details")
            .select('COUNT(DISTINCT(workers.id)) AS value')
            .addSelect('workers.nationality AS nationality')
            .addSelect("CONCAT(agency_details.id , '" + databaseSeparator + "', agency_details.name) AS agency_detail")
            .groupBy('workers.nationality')
            .addGroupBy('agency_details.id')
            .orderBy('agency_details.id')
            .where(whereClauseString)
            .getRawMany();
    } else {
        /*  For: 
                - Client main dashboard
                - Agency main dashboard
            Tables:
                - Worker
                - Job
        */
        response = await workersRepository.createQueryBuilder("workers")
            .innerJoin("workers.agency", "agency_details")
            .select('COUNT(DISTINCT(workers.id)) AS value')
            .addSelect('workers.nationality AS nationality')
            .addSelect("CONCAT(agency_details.id , '" + databaseSeparator + "', agency_details.name) AS agency_detail")
            .groupBy('workers.nationality')
            .addGroupBy('agency_details.id')
            .orderBy('agency_details.id')
            .where(whereClauseString)
            .getRawMany();
    }
    return response;
};


/**
 * Get agency wise workers start date & inactivated date to calculate legth of services
 */
export const getStartAndInactivatedDateForTheAgencyWiseWorkers: any = async (requestArgs, whereClauseString: string) => {

    const workersRepository = getRepository(Workers);

    let response;

    if ((requestArgs.region_id)) {
        /*  For filters: 
                - For region filtered dashboard
            Tables:
                - Job
                - Job Association
                - Site
        */
        response = await workersRepository.createQueryBuilder("workers")
            .innerJoin("workers.job", "job")
            .innerJoin("job.jobAssociations", "job_association")
            .innerJoin("job_association.site", "site")
            .select('workers.start_date')
            .addSelect('workers.in_actived_at')
            .addSelect("workers.agency_id AS worker_agency_id")
            .where(whereClauseString)
            .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
            .orderBy('workers.agency_id')
            .getRawMany();
    } else if (requestArgs.site_id || requestArgs.department_id) {
        /*  For: 
                - Site admin dashboards
                - Department filtered dashboard
            Tables:
                - Worker
                - Job
                - Job Association
        */
        response = await workersRepository.createQueryBuilder("workers")
            .innerJoin("workers.job", "job")
            .innerJoin("job.jobAssociations", "job_association")
            .select('workers.start_date')
            .addSelect('workers.in_actived_at')
            .addSelect("workers.agency_id AS worker_agency_id")
            .where(whereClauseString)
            .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
            .orderBy('workers.agency_id')
            .getRawMany();
    } else if (requestArgs.shift_id) {
        /*  For: 
                - Shift filtered dashboard
            Tables:
                - Worker
                - Job
        */
        response = await workersRepository.createQueryBuilder("workers")
            .innerJoin("workers.job", "job")
            .select('workers.start_date')
            .addSelect('workers.in_actived_at')
            .addSelect("workers.agency_id AS worker_agency_id")
            .where(whereClauseString)
            .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
            .orderBy('workers.agency_id')
            .getRawMany();
    } else {
        /*  For: 
                - Client main dashboard
                - Agency main dashboard
            Tables:
                - Worker
                - Job
        */
        response = await workersRepository.createQueryBuilder("workers")
            .select('workers.start_date')
            .addSelect('workers.in_actived_at')
            .addSelect("workers.agency_id AS worker_agency_id")
            .where(whereClauseString)
            .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
            .orderBy('workers.agency_id')
            .getRawMany();
    }

    return response;
};


/**
 * Get shift fulfillment from the the booking association
 */
export const getShiftFulfillmentFromBookingAssociation: any = async (whereClauseString: string, startDate: string, endDate: string) => {

    return getRepository(BookingAssociation).createQueryBuilder("booking_association")
        .innerJoin("booking_association.booking", "booking")
        .select('booking_association.agency_id')
        .addSelect("IFNULL(booking_association.requested_total, 0) AS requested_total")
        .addSelect("IFNULL(booking_association.fulfilled_total, 0) AS fulfilled_total")
        .where(whereClauseString)
        .andWhere(`booking.start_date >= '${startDate}'`)
        .andWhere(`booking.end_date <= '${endDate}'`)
        .getRawMany();
};


/**
 * Get shift utilisation from the the T&A Data
 */
export const getShiftUtilisationDetailsModel: any = async (startDate: string, endDate: string, whereClauseString: string) => {

    return getManager().query(`
    SELECT 
        COUNT(worker_id) AS worker_counts, avg_days
    FROM
        (SELECT 
            worker_id, CAST(AVG(no_of_days) AS DECIMAL (0)) AS avg_days
        FROM
            (SELECT 
                time_and_attendance_data.worker_id,
                time_and_attendance_data.start_date,
                (IF(SUM(day_1) > 0, 1, 0) + IF(SUM(day_2) > 0, 1, 0) + IF(SUM(day_3) > 0, 1, 0) + IF(SUM(day_4) > 0, 1, 0) + IF(SUM(day_5) > 0, 1, 0) + IF(SUM(day_6) > 0, 1, 0) + IF(SUM(day_7) > 0, 1, 0)) AS no_of_days
        FROM
            time_and_attendance_data
        LEFT JOIN workers ON time_and_attendance_data.worker_id = workers.id
        WHERE
            ${whereClauseString} AND time_and_attendance_data.start_date >= '${startDate}' AND time_and_attendance_data.end_date <= '${endDate}' AND workers.type = '${config.TEMPORARY_WORKER}'
        GROUP BY worker_id , start_date) AS temp_table
        GROUP BY worker_id) AS temp_table_2
    GROUP BY avg_days;
  `);
};

/**
 * Get total spend broken down by agency.
 */
export const getActivityTotalSpendByAgencyHelper: any = async (startDate: string, endDate: string, whereClauseString: string) => {
    return await getRepository(TimeAndAttendanceData).createQueryBuilder("time_and_attendance_data")
        .innerJoin("time_and_attendance_data.worker", "workers")
        .select(['time_and_attendance_data.agency_id as label', 'IFNULL(SUM(time_and_attendance_data.total_charge),0) as count'])
        .where(whereClauseString)
        .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
        .andWhere(`time_and_attendance_data.start_date >= '${startDate}'`)
        .andWhere(`time_and_attendance_data.end_date <= '${endDate}'`)
        .addGroupBy(`time_and_attendance_data.agency_id`)
        .getRawMany();
}

/**
 * Get workers working hours from the T&A data
 */
export const getWorkersWorkingHours: any = async (startDate: string, endDate: string, whereClauseString: string) => {
    return await getRepository(TimeAndAttendanceData).createQueryBuilder("time_and_attendance_data")
        .innerJoin("time_and_attendance_data.worker", "workers")
        .select("time_and_attendance_data.agency_id, worker_id, week, sum(weekly_hours) as weekly_hours, pay_type")
        .where(whereClauseString)
        .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
        .andWhere(`time_and_attendance_data.start_date >= '${startDate}'`)
        .andWhere(`time_and_attendance_data.end_date <= '${endDate}'`)
        .groupBy('time_and_attendance_data.agency_id')
        .getRawMany();
};


/**
 * Get workers day wise shift utilisation details from the T&A data
 */
export const getWorkersDayWiseShiftUtilisationDetails: any = async (startDate: string, endDate: string, whereClauseString: string) => {

    return getManager().query(`
        SELECT 
            COUNT(worker_id) AS worker_counts, avg_days, agency_id
        FROM
            (SELECT 
                worker_id, CAST(AVG(no_of_days) AS DECIMAL (0)) AS avg_days, agency_id
            FROM
                (SELECT 
                    time_and_attendance_data.worker_id,
                    time_and_attendance_data.start_date,
                    (IF(SUM(day_1) > 0, 1, 0) + IF(SUM(day_2) > 0, 1, 0) + IF(SUM(day_3) > 0, 1, 0) + IF(SUM(day_4) > 0, 1, 0) + IF(SUM(day_5) > 0, 1, 0) + IF(SUM(day_6) > 0, 1, 0) + IF(SUM(day_7) > 0, 1, 0)) AS no_of_days,
                    time_and_attendance_data.agency_id
            FROM
                time_and_attendance_data
            LEFT JOIN workers ON time_and_attendance_data.worker_id = workers.id
            WHERE
                ${whereClauseString} AND time_and_attendance_data.start_date >= '${startDate}' AND time_and_attendance_data.end_date <= '${endDate}' AND workers.type = '${config.TEMPORARY_WORKER}'
                GROUP BY worker_id , start_date , agency_id) AS temp_table
                GROUP BY worker_id , agency_id) AS temp_table_2
            GROUP BY avg_days , agency_id;
    `);

};


/**
 * Get workers count as per agencies
 */
export const getTotalWorkers: any = async (requestArgs, whereClauseString) => {

    const workersRepository = getRepository(Workers);

    let response;

    if ((requestArgs.region_id)) {
        /*  For filters: 
                - For region filtered dashboard
            Tables:
                - Job
                - Job Association
                - Site
        */
        response = await workersRepository.createQueryBuilder("workers")
            .innerJoin("workers.job", "job")
            .innerJoin("job.jobAssociations", "job_association")
            .innerJoin("job_association.site", "site")
            .select('IFNULL(COUNT(DISTINCT(workers.id)), 0) AS workers_count')
            .addSelect('workers.agency_id AS agency_id')
            .groupBy('workers.agency_id')
            .where(whereClauseString)
            .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
            .getRawMany();
    } else if (requestArgs.site_id || requestArgs.department_id) {
        /*  For: 
                - Site admin dashboards
                - Department filtered dashboard
            Tables:
                - Worker
                - Job
                - Job Association
        */
        response = await workersRepository.createQueryBuilder("workers")
            .innerJoin("workers.job", "job")
            .innerJoin("job.jobAssociations", "job_association")
            .select('IFNULL(COUNT(DISTINCT(workers.id)), 0) AS workers_count')
            .addSelect('workers.agency_id AS agency_id')
            .groupBy('workers.agency_id')
            .where(whereClauseString)
            .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
            .getRawMany();
    } else if (requestArgs.shift_id) {
        /*  For: 
                - Shift filtered dashboard
            Tables:
                - Worker
                - Job
        */
        response = await workersRepository.createQueryBuilder("workers")
            .innerJoin("workers.job", "job")
            .select('IFNULL(COUNT(DISTINCT(workers.id)), 0) AS workers_count')
            .addSelect('workers.agency_id AS agency_id')
            .groupBy('workers.agency_id')
            .where(whereClauseString)
            .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
            .getRawMany();
    } else {
        /*  For: 
                - Client main dashboard
                - Agency main dashboard
            Tables:
                - Worker
                - Job
        */
        response = await workersRepository.createQueryBuilder("workers")
            .select('IFNULL(COUNT(DISTINCT(workers.id)), 0) AS workers_count')
            .addSelect('workers.agency_id AS agency_id')
            .groupBy('workers.agency_id')
            .where(whereClauseString)
            .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
            .getRawMany();
    }
    return response;
};

/**
 * Get workers for leavers calculation
 */
export const getWorkersLeaversDetails: any = async (requestArgs, whereClauseString, startDate, endDate) => {

    const workersRepository = getRepository(Workers);

    let response;

    if ((requestArgs.region_id)) {
        /*  For filters: 
                - For region filtered dashboard
            Tables:
                - Job
                - Job Association
                - Site
        */
        response = await workersRepository.createQueryBuilder("workers")
            .innerJoin("workers.job", "job")
            .innerJoin("job.jobAssociations", "job_association")
            .innerJoin("job_association.site", "site")
            .select('IFNULL(COUNT(DISTINCT(workers.id)), 0) AS workers_count')
            .addSelect('workers.agency_id AS agency_id')
            .groupBy('workers.agency_id')
            .where(whereClauseString)
            .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
            .andWhere(`workers.in_actived_at >= '${startDate}' AND workers.in_actived_at <= '${endDate}'`)
            .getRawMany();
    } else if (requestArgs.site_id || requestArgs.department_id) {
        /*  For: 
                - Site admin dashboards
                - Department filtered dashboard
            Tables:
                - Worker
                - Job
                - Job Association
        */
        response = await workersRepository.createQueryBuilder("workers")
            .innerJoin("workers.job", "job")
            .innerJoin("job.jobAssociations", "job_association")
            .select('IFNULL(COUNT(DISTINCT(workers.id)), 0) AS workers_count')
            .addSelect('workers.agency_id AS agency_id')
            .groupBy('workers.agency_id')
            .where(whereClauseString)
            .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
            .andWhere(`workers.in_actived_at >= '${startDate}' AND workers.in_actived_at <= '${endDate}'`)
            .getRawMany();
    } else if (requestArgs.shift_id) {
        /*  For: 
                - Shift filtered dashboard
            Tables:
                - Worker
                - Job
        */
        response = await workersRepository.createQueryBuilder("workers")
            .innerJoin("workers.job", "job")
            .select('IFNULL(COUNT(DISTINCT(workers.id)), 0) AS workers_count')
            .addSelect('workers.agency_id AS agency_id')
            .groupBy('workers.agency_id')
            .where(whereClauseString)
            .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
            .andWhere(`workers.in_actived_at >= '${startDate}' AND workers.in_actived_at <= '${endDate}'`)
            .getRawMany();
    } else {
        /*  For: 
                - Client main dashboard
                - Agency main dashboard
            Tables:
                - Worker
                - Job
        */
        response = await workersRepository.createQueryBuilder("workers")
            .select('IFNULL(COUNT(DISTINCT(workers.id)), 0) AS workers_count')
            .addSelect('workers.agency_id AS agency_id')
            .groupBy('workers.agency_id')
            .where(whereClauseString)
            .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
            .andWhere(`workers.in_actived_at >= '${startDate}' AND workers.in_actived_at <= '${endDate}'`)
            .getRawMany();
    }
    return response;
};


/**
 * Get date wise T&A workers
 */
export const getFirstTwoWeeksTimeAndAttendanceWorkers: any = async (whereClauseString: string, startDate: string, endDate: string) => {

    let firstWeekWorkersDetails = await getRepository(TimeAndAttendanceData).createQueryBuilder("time_and_attendance_data")
        .select("worker_id")
        .innerJoin("time_and_attendance_data.worker", "workers")
        .where(whereClauseString)
        .andWhere("time_and_attendance_data.start_date >= DATE_SUB(DATE(workers.start_date), INTERVAL DAYOFWEEK(workers.start_date)-1 DAY)")
        .andWhere("time_and_attendance_data.end_date <= DATE_ADD(DATE_SUB(DATE(workers.start_date), INTERVAL DAYOFWEEK(workers.start_date)-1 DAY), INTERVAL 6 DAY)")
        .andWhere(`workers.start_date >= '${startDate}' AND workers.start_date <= '${endDate}'`)
        .getRawMany();

    let firstWeekWorkers = firstWeekWorkersDetails.map(element => element.worker_id);

    return firstWeekWorkers.length ? (await getRepository(TimeAndAttendanceData).createQueryBuilder("time_and_attendance_data")
        .select("worker_id")
        .innerJoin("time_and_attendance_data.worker", "workers")
        .where(whereClauseString)
        .andWhere("time_and_attendance_data.start_date >= DATE_ADD(DATE_SUB(DATE(workers.start_date), INTERVAL DAYOFWEEK(workers.start_date)-1 DAY), INTERVAL 7 DAY)")
        .andWhere("time_and_attendance_data.end_date <= DATE_ADD(DATE_SUB(DATE(workers.start_date), INTERVAL DAYOFWEEK(workers.start_date)-1 DAY), INTERVAL 14 DAY)")
        .andWhere({ workerId: In(firstWeekWorkers) })
        .getRawMany()).map(element => element.worker_id) : [];
};


/**
 * Get new started workers count and inactivated workers count for a given date range for new starter retention details
 * @param  {string} whereClauseString
 * @param  {string} startDate
 * @param  {string} endDate
 */
export const getNewStarterRetentionData: any = async (requestArgs: any, whereClauseString: string, startDate: string, endDate: string) => {

    let inactiveWorkerQuery: any = getWorkersQuery(requestArgs, "COUNT(workers.id) AS inactive_workers_count");
    let activeWorkerQuery: any = getWorkersQuery(requestArgs, "COUNT(workers.id) AS active_workers_count");

    let inactiveWorkersCount: any = await inactiveWorkerQuery.where(whereClauseString)
        .andWhere(`workers.start_date >= DATE_SUB(DATE('${startDate}'), INTERVAL 14 DAY) AND workers.start_date <= DATE_SUB(DATE('${endDate}'), INTERVAL 14 DAY)`)
        .andWhere(`workers.in_actived_at >= '${startDate}' AND workers.in_actived_at <= '${endDate}'`)
        .getRawOne();

    let totalActivatedWorkersCount: any = await activeWorkerQuery.where(whereClauseString)
        .andWhere(`workers.start_date >= DATE_SUB(DATE('${startDate}'), INTERVAL 14 DAY) AND workers.start_date <= DATE_SUB(DATE('${endDate}'), INTERVAL 14 DAY)`)
        .getRawOne();

    return [inactiveWorkersCount.inactive_workers_count, totalActivatedWorkersCount.active_workers_count]
}


/**
 * Get new started workers count and inactivated workers count for a given date range for new starter retention details agency wise.
 * @param  {string} whereClauseString
 * @param  {string} startDate
 * @param  {string} endDate
 */
export const getAgencyWiseNewStarterRetentionData: any = async (requestArgs: any, whereClauseString: string, startDate: string, endDate: string) => {

    let inactiveWorkerQuery: any = getWorkersQuery(requestArgs, "workers.agency_id AS agency_id, COUNT(workers.id) AS inactive_workers_count");
    let activeWorkerQuery: any = getWorkersQuery(requestArgs, "workers.agency_id AS agency_id, COUNT(workers.id) AS active_workers_count");

    let inactiveWorkersCount: any = await inactiveWorkerQuery.where(whereClauseString)
        .andWhere(`workers.start_date >= DATE_SUB(DATE('${startDate}'), INTERVAL 14 DAY) AND workers.start_date <= DATE_SUB(DATE('${endDate}'), INTERVAL 14 DAY)`)
        .andWhere(`workers.in_actived_at >= '${startDate}' AND workers.in_actived_at <= '${endDate}'`)
        .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
        .groupBy('workers.agency_id')
        .getRawMany();

    let totalActivatedWorkersCount: any = await activeWorkerQuery.where(whereClauseString)
        .andWhere(`workers.start_date >= DATE_SUB(DATE('${startDate}'), INTERVAL 14 DAY) AND workers.start_date <= DATE_SUB(DATE('${endDate}'), INTERVAL 14 DAY)`)
        .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
        .groupBy('workers.agency_id')
        .getRawMany();

    return [inactiveWorkersCount, totalActivatedWorkersCount]
}


/**
 * Get date wise inactivated workers count
 */
export const getInactivatedWorkersByStartDate: any = async (workersList: Array<number>) => {

    return await getRepository(Workers).createQueryBuilder("workers")
        .select("IFNULL(COUNT(id), 0)")
        .where({ id: In(workersList) })
        .andWhere("in_actived_at >= DATE_ADD(DATE_SUB(DATE(workers.start_date), INTERVAL DAYOFWEEK(workers.start_date)-1 DAY), INTERVAL 15 DAY)")
        .andWhere("in_actived_at <= DATE_ADD(DATE_SUB(DATE(workers.start_date), INTERVAL DAYOFWEEK(workers.start_date)-1 DAY), INTERVAL 21 DAY)")
        .getCount()
};


/**
 * Get date wise inactivated workers count as per agencies
 */
export const getInactivatedWorkersPerAgencyByStartDate: any = async (requestArgs, whereClauseString: any, startDate: string, endDate: string) => {

    let inactiveWorkerQuery: any = getWorkersQuery(requestArgs, "COUNT(workers.id) AS inactive_workers_count, workers.agency_id AS agency_id");

    let inactiveWorkers: any = await inactiveWorkerQuery.where(whereClauseString)
        .andWhere(`workers.start_date >= DATE_SUB(DATE('${startDate}'), INTERVAL 14 DAY) AND workers.start_date <= DATE_SUB(DATE('${endDate}'), INTERVAL 14 DAY)`)
        .andWhere(`workers.in_actived_at >= '${startDate}' AND workers.in_actived_at <= '${endDate}'`)
        .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
        .groupBy('workers.agency_id')
        .getRawMany();

    return inactiveWorkers;
};


/**
 * Get workers leavers count as per date range
 */
export const getWorkersLeaversCountByDateRange: any = async (requestArgs: any, whereClauseString: string, startDate: string, endDate: string) => {

    const workersRepository = getRepository(Workers);

    let response;

    if ((requestArgs.region_id)) {
        /*  For filters: 
                - For region filtered dashboard
            Tables:
                - Job
                - Job Association
                - Site
        */
        response = await workersRepository.createQueryBuilder("workers")
            .innerJoin("workers.job", "job")
            .innerJoin("job.jobAssociations", "job_association")
            .innerJoin("job_association.site", "site")
            .select('IFNULL(COUNT(DISTINCT(workers.id)), 0) AS workers_count')
            .where(whereClauseString)
            .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
            .andWhere(`workers.in_actived_at >= '${startDate}' AND workers.in_actived_at <= '${endDate}'`)
            .getRawOne();
    } else if (requestArgs.site_id || requestArgs.department_id) {
        /*  For: 
                - Site admin dashboards
                - Department filtered dashboard
            Tables:
                - Worker
                - Job
                - Job Association
        */
        response = await workersRepository.createQueryBuilder("workers")
            .innerJoin("workers.job", "job")
            .innerJoin("job.jobAssociations", "job_association")
            .select('IFNULL(COUNT(DISTINCT(workers.id)), 0) AS workers_count')
            .where(whereClauseString)
            .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
            .andWhere(`workers.in_actived_at >= '${startDate}' AND workers.in_actived_at <= '${endDate}'`)
            .getRawOne();
    } else if (requestArgs.shift_id) {
        /*  For: 
                - Shift filtered dashboard
            Tables:
                - Worker
                - Job
        */
        response = await workersRepository.createQueryBuilder("workers")
            .innerJoin("workers.job", "job")
            .select('IFNULL(COUNT(DISTINCT(workers.id)), 0) AS workers_count')
            .where(whereClauseString)
            .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
            .andWhere(`workers.in_actived_at >= '${startDate}' AND workers.in_actived_at <= '${endDate}'`)
            .getRawOne();
    } else {
        /*  For: 
                - Client main dashboard
                - Agency main dashboard
            Tables:
                - Worker
                - Job
        */
        response = await workersRepository.createQueryBuilder("workers")
            .select('IFNULL(COUNT(DISTINCT(workers.id)), 0) AS workers_count')
            .where(whereClauseString)
            .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
            .andWhere(`workers.in_actived_at >= '${startDate}' AND workers.in_actived_at <= '${endDate}'`)
            .getRawOne();
    }
    return response['workers_count'] || 0;
};


export const getWorkForcePoolUtilizationTotalWorkers: any = async (requestArgs, whereClauseString: string, isForActiveWorkers = 1, startDate = "", endDate = "") => {
    const workersRepository = getRepository(Workers);
    let response;

    if (isForActiveWorkers) {
        whereClauseString += `AND (workers.in_actived_at is null OR workers.in_actived_at >= '${startDate}') AND workers.start_date <= '${endDate}'`
    }

    if ((requestArgs.region_id)) {

        /*  For filters: 
                - For region filtered dashboard
            Tables:
                - Job
                - Job Association
                - Site
        */
        response = await workersRepository.createQueryBuilder("workers")
            .innerJoin("workers.job", "job")
            .innerJoin("job.jobAssociations", "job_association")
            .innerJoin("job_association.site", "site")
            .select('IFNULL(COUNT(DISTINCT(workers.id)), 0) AS total_count')
            .where(whereClauseString)
            .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
            .getRawOne();

    } else if (requestArgs.site_id || requestArgs.department_id) {

        /*  For: 
                - Site admin dashboards
                - Department filtered dashboard
            Tables:
                - Worker
                - Job
                - Job Association
        */
        response = await workersRepository.createQueryBuilder("workers")
            .innerJoin("workers.job", "job")
            .innerJoin("job.jobAssociations", "job_association")
            .select('IFNULL(COUNT(DISTINCT(workers.id)), 0) AS total_count')
            .where(whereClauseString)
            .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
            .getRawOne();

    } else if (requestArgs.shift_id) {

        /*  For: 
                - Shift filtered dashboard
            Tables:
                - Worker
                - Job
        */
        response = await workersRepository.createQueryBuilder("workers")
            .innerJoin("workers.job", "job")
            .select('IFNULL(COUNT(DISTINCT(workers.id)), 0) AS total_count')
            .where(whereClauseString)
            .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
            .getRawOne();
    } else {
        /*  For: 
                - Client main dashboard
                - Agency main dashboard
            Tables:
                - Worker
                - Job
        */
        response = await workersRepository.createQueryBuilder("workers")
            .select('IFNULL(COUNT(DISTINCT(workers.id)), 0) AS total_count')
            .where(whereClauseString)
            .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
            .getRawOne();
    }

    return response;
};

export const getWorkForcePoolUtilizationActiveWorkers: any = async (whereClauseString: string, startDate, endDate) => {

    return await getRepository(TimeAndAttendanceData).createQueryBuilder("time_and_attendance_data")
        .innerJoin("time_and_attendance_data.worker", "workers")
        .select("IFNULL(COUNT(DISTINCT(time_and_attendance_data.worker_id)), 0) AS active_workers")
        .where(whereClauseString)
        .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
        .andWhere(`(workers.in_actived_at is null OR workers.in_actived_at >= '${startDate}') AND workers.start_date <= '${endDate}' AND time_and_attendance_data.start_date >= '${startDate}' and time_and_attendance_data.end_date <= '${endDate}'`)
        .getRawOne();

}

export const getPoolUtilizationInactiveWorkers: any = async (whereClauseString: string, startDate, endDate) => {

    return await getRepository(Workers).createQueryBuilder("workers")
        .innerJoin("workers.timeAndAttendanceData", "time_and_attendance_data")
        .select("IFNULL(COUNT(DISTINCT(workers.id)), 0) AS inactive_workers")
        .addSelect("time_and_attendance_data")
        .where(whereClauseString)
        .andWhere(`time_and_attendance_data.start_date >= '${startDate}' and time_and_attendance_data.end_date <= '${endDate}'`)
        .getRawOne();

}


export const getHeaderCumulativeClearVueSavings: any = async (requestArgs, whereClauseString: string) => {

    const payrollRepository = getRepository(Payroll);
    /*  For filters: For region filtered dashboard*/
    if (requestArgs.region_id) {

        if (requestArgs.region_id && requestArgs.department_id) {

            return await payrollRepository.createQueryBuilder("payroll")
                .innerJoin("payroll.site", "site")
                .innerJoin("payroll.worker", "workers")
                .innerJoin("workers.job", "job")
                .innerJoin("job.jobAssociations", "job_association")
                .select(['ROUND(IFNULL(SUM(payroll.clearvue_savings),0),2) as cumulative_savings'])
                .where(whereClauseString)
                .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
                .getRawOne()
        }

        else if (requestArgs.region_id && requestArgs.shift_id) {

            return await payrollRepository.createQueryBuilder("payroll")
                .innerJoin("payroll.site", "site")
                .innerJoin("payroll.worker", "workers")
                .innerJoin("workers.job", "job")
                .select(['ROUND(IFNULL(SUM(payroll.clearvue_savings),0),2) as cumulative_savings'])
                .where(whereClauseString)
                .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
                .getRawOne()
        }

        return await payrollRepository.createQueryBuilder("payroll")
            .innerJoin("payroll.site", "site")
            .innerJoin("payroll.worker", "workers")
            .select(['ROUND(IFNULL(SUM(payroll.clearvue_savings),0),2) as cumulative_savings'])
            .where(whereClauseString)
            .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
            .getRawOne()

    } else if (requestArgs.site_id || requestArgs.department_id) {
        /*  For filters: For site and department filters*/

        return await payrollRepository.createQueryBuilder("payroll")
            .innerJoin("payroll.worker", "workers")
            .innerJoin("workers.job", "job")
            .innerJoin("job.jobAssociations", "job_association")
            .select(['ROUND(IFNULL(SUM(payroll.clearvue_savings),0),2) as cumulative_savings'])
            .where(whereClauseString)
            .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
            .getRawOne()

    } else if (requestArgs.shift_id) {
        /*  For filters: For shift filter*/

        return await payrollRepository.createQueryBuilder("payroll")
            .innerJoin("payroll.worker", "workers")
            .innerJoin("workers.job", "job")
            .select(['ROUND(IFNULL(SUM(payroll.clearvue_savings),0),2) as cumulative_savings'])
            .where(whereClauseString)
            .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
            .getRawOne()

    } else {
        /*  For: Client main dashboard - Agency main dashboard*/
        return await payrollRepository.createQueryBuilder("payroll")
            .innerJoin("payroll.worker", "workers")
            .select(['ROUND(IFNULL(SUM(payroll.clearvue_savings),0),2) as cumulative_savings'])
            .where(whereClauseString)
            .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
            .getRawOne()
    }
}

export const getPreviousWeekClearVueSavings: any = async (requestArgs, whereClauseString: string) => {

    const payrollRepository = getRepository(Payroll);
    /*  For filters: For region filtered dashboard*/

    let startDateQuery = payrollRepository.createQueryBuilder("payroll")
        .select("payroll.start_date")
        .where(whereClauseString)
        .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
        .orderBy("payroll.start_date", "DESC")

    // Select last uploaded data start date
    if (requestArgs.region_id) {

        if (requestArgs.region_id && requestArgs.department_id) {

            startDateQuery.innerJoin("payroll.site", "site")
                .innerJoin("payroll.worker", "workers")
                .innerJoin("workers.job", "job")
                .innerJoin("job.jobAssociations", "job_association")
        }

        else if (requestArgs.region_id && requestArgs.shift_id) {

            startDateQuery.innerJoin("payroll.site", "site")
                .innerJoin("payroll.worker", "workers")
                .innerJoin("workers.job", "job")
        }

        startDateQuery.innerJoin("payroll.site", "site").innerJoin("payroll.worker", "workers")

    } else if (requestArgs.site_id || requestArgs.department_id) {
        /*  For filters: For site and department filters*/

        startDateQuery.innerJoin("payroll.worker", "workers")
            .innerJoin("workers.job", "job")
            .innerJoin("job.jobAssociations", "job_association")

    } else if (requestArgs.shift_id) {
        /*  For filters: For shift filter*/

        startDateQuery.innerJoin("payroll.worker", "workers")
            .innerJoin("workers.job", "job")
    } else if (requestArgs.client_id) {
        startDateQuery.innerJoin("payroll.worker", "workers")
    }

    let startDate = await startDateQuery.getRawOne();

    if (!startDate) { // Return for not finding the last uploaded record
        return {
            startDate: "",
            dbResponse: { "clearvue_savings": 0 }
        }
    }

    let query = payrollRepository.createQueryBuilder("payroll")
        .select(['ROUND(IFNULL(SUM(payroll.clearvue_savings),0),2) as clearvue_savings'])
        .where(whereClauseString)
        .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
        .andWhere(`payroll.start_date>='${moment(startDate.start_date).utc().format("YYYY-MM-DD")}' AND payroll.end_date<= DATE(DATE_ADD('${moment(startDate.start_date).utc().format("YYYY-MM_DD")}',  INTERVAL 7 DAY))`)

    if (requestArgs.region_id) {

        if (requestArgs.region_id && requestArgs.department_id) {

            query.innerJoin("payroll.site", "site")
                .innerJoin("payroll.worker", "workers")
                .innerJoin("workers.job", "job")
                .innerJoin("job.jobAssociations", "job_association")
        }

        else if (requestArgs.region_id && requestArgs.shift_id) {

            query.innerJoin("payroll.site", "site")
                .innerJoin("payroll.worker", "workers")
                .innerJoin("workers.job", "job")
        }

        query.innerJoin("payroll.site", "site").innerJoin("payroll.worker", "workers")

    } else if (requestArgs.site_id || requestArgs.department_id) {
        /*  For filters: For site and department filters*/

        query.innerJoin("payroll.worker", "workers")
            .innerJoin("workers.job", "job")
            .innerJoin("job.jobAssociations", "job_association")

    } else if (requestArgs.shift_id) {
        /*  For filters: For shift filter*/

        query.innerJoin("payroll.worker", "workers")
            .innerJoin("workers.job", "job")

    } else if (requestArgs.client_id) {
        query.innerJoin("payroll.worker", "workers")
    }

    return {
        startDate: startDate.start_date,
        dbResponse: await query.getRawOne()
    };
}

export const getWorkersTotalWorkingHours: any = async (whereClauseString, start_date, end_date) => {
    return await getRepository(TimeAndAttendanceData).createQueryBuilder("time_and_attendance_data")
        .innerJoin('time_and_attendance_data.worker', 'worker')
        .select(['IFNULL(SUM(time_and_attendance_data.weekly_hours),0) as working_hours'])
        .where(whereClauseString)
        .andWhere(`worker.type = '${config.TEMPORARY_WORKER}'`)
        .andWhere(`time_and_attendance_data.start_date >= '${start_date}' and time_and_attendance_data.end_date <= '${end_date}'`)
        .getRawOne()
}

export const getWorkersCountForAverageWorkingHours: any = async (whereClauseString, start_date, end_date) => {
    const TimeAndAttendanceDataRepository = getRepository(TimeAndAttendanceData);
    let response = await TimeAndAttendanceDataRepository.createQueryBuilder("time_and_attendance_data")
        .innerJoin('time_and_attendance_data.worker', 'worker')
        .select(['IFNULL(COUNT(DISTINCT(time_and_attendance_data.worker_id)),0) as count'])
        .where(whereClauseString)
        .andWhere(`worker.type = '${config.TEMPORARY_WORKER}'`)
        .andWhere(`time_and_attendance_data.start_date >= '${start_date}' and time_and_attendance_data.end_date <= '${end_date}'`)
        .groupBy("time_and_attendance_data.week")
        .getRawMany()
    if (response.length) {
        return response.reduce((total, currentValue) => {
            return parseInt(total) + parseInt(currentValue.count);
        }, 0);
    }
    return 0;

}
/**
 * Get T&A data available workers
 */
export const getTADataAvailableWorkers: any = async (whereClauseString: string, startDate: string, endDate: string) => {

    return await getRepository(TimeAndAttendanceData).createQueryBuilder("time_and_attendance_data")
        .innerJoin("time_and_attendance_data.worker", "workers")
        .select("IFNULL(COUNT(DISTINCT(time_and_attendance_data.worker_id)), 0) AS active_workers")
        .addSelect('time_and_attendance_data.agency_id')
        .where(whereClauseString)
        .andWhere(`workers.type = '${config.TEMPORARY_WORKER}'`)
        .andWhere(`time_and_attendance_data.start_date >= '${startDate}'`)
        .andWhere(`time_and_attendance_data.end_date <= '${endDate}'`)
        .groupBy('time_and_attendance_data.agency_id')
        .getRawMany();
};

/**
 * Get total spend group by weeks
 * @param  {string} start_date
 * @param  {string} end_date
 * @param  {string} whereClauseString
 */
export const getTotalSpendTrendsAnalytics: any = async (start_date: string, end_date: string, whereClauseString: string, region_id = null, client_id) => {
    let selectQuery = getRepository(TimeAndAttendanceData).createQueryBuilder("time_and_attendance_data")
        .innerJoin("time_and_attendance_data.worker", "worker")
        .select(['SUM(time_and_attendance_data.standard_pay) as standard'])
        .addSelect(['SUM(time_and_attendance_data.overtime_pay) as overtime', 'time_and_attendance_data.start_date'])
        .where(whereClauseString)
        .andWhere(`time_and_attendance_data.start_date >= '${start_date}'`)
        .andWhere(`time_and_attendance_data.end_date <= '${end_date}'`)
        .groupBy('time_and_attendance_data.start_date')
    selectQuery = await addTrendsAnalysisRegion(selectQuery, region_id, client_id);
    return await selectQuery.getRawMany()
}

/**
 * Get total hours group by weeks
 * @param  {string} start_date
 * @param  {string} end_date
 * @param  {string} whereClauseString
 */
export const getTotalHoursTrendsAnalytics: any = async (start_date: string, end_date: string, whereClauseString: string, region_id = null, client_id) => {
    let selectQuery = getRepository(TimeAndAttendanceData).createQueryBuilder("time_and_attendance_data")
        .innerJoin("time_and_attendance_data.worker", "worker")
        .select(['SUM(time_and_attendance_data.weekly_hours) as hours'])
        .addSelect(['pay_type', 'time_and_attendance_data.start_date'])
        .where(whereClauseString)
        .andWhere(`time_and_attendance_data.start_date >= '${start_date}'`)
        .andWhere(`time_and_attendance_data.end_date <= '${end_date}'`)
        .groupBy('time_and_attendance_data.start_date')
        .addGroupBy('pay_type')

    selectQuery = await addTrendsAnalysisRegion(selectQuery, region_id, client_id);
    return await selectQuery.getRawMany()
}

/**
 * Get total heads group by weeks
 * @param  {string} start_date
 * @param  {string} end_date
 * @param  {string} whereClauseString
 */
export const getTotalHeadsTrendsAnalytics: any = async (start_date: string, end_date: string, whereClauseString: string, region_id = null, client_id) => {
    let selectQuery = getRepository(BookingAssociation).createQueryBuilder("booking_association")
        .innerJoin("booking_association.booking", "booking")
        .select(['SUM(booking_association.fulfilled_total) as heads', 'start_date'])
        .where(whereClauseString)
        .andWhere(`booking.start_date >= '${start_date}'`)
        .andWhere(`booking.end_date <= '${end_date}'`)
        .groupBy('start_date')
    selectQuery = await addTrendsAnalysisRegion(selectQuery, region_id, client_id);
    return await selectQuery.getRawMany()
}

/**
 * Get total leavers group by weeks
 * @param  {string} start_date
 * @param  {string} end_date
 * @param  {string} whereClauseString
 */
export const getTotalLeaversTrendsAnalytics: any = async (start_date: string, end_date: string, whereClauseString: string, region_id = null, client_id) => {
    let selectQuery = getRepository(Workers).createQueryBuilder("workers")
        .select(['COUNT(DISTINCT(workers.id)) as total', "date_format(workers.in_actived_at,'%Y-%m-%d') as in_actived_at"])
        .where(whereClauseString)
        .andWhere('workers.is_active = 0')
        .andWhere(`in_actived_at >= '${start_date}'`)
        .andWhere(`in_actived_at <= '${end_date}'`)
        .groupBy('CAST(in_actived_at AS DATE)')
    selectQuery = await addTrendsAnalysisRegion(selectQuery, region_id, client_id);
    if (whereClauseString.includes('site_id') || region_id) {
        selectQuery = selectQuery.innerJoin('workers.timeAndAttendanceData', 'timeAndAttendanceData');
    }
    return await selectQuery.getRawMany()
}


/**
 * Get last week uploaded T&A average working hours
 */
export const getLastUploadedWorkingHours: any = async (whereCondition: string) => {

    return getManager().query(`
    SELECT 
        (SELECT 
                IFNULL(SUM(weekly_hours),
                            0) AS working_hours
            FROM
                time_and_attendance_data
            WHERE
                weekly_hours IS NOT NULL
                    AND weekly_hours != 0
                    AND ${whereCondition}
            GROUP BY start_date
            ORDER BY start_date DESC
            LIMIT 1) AS current_average_hours,
        (SELECT 
                COUNT(DISTINCT (worker_id)) AS worker_count
            FROM
                time_and_attendance_data
            WHERE
                weekly_hours IS NOT NULL
                    AND weekly_hours != 0
                    AND ${whereCondition}
            GROUP BY start_date
            ORDER BY start_date DESC
            LIMIT 1) AS current_worker_count,
        (SELECT 
                IFNULL(SUM(weekly_hours),
                            0) AS working_hours
            FROM
                time_and_attendance_data
            WHERE
                start_date = (SELECT 
                        DATE_SUB(start_date, INTERVAL 7 DAY) AS start_date
                    FROM
                        time_and_attendance_data
                    WHERE
                        weekly_hours IS NOT NULL
                            AND weekly_hours != 0
                            AND ${whereCondition}
                    ORDER BY start_date DESC
                    LIMIT 1)
                    AND ${whereCondition}
            GROUP BY start_date) AS past_average_hours,
        (SELECT 
                COUNT(DISTINCT (worker_id)) AS worker_count
            FROM
                time_and_attendance_data
            WHERE
                start_date = (SELECT 
                        DATE_SUB(start_date, INTERVAL 7 DAY) AS start_date
                    FROM
                        time_and_attendance_data
                    WHERE
                        weekly_hours IS NOT NULL
                            AND weekly_hours != 0
                            AND ${whereCondition}
                    ORDER BY start_date DESC
                    LIMIT 1)
                    AND ${whereCondition}
            GROUP BY start_date) AS past_worker_count,
        (SELECT 
                start_date
            FROM
                time_and_attendance_data
            WHERE
                weekly_hours IS NOT NULL
                    AND weekly_hours != 0
                    AND ${whereCondition}
            ORDER BY start_date DESC
            LIMIT 1) AS start_date;

  `);
};

/**\
 * Get workers query as per provided filters
 * @param  {} requestArgs
 */
const getWorkersQuery = (requestArgs: any, selectQuery: string) => {
    let query;
    const workersRepository = getRepository(Workers);

    if ((requestArgs.region_id)) {

        /*  For filters: 
                - For region filtered dashboard
            Tables:
                - Job
                - Job Association
                - Site
        */
        query = workersRepository.createQueryBuilder("workers")
            .select(selectQuery)
            .innerJoin("workers.job", "job")
            .innerJoin("job.jobAssociations", "job_association")
            .innerJoin("job_association.site", "site");

    } else if (requestArgs.site_id || requestArgs.department_id) {

        /*  For: 
                - Site admin dashboards
                - Department filtered dashboard
            Tables:
                - Worker
                - Job
                - Job Association
        */
        query = workersRepository.createQueryBuilder("workers")
            .select(selectQuery)
            .innerJoin("workers.job", "job")
            .innerJoin("job.jobAssociations", "job_association");

    } else if (requestArgs.shift_id) {

        /*  For: 
                - Shift filtered dashboard
            Tables:
                - Worker
                - Job
        */
        query = workersRepository.createQueryBuilder("workers")
            .select(selectQuery)
            .innerJoin("workers.job", "job");
    } else {
        /*  For: 
                - Client main dashboard
                - Agency main dashboard
            Tables:
                - Worker
                - Job
        */
        query = workersRepository.createQueryBuilder("workers").select(selectQuery);
    }

    return query;
}