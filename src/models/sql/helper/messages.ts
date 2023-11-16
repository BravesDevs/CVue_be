import { getRepository, getConnection, In, getManager } from 'typeorm';
import { Message, WorkerTraining, MessageReceiverWorkers, Workers } from '../';
import { defaultAppreciationJson, HallOfFameTypes, WorkerSideMessagesType, MessageType } from '../../../common';
import { Template } from '../entities/Template';

/**
 * Create new message
 * @param  {} payload
 * @param  {number} loggedInUser
 */
export const createMessage: any = async (payload, loggedInUser: number, params: any) => {
    return (await getRepository(Message).save({
        name: payload.name,
        title: payload.title,
        type: payload.type,
        from: payload.from,
        body: payload.body,
        receiver: payload.send_to,
        sendBy: loggedInUser.toString(),
        createdBy: loggedInUser.toString(),
        updatedBy: loggedInUser.toString(),
        siteId: params.site_id,
        clientId: params.client_id,
        agencyId: params.agency_id || null
    })).id;
};


export const createSystemTypeMessage: any = async (messageId: number) => {
    const entityManager = getManager();
    return await entityManager.query(`
    INSERT INTO message(name, title, message.from, label, body, send_by, created_by, updated_by, type)
    SELECT name, title, message.from, label, body, send_by, created_by, updated_by, "SYSTEM" FROM message WHERE id = ${messageId};
    `)
}


/**
 * Update Hall of fame data for the workers.
 * @param  {string} fieldName
 * @param  {number} loggedInUser
 * @param  {Array<number>} workerIds
 */
export const updateHallOfFameDataForWorkers: any = async (fieldName: string, loggedInUser: number, workerIds: Array<number>) => {
    let appreciationJson = JSON.parse(defaultAppreciationJson);

    if (fieldName === HallOfFameTypes.AWARD) {
        appreciationJson.award = 1;
    } else if (fieldName === HallOfFameTypes.BADGE) {
        appreciationJson.badge = 1;
    } else if (fieldName === HallOfFameTypes.KUDOS) {
        appreciationJson.kudos = 1;
    }

    let caseStatement = `CASE WHEN appreciation IS NULL THEN '${JSON.stringify(appreciationJson)}' ELSE JSON_SET(appreciation, '$.${fieldName}', JSON_EXTRACT(appreciation, '$.${fieldName}') + 1) END`;

    await getConnection().createQueryBuilder()
        .update('workers')
        .set({
            appreciation: () => caseStatement,
            updatedBy: loggedInUser.toString(),
            updatedAt: new Date()
        })
        .where({ id: In(workerIds) })
        .execute();
};


/**
 * Add record in worker training
 * @param  {} messageId
 * @param  {Array<number>} workerIds
 * @param  {number} loggedInUser
 */
export const addWorkerTraining: any = async (messageId: number, workerIds: Array<number>, loggedInUser: number) => {
    let dbPayload = prepareMessageReceiverGroupPayload(workerIds, loggedInUser, messageId);
    await getRepository(WorkerTraining).save(dbPayload);
}


const prepareMessageReceiverGroupPayload = (workerIds, loggedInUser, messageId) => {
    let dbPayload = [];
    workerIds.forEach((workerId) => {
        dbPayload.push({
            messageId: messageId,
            workerId: workerId,
            createdBy: loggedInUser.toString(),
            updatedBy: loggedInUser.toString()
        })
    });

    return dbPayload;
}


/**
 * Add record in message receiver group for all the workers who are going to receive the message
 * @param  {} messageId
 * @param  {Array<number>} workerIds
 * @param  {number} loggedInUser
 */
export const addRecordInMessageReceiverGroup: any = async (messageId: number, workerIds: Array<number>, loggedInUser: number) => {
    let dbPayload = prepareMessageReceiverGroupPayload(workerIds, loggedInUser, messageId);
    await getRepository(MessageReceiverWorkers).insert(dbPayload);
}

/**
 * Get list of sent messages
 * @param  {number} sendBy
 * @param  {any} params
 * @param  {string} sortBy
 * @param  {any} sortType
 * @param  {number} page
 * @param  {number} limit
 */
export const getSentMessageList: any = async (sendBy: number, params: any, sortBy: string, sortType: any, page: number, limit: number) => {
    let whereCondition = `message.send_by = ${sendBy}`;

    for (let key in params) {
        whereCondition += ` AND message.${key} = '${params[key]}'`
    }

    return [
        await getRepository(Message).createQueryBuilder("message")
            .select([`message.id`, `message.name`, `message.title`, `message.type`, `message.from`, `message.body`, `message.receiver`, `message.createdAt`])
            .where(whereCondition)
            .orderBy(`message.${sortBy}`, sortType)
            .offset((page - 1) * limit)
            .limit(limit)
            .getMany(),
        await getRepository(Message).createQueryBuilder("message")
            .where(whereCondition).getCount()
    ]
};

/**
 * Get list of sent messages
 * @param  {number} sendBy
 * @param  {any} params
 * @param  {string} sortBy
 * @param  {any} sortType
 * @param  {number} page
 * @param  {number} limit
 */
export const getWorkerSideMessagesListFromDatabase: any = async (
    whereCondition: any, sortBy: string, sortType: any, page: number, limit: number, userId: number, messageTypes: any, type: string, groupBy: string) => {

    let str = []
    messageTypes.forEach((type) => {
        str.push(JSON.stringify(type))
    });

    let countQuery = getRepository(MessageReceiverWorkers).createQueryBuilder("message_receiver_workers")
    .innerJoin("message_receiver_workers.message", "message")
    .innerJoin("message_receiver_workers.worker", "workers")
    .innerJoin("workers.user", "user")
    .where(`message.type IN (${str})`)
    .orderBy(`${sortBy === "created_at" ? 'message_receiver_workers' : 'message'}.${sortBy}`, sortType);

    let selectQuery = getRepository(MessageReceiverWorkers).createQueryBuilder("message_receiver_workers")
        .select([
            `message.id`,
            `message.name`,
            `message.title`,
            `message.from`,
            `message.body`,
            `message_receiver_workers.createdAt`,
            `message.client_id`,
            `message.agency_id`,
            `message.type as message_type`,
            `message.site_id`,
            `message.receiver`
        ])
        .innerJoin("message_receiver_workers.message", "message")
        .innerJoin("message_receiver_workers.worker", "workers")
        .innerJoin("workers.user", "user")
        .where(`message.type IN (${str})`)
        .orderBy(`${sortBy === "created_at" ? 'message_receiver_workers' : 'message'}.${sortBy}`, sortType)
        .offset((page - 1) * limit).limit(limit);

    let unreadMessageCountQuery = getRepository(MessageReceiverWorkers).createQueryBuilder("message_receiver_workers")
        .innerJoin("message_receiver_workers.message", "message")
        .innerJoin("message_receiver_workers.worker", "workers")
        .innerJoin("workers.user", "user")
        .select([
            `IFNULL(SUM(IF(is_message_read = 0, 1, 0)), 0) AS unread_message_count`
        ])
        .where(`message.type IN (${str})`);


    if (type === WorkerSideMessagesType.FEED) {
        selectQuery = selectQuery.andWhere(whereCondition).andWhere(
                `((message.type = '${MessageType.GENERAL}' AND user.id = ${userId}) OR message.type IN ('${MessageType.KUDOS}', '${MessageType.AWARD}'))`
            ).groupBy(groupBy);
        countQuery = countQuery.andWhere(whereCondition).andWhere(
            `((message.type = '${MessageType.GENERAL}' AND user.id = ${userId}) OR message.type IN ('${MessageType.KUDOS}', '${MessageType.AWARD}'))`
            ).groupBy(groupBy);
        unreadMessageCountQuery = null;

    } else if (type === WorkerSideMessagesType.BADGE) {
        selectQuery = selectQuery.leftJoin(WorkerTraining, "worker_training", "message.id = worker_training.message_id")
            .addSelect([`message_receiver_workers.is_message_read`, `message_receiver_workers.id`])
            .andWhere(whereCondition).andWhere(`user.id = ${userId}`);
        countQuery = countQuery.leftJoin(WorkerTraining, "worker_training", "message.id = worker_training.message_id").andWhere(whereCondition).andWhere(`user.id = ${userId}`);
        unreadMessageCountQuery = unreadMessageCountQuery.leftJoin(WorkerTraining, "worker_training", "message.id = worker_training.message_id").andWhere(whereCondition).andWhere(`user.id = ${userId}`);

    } else if (!whereCondition) {
        selectQuery = selectQuery.addSelect([`message_receiver_workers.is_message_read`, `message_receiver_workers.id`]).andWhere(`user.id = ${userId}`);
        countQuery = countQuery.andWhere(`user.id = ${userId}`);
        unreadMessageCountQuery = unreadMessageCountQuery.andWhere(`user.id = ${userId}`);

    } else {
        selectQuery = selectQuery.addSelect([`message_receiver_workers.is_message_read`, `message_receiver_workers.id`]).andWhere(`user.id = ${userId}`).andWhere(whereCondition);
        countQuery = countQuery.andWhere(`user.id = ${userId}`).andWhere(whereCondition);
        unreadMessageCountQuery = unreadMessageCountQuery.andWhere(`user.id = ${userId}`).andWhere(whereCondition);
    }

    return [
        (await getManager().query(`SELECT COUNT(*) as message_count FROM (${countQuery.getQuery()}) AS temp_table;`))[0].message_count || 0,
        await selectQuery.getRawMany(),
        unreadMessageCountQuery ? await unreadMessageCountQuery.getRawOne() : {
            "unread_message_count": "0"
        }
    ]
};


/**
 * Get worker associated site, client and agencies
 */
export const getWorkerAssociatedSiteAndAgency: any = async (userId: number) => {

    return await getRepository(Workers).createQueryBuilder("workers")
        .innerJoin("workers.user", "user")
        .innerJoin("workers.job", "job")
        .innerJoin("job.jobAssociations", "job_association")
        .select('`workers`.`client_id`, `workers`.`agency_id`, `job_association`.`site_id`')
        .where(`user.id = ${userId}`)
        .getRawMany();
}

/**
 * Add record in template
 * @param  {} payload
 * @param  {Number} loggedInUser
 */
export const createMessageTemplate: any = async (payload) => {
    return (await getRepository(Template).save(payload));
};

/**
 * Update record in template
 * @param  {} id
 * @param  {} body
 * @param  {Number} loggedInUser
 */
export const updateMessageTemplate: any = async (id, body, loggedInUser: number) => {
    body.modifiedAt = new Date();
    body.modifiedBy = loggedInUser.toString();
    return await getRepository(Template).update({ id }, body)
};


/**
 * Get list of available templates
 * @param  {number} sendBy
 * @param  {any} params
 */
export const getTemplateList: any = async (sendBy: number, params: any) => {
    let whereCondition = `template.created_by = ${sendBy}`;

    for (let key in params) {
        whereCondition += ` AND template.${key} = '${params[key]}'`
    }

    return getRepository(Template).createQueryBuilder("template")
        .select(['template.id AS id', 'template.name AS name'])
        .orderBy("created_at", "DESC")
        .where(whereCondition)
        .execute();
};

/**
 * Get training message details
 * @param  {number} id
 */
export const getTrainingMessageDetails: any = async (id: number, userId: number) => {

    return await getRepository(WorkerTraining).createQueryBuilder("worker_training")
        .innerJoin("worker_training.message", "message")
        .innerJoin("worker_training.worker", "workers")
        .innerJoin("workers.user", "user")
        .select([
            `message.id`,
            `message.name`,
            `message.title`,
            `message.from`,
            `message.body`,
            `message.createdAt`,
            `message.client_id`,
            `message.agency_id`,
            `user.name`,
            `worker_training.is_training_completed`,
            `worker_training.training_completed_at`,
            `worker_training.require_more_training`,
            `worker_training.require_training_updated_at`
        ])
        .where(`message.id = ${id}`)
        .andWhere(`workers.user_id = ${userId}`)
        .getRawOne()
};


/**
 * Get message details
 * @param  {number} id
 * @param  {number} message_id  
 */
export const getMessageDetailsModel: any = async (id: number, message_receiver_worker_id: number) => {
    let selectQuery = getRepository(Message).createQueryBuilder("message")
        .select([
            `message.id`,
            `message.name`,
            `message.title`,
            `message.from`,
            `message.body`,
            `message.createdAt`,
            `message.client_id`,
            `message.agency_id`,
            `message.site_id`,
            `message.type`
        ])
        .where(`message.id = ${id}`)

    if (message_receiver_worker_id) {
        selectQuery = selectQuery.innerJoin("message.messageReceiverWorkers", "messageReceiverWorkers")
            .addSelect(`messageReceiverWorkers.createdAt AS createdAt`)
            .andWhere(`messageReceiverWorkers.id = ${message_receiver_worker_id}`)
    }
    return selectQuery.getRawOne();
};


/**
 * Get training message details
 * @param  {number} id
 */
export const updateMessageReadStatusHelper: any = async (id: number, userId: number) => {
    const entityManager = getManager()
    return await entityManager.query(`
    UPDATE message_receiver_workers as mrw inner join 
    workers as wk on mrw.worker_id = wk.id  
    set mrw.is_message_read = 1, mrw.message_read_at = '${new Date().toISOString().slice(0, 19).replace('T', ' ')}'  
    where mrw.message_id =${id} AND wk.user_id = ${userId};
    `)

};


export const getMessageDetailsById = async (messageId: number) => {
    return await getRepository(Message).findOne({
        where: {
            id: messageId
        }
    })
}

/**
 * Get message template details
 * @param  {number} id
 */
export const getMessageTemplateDetails: any = async (id: number) => {
    return await getRepository(Template).createQueryBuilder('template')
        .select(['id', 'name', 'title', 'type', 'body', '`from`', 'created_by', 'created_at'])
        .where(`template.id = ${id}`)
        .getRawOne()
};

/**
 * Get default message template details
 */
export const getDefaultMessageTemplate: any = async () => {
    return getRepository(Template).createQueryBuilder("template")
        .select(['name', 'title', 'type', 'body', '`from`'])
        .where(`is_default = 1`)
        .getRawMany();
};
