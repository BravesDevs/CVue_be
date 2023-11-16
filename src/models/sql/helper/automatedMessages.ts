import { getRepository, getManager, In } from 'typeorm';
import { Workers, Message } from '../';
import { AutomatedMessagesLabels } from '../../../common';


/**
 * Get worker details who completes mentioned timeline
 */
export const getTimelineQualifiedWorkerDetails: any = async () => {

    return getRepository(Workers).createQueryBuilder('workers')
        .select([
            'workers.id AS id',
            'workers.device_token AS device_token',
            'DATEDIFF(NOW(), workers.start_date) AS duration'
        ])
        .where('DATEDIFF(NOW(), workers.start_date) IN (7, 14, 28, 56, 84)') // Removed 182, 273, 364 days for 26, 39, 52 week surveys
        .andWhere('workers.is_active = 1')
        .getRawMany()
}

/**
 * Get worker details who have work anniversary with the current date
 */
export const getWorkAnniversaryQualifiedWorkerDetails: any = async () => {
    return getRepository(Workers).createQueryBuilder('workers')
        .select([
            'workers.id AS id',
            'workers.device_token AS device_token'
        ])
        .where('DATE_FORMAT(start_date, "%m-%d") = DATE_FORMAT(NOW(), "%m-%d")')
        .andWhere('workers.is_active = 1')
        .andWhere('start_date < curdate()')
        .getRawMany()
}


/**
 * Get Timeline message details from the database
 */
export const getTimelineRelatedMessagesDetails: any = async () => {
    return getRepository(Message).createQueryBuilder('message')
        .select([
            `message.id`,
            `message.label`,
            `message.from`,
            `message.body`,
            `message.title`
        ])
        .where(`label IN ('${AutomatedMessagesLabels.NEW_STARTER_WEEK_1}', '${AutomatedMessagesLabels.NEW_STARTER_WEEK_2}','${AutomatedMessagesLabels.NEW_STARTER_WEEK_4}', '${AutomatedMessagesLabels.NEW_STARTER_WEEK_8}','${AutomatedMessagesLabels.NEW_STARTER_WEEK_12}', '${AutomatedMessagesLabels.NEW_STARTER_WEEK_26}','${AutomatedMessagesLabels.NEW_STARTER_WEEK_39}', '${AutomatedMessagesLabels.NEW_STARTER_WEEK_52}', '${AutomatedMessagesLabels.ANNUAL_WORK_ANNIVERSARY}')`)
        .andWhere("message.type = 'SYSTEM_DEFAULT'")
        .getMany()
}

/**
 * Get worker details who have birthday on the current date
 */
export const getBirthdayWorkerDetails: any = async () => {
    return getRepository(Workers).createQueryBuilder('workers')
        .select([
            'workers.id AS id',
            'workers.device_token AS device_token'
        ])
        .where('DATE_FORMAT(date_of_birth, "%m-%d") = DATE_FORMAT(NOW(), "%m-%d")')
        .andWhere('workers.is_active = 1')
        .getRawMany()
}

/**
 * Get system message details by label
 */
export const getMessageDetailsByLabel: any = async (label: string) => {
    return getRepository(Message).createQueryBuilder('message')
        .select([
            `message.id`,
            `message.label`,
            `message.from`,
            `message.body`,
            `message.title`
        ])
        .where(`label = '${label}'`)
        .andWhere("message.type = 'SYSTEM_DEFAULT'")
        .getOne()
}


/**
 * Get worker details which are inactive for last week or last 2 weeks.
 */
export const getWorkerDetailsWhoRemainInactive: any = async (week: number = 1) => {
    return getManager().query(`
    SELECT 
        id, device_token
    FROM
        workers
    WHERE
        id NOT IN (SELECT DISTINCT
                (worker_id)
            FROM
                time_and_attendance_data
            WHERE
                total_charge > 0   
                AND start_date >= DATE_SUB(CURDATE(),
                    INTERVAL DAYOFWEEK(CURDATE()) + ${week === 1 ? 6 : 13} DAY)
                AND end_date <= DATE_SUB(CURDATE(),
            INTERVAL DAYOFWEEK(CURDATE()) DAY))
            AND workers.type = 'TEMPORARY'
            AND is_active = 1;
  `);
}


/**
 * Get worker details who have birthday on the current date
 */
export const getWorkersWhoseStartDateIsCurrentDate: any = async () => {
    return getRepository(Workers).createQueryBuilder('workers')
        .select([
            'workers.id AS id',
            'workers.device_token AS device_token'
        ])
        .where('start_date = CURDATE()')
        .andWhere('workers.is_active = 1')
        .getRawMany()
}


/**
 * Get device tokens for workers
 */
export const getDeviceTokens: any = async (workerIds: Array<number>) => {
    return getRepository(Workers).createQueryBuilder('workers')
        .select([
            'workers.device_token AS device_token'
        ])
        .where({ id: In(workerIds) })
        .getRawMany()
}
