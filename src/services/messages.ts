import e from 'express';
import {
    ErrorCodes, ErrorResponse, HallOfFameTypes, MessageActions, MessageReceiverGroups, MessageType,
    WorkerSideMessagesScreenViewType, WorkerSideMessagesType, AutomatedMessagesLabels, site
} from '../common';
import {
    addRecordInMessageReceiverGroup, addWorkerTraining, createMessage, createMessageTemplate,
    getAgencyById, getClientsById, getSentMessageList, getTrainingMessageDetails,
    getWorkerAssociatedSiteAndAgency, getWorkerDeviceTokens, getWorkersAsPerSelectedGroups,
    getWorkerSideMessagesListFromDatabase, updateHallOfFameDataForWorkers, updateMessageTemplate,
    updateMessageReadStatusHelper, getMessageDetailsModel, getTemplateList, getMessageTemplateDetails, getDefaultMessageTemplate,
    getDepartmentNames, getJobNames, getShiftNames, getSiteNamesById, getWorkerNamesByIds
} from '../models';
import { notifyBugsnag, removeKeyFromObject, sendNotificationsToMobiles, arrayOfObjectsToObject } from '../utils';
const { EasyPromiseAll } = require('easy-promise-all');

/**
 * Send messages to the workers who qualify in selected criteria by the agency admin or site admin
 * @param  {any} payload
 * @param  {number} loggedInUser
 * @param  {any} params
 */
export const sendMessageToWorkersService = async (payload: any, loggedInUser: number, params: any) => {
    /*
    1. Get list of worker-ids
    2. Remove duplicate worker-ids
    3. Add record in message table
    4. Update records as per message type:
        - Increment hall of fame count
        - Training table insert
    5. Add record in message_receiver_workers table
    6. Fetch device tokens for the workers and send notifications to them
    */

    try {
        let shiftIds = [];
        let departmentIds = [];
        let jobIds = [];
        let workers = [];
        let nationalityList = [];
        let hallOfFameFieldName = "";
        let groupWorkers = [];

        // Get list of workers as per the selected criteria
        payload.send_to.forEach((element) => {
            if (element.type === MessageReceiverGroups.DEPARTMENT) {
                departmentIds.push(...element.data);
            }
            else if (element.type === MessageReceiverGroups.JOB) {
                jobIds.push(...element.data);
            }
            else if (element.type === MessageReceiverGroups.SHIFT) {
                shiftIds.push(...element.data);
            }
            else if (element.type === MessageReceiverGroups.WORKERS) {
                workers.push(...element.data);
            }
            else if (element.type === MessageReceiverGroups.NATIONALITY) {
                nationalityList.push(...element.data);
            }
        })

        if (shiftIds.length || jobIds.length || departmentIds.length || nationalityList.length || !workers.length) {
            groupWorkers = await getWorkersAsPerSelectedGroups(
                params.site_id, params.client_id, params.agency_id, shiftIds, jobIds, departmentIds, nationalityList, params.type
            )
        }

        groupWorkers.forEach((element) => {
            workers.push(element.worker_id);
        })

        // Remove duplicate workers
        workers = [...new Set(workers)];

        if (!workers.length) {
            return [404, ErrorResponse.WorkersNotFoundForSendingMessage];
        }

        // Add new message into the database
        let messageId = await createMessage(payload, loggedInUser, params);


        /* Update records as per message type:
            - Increment hall of fame count
            - Training table insert
        */
        hallOfFameFieldName = payload.type === MessageType.AWARD ? HallOfFameTypes.AWARD : (
            payload.type === MessageType.BADGE ? HallOfFameTypes.BADGE : (
                payload.type === MessageType.KUDOS ? HallOfFameTypes.KUDOS : ""))

        if (hallOfFameFieldName) {
            await updateHallOfFameDataForWorkers(hallOfFameFieldName, loggedInUser, workers);
        }

        if (payload.type === MessageType.TRAINING) {
            await addWorkerTraining(messageId, workers, loggedInUser);
        }

        // Add record in message_receiver_workers table
        await addRecordInMessageReceiverGroup(messageId, workers, loggedInUser);

        // Send notification to the workers asynchronously
        sendMessageNotification(workers, payload, messageId, params)

        return [
            200,
            {
                ok: true,
                message: MessageActions.MESSAGE_SENT
            },
        ];
    } catch (err) {
        if (err.code === ErrorCodes.dbReferenceError) {
            return [404, ErrorResponse.ResourceNotFound]    // Return 404 if any foreign key contraint is not available in DB
        } else {
            notifyBugsnag(err);
            return [500, err.message]
        }
    }
};


/**
 * Send notification to the workers
 * @param  {Array<number>} workerIds
 * @param  {any} payload
 * @param  {number} messageId
 * @param  {any} params
 */
export const sendMessageNotification = async (workerIds: Array<number>, payload: any, messageId: number, params: any, deviceTokens: Array<string> = []) => {
    let workerDeviceTokens = [];

    if (deviceTokens.length) {
        workerDeviceTokens = deviceTokens;
    } else {
        let workerDeviceTokensResult = await getWorkerDeviceTokens(workerIds);
        workerDeviceTokensResult.forEach((workerDetail) => {
            if (workerDetail.deviceToken) workerDeviceTokens.push(workerDetail.deviceToken)
        })
    }

    let text = payload.body[0][0].type === "text" ? payload.body[0][0].data || "" : "";
    let image = payload.body[0][1] && payload.body[0][1].type === "media" ? payload.body[0][1].data || "" : (
        payload.body[0][2] && payload.body[0][2].type === "media" ? payload.body[0][2].type === "media" : ""
    );

    let customData = {
        type: payload.type === MessageType.REWARD ? WorkerSideMessagesType.GENERAL : payload.type.toLowerCase(),
        message_id: messageId,
        msg_id: messageId,
        send_by: params.agency_id ? "agency" : "client"
    }

    await sendNotificationsToMobiles(workerDeviceTokens, payload.title, text, image, customData);
}


/**
 * Get list of sent messages to display to the site or agency admin
 * @param  {number} loggedInUser
 * @param  {any} params
 */
export const getSentMessagesListService = async (loggedInUser: number, params: any) => {
    const { "sort_by": sortBy, "sort_type": sortType, "limit": limit, "page": page, ...otherParams } = params;
    let response = await getSentMessageList(loggedInUser, otherParams, sortBy, sortType, page, limit);


    return [200, {
        ok: true,
        result: response[0].map((record) => {
            record.sent_to = record.receiver.length == 1 && record.receiver[0].type == "workers" && record.receiver[0].data.length ? "Individual" : record.receiver[0].data.length < 1 || record.receiver.length > 1 ? "Group" : "Other";
            return removeKeyFromObject("createdAt", "created_at", record)
        }),
        count: response[1]
    }];
};


/**
 * Get list of messages to display to the workers in mobile application
 * @param  {number} loggedInUser
 * @param  {any} params
 */
export const getWorkerSideMessagesListService = async (loggedInUser: number, params: any) => {
    /**
    1. Generate where condition as per the type of screen
        * General - General, Kudos, Award, Badge, Reward (Only assigned messages)
        * Social Feed - General, Kudos, Award, Badge (All the messages for agency/site without considering message read status)
        * Kudos - Kudos (Only assigned messages)
        * Award - Award (Only assigned messages)
        * Badge - Badge (Only assigned messages)
        * Training - Training (Only assigned messages)
    2. Fetch records as per the generated where condition from the database
    3. Parse Response Data
    4. Return Response
    */
    const { "sort_by": sortBy, "sort_type": sortType, "limit": limit, "page": page, ...otherParams } = params;
    let whereConditionString = "";
    let messageTypes = [];
    let groupByString = "";

    switch (true) {
        case (params.type === WorkerSideMessagesType.GENERAL): {
            messageTypes = [
                MessageType.AWARD, MessageType.BADGE, MessageType.REWARD, MessageType.KUDOS, MessageType.SYSTEM
            ];

            if (params.view === WorkerSideMessagesScreenViewType.AGENCY) {
                whereConditionString = " (message.agency_id IS NOT NULL OR message.type = 'SYSTEM')";
            } else if (params.view === WorkerSideMessagesScreenViewType.CLIENT) {
                whereConditionString = " message.agency_id IS NULL";
            }
            break;
        }

        case (params.type === WorkerSideMessagesType.KUDOS): {
            messageTypes = [
                MessageType.KUDOS
            ];
            break;
        }

        case (params.type === WorkerSideMessagesType.AWARD): {
            messageTypes = [
                MessageType.AWARD
            ];
            break;
        }

        case (params.type === WorkerSideMessagesType.TRAINING): {
            messageTypes = [
                MessageType.TRAINING
            ];
            break;
        }

        case (params.type === WorkerSideMessagesType.BADGE): {
            messageTypes = [
                MessageType.BADGE, MessageType.TRAINING
            ];
            whereConditionString += "(worker_training.is_training_completed IS NULL OR worker_training.is_training_completed=1)";
            break;
        }

        case (params.type === WorkerSideMessagesType.FEED): {
            messageTypes = [
                MessageType.GENERAL, MessageType.KUDOS, MessageType.AWARD
            ];

            groupByString = "message.id";
            let metaDataResponse = await getWorkerAssociatedSiteAndAgency(loggedInUser);
            whereConditionString += getMessageReceiverWorkerDBCondition(metaDataResponse, params.view)

            break;
        }
    }

    let dbResponse = await getWorkerSideMessagesListFromDatabase(
        whereConditionString, sortBy, sortType, page, limit, loggedInUser, messageTypes, params.type, groupByString
    );

    let parsedResponse = await parseWorkerMessages(dbResponse[1], params.view, params.type);

    return [200, {
        ok: true,
        result: parsedResponse[0],
        count: parseInt(dbResponse[0]),
        logo: parsedResponse[1],
        unread_message_count: parseInt(dbResponse[2].unread_message_count)
    }];
};

const getMessageReceiverWorkerDBCondition = (dbRecords: any, viewType: any) => {
    let condition = "";

    dbRecords.forEach((workerDetails) => {
        if (viewType === WorkerSideMessagesScreenViewType.AGENCY) {
            condition += ` (message.client_id = ${workerDetails.client_id} AND message.agency_id = ${workerDetails.agency_id} AND site_id=${workerDetails.site_id}) OR `;
        } else if (viewType === WorkerSideMessagesScreenViewType.CLIENT) {
            condition += ` (message.client_id = ${workerDetails.client_id} AND site_id=${workerDetails.site_id} AND message.agency_id IS NULL) OR `;
        } else {
            condition += ` (message.client_id = ${workerDetails.client_id} AND site_id=${workerDetails.site_id} AND (message.agency_id = ${workerDetails.agency_id} OR message.agency_id IS NULL)) OR `;
        }
    })

    return condition.slice(0, -3);;
}


const parseWorkerMessages = async (messageList: Array<any>, view: string = null, type: string) => {

    let response = [];
    let id = null;
    let logo = "";
    let shiftIdObj = {};
    let departmentIdObj = {};
    let jobIdObj = {};
    let workersObj = {};
    let siteObj;

    if (type === WorkerSideMessagesType.FEED) {
        const [workersList, siteList, jobIdList, departmentIdList, shiftIdList] = getMessageReceiverList(messageList);

        let {shiftIdDetail, departmentIdDetail, jobIdDetail, workersDetail, siteDetail} = await EasyPromiseAll({
            shiftIdDetail: shiftIdList.length ? await getShiftNames(shiftIdList) : [],
            departmentIdDetail: departmentIdList.length ? getDepartmentNames(departmentIdList) : [],
            jobIdDetail: jobIdList.length ? getJobNames(jobIdList) : [],
            workersDetail: workersList.length ? getWorkerNamesByIds(workersList) : [],
            siteDetail: siteList.length ? getSiteNamesById(siteList) : [],
        });

        shiftIdObj = shiftIdDetail && arrayOfObjectsToObject(shiftIdDetail, "id", "name");
        departmentIdObj = departmentIdDetail && arrayOfObjectsToObject(departmentIdDetail, "id", "name");
        jobIdObj = jobIdDetail && arrayOfObjectsToObject(jobIdDetail, "id", "name");
        workersObj = workersDetail && arrayOfObjectsToObject(workersDetail, "id", "user_name");
        siteObj = siteDetail && arrayOfObjectsToObject(siteDetail, "id", "name");
    }

    for await (const message of messageList) {

        if (view) {
            if (view === WorkerSideMessagesScreenViewType.CLIENT && !id) {
                id = message.client_id;
            } else if (view === WorkerSideMessagesScreenViewType.AGENCY && !id) {
                id = message.agency_id;
            }
        }

        response.push({
            id: message.message_id,
            sender: message.agency_id || message.message_type === MessageType.SYSTEM ? "A" : "C",
            from: message.message_from,
            title: message.message_title,
            body: message.message_body ? JSON.parse(message.message_body) : message.message_body,
            created_at: message.message_receiver_workers_created_at,
            is_message_read: Boolean(message.is_message_read),
            user_name: (message.message_type !== MessageType.GENERAL && type === WorkerSideMessagesType.FEED) ? getReceiverName(
                message.message_receiver || [], message.site_id, shiftIdObj, departmentIdObj, jobIdObj, workersObj, siteObj
                ) : "",
            message_receiver_worker_id: message.message_receiver_workers_id,
            type: message.message_type.toLowerCase()
        })
    }

    if (view === WorkerSideMessagesScreenViewType.CLIENT && id) {
        logo = (await getClientsById(id))['resource'];
    } else if (view === WorkerSideMessagesScreenViewType.AGENCY && id) {
        logo = (await getAgencyById(id, false))['resource'];
    }
    return [response, logo];
}

/**
 * Get receiver name to display in mobile application
 * @param  {} receiver
 */
const getReceiverName = (receiver, siteId, shiftIdObj, departmentIdObj, jobIdObj, workersObj, siteObj) => {
    let receiverString = "";

    if (!receiver || !receiver.length) {
        return ""
    } else {
        if (receiver[0].type == "workers" && (!receiver[0].data || !receiver[0].data.length)) {
            receiverString = siteObj[siteId] ? `Site: ${siteObj[siteId]}` : ""
        } else if (receiver[0].type == "workers") {
            let data = [];
            receiver[0].data.forEach((workerId) => {
                workersObj[workerId] && data.push(workersObj[workerId]);
            })
            receiverString = data.join(", ");
        } else {
            let groupReceivers = []
            receiver.forEach((group) => {

                if (group.type === "department") {
                    let data = [];
                    group.data.forEach((id) => {
                        departmentIdObj[id] && data.push(departmentIdObj[id]);
                    });
                    groupReceivers.push(`Department: ${data.join(", ")}`);
                } else if (group.type === "shift") {
                    let data = [];
                    group.data.forEach((id) => {
                        shiftIdObj[id] && data.push(shiftIdObj[id]);
                    }); 
                    groupReceivers.push(`Shift: ${data.join(", ")}`);
                } else if (group.type === "job") {
                    let data = [];
                    group.data.forEach((id) => {
                        jobIdObj[id] && data.push(jobIdObj[id]);
                    });
                    groupReceivers.push(`Role: ${data.join(", ")}`);
                } else if (group.type === "nationality") {
                    groupReceivers.push(`Nationality: ${group.data.join(", ")}`);
                }
            })
            receiverString = groupReceivers.join(" | ")
        }
        return receiverString;
    }
}

/**
 * Get message receiver groups
 * @param  {Array<any>} messageList
 */
const getMessageReceiverList = (messageList: Array<any>) => {
    let shiftIdList = [];
    let departmentIdList = [];
    let jobIdList = [];
    let workersList = [];
    let siteList = [];

    messageList.forEach(message => {
        message.message_receiver = message.message_receiver ? JSON.parse(message.message_receiver) : []
        if (!message.message_receiver || (message.message_receiver[0] && (!message.message_receiver[0].data || !message.message_receiver[0].data.length))) {
            siteList.push(message.site_id)
        }
        (message.message_receiver).forEach(element => {
            if (element.type === "workers") {
                workersList.push(...element.data);
            } else if (element.type === "department") {
                departmentIdList.push(...element.data);
            } else if (element.type === "shift") {
                shiftIdList.push(...element.data);
            } else if (element.type === "job") {
                jobIdList.push(...element.data);
            }
        });
    });

    return [
        [...new Set(workersList)],
        [...new Set(siteList)],
        [...new Set(jobIdList)],
        [...new Set(departmentIdList)],
        [...new Set(shiftIdList)]
    ]
}

/**
 * create a new message template for sending messages
 * @param  {any} payload
 * @param  {number} loggedInUser
 */
export const createMessageTemplateService = async (payload: any, loggedInUser: number) => {
    try {
        // Add new message template into the database
        let templateInsert = [{
            name: payload.name,
            title: payload.title,
            type: payload.type,
            from: payload.from,
            body: payload.body,
            createdBy: loggedInUser.toString(),
            modifiedBy: loggedInUser.toString()
        }]
        let messageTemplate = await createMessageTemplate(templateInsert);
        return [
            201,
            {
                ok: true,
                id: messageTemplate[0].id,
                message: MessageActions.TEMPLATE
            },
        ];
    } catch (err) {
        if (err.code === ErrorCodes.duplicateKeyError) {
            return [409, ErrorResponse.TemplateNameAlreadyExists]    // Return 409 if template name already exists
        } else {
            notifyBugsnag(err);
            return [500, err.message]
        }
    }
}

/**
 * update existing templates by templateId
 * @param  {number} id
 * @param  {any} payload
 * @param  {number} loggedInUser
 */
export const updateMessageTemplateService = async (id: number, payload: any, loggedInUser: number) => {
    let updateResponse = await updateMessageTemplate(id, payload, loggedInUser);
    if (!updateResponse.affected) {
        return [404, ErrorResponse.ResourceNotFound]        // Return 404 if any foreign key contraint is not available in DB
    }
    return [200, {
        ok: true,
        message: MessageActions.UPDATE_TEMPLATE,
    }];
};

/**
 * get list of available templates
 * @param  {Number} loggedInUser
 */
export const getTemplateListService = async (loggedInUser: number, params: any) => {
    let templates = await getTemplateList(loggedInUser, params);
    return [200, {
        ok: true,
        templates
    }];
};

/**
 * Get training message details for the worker
 * @param  {number} loggedInUser
 * @param  {number} messageId
 */
export const getWorkerTrainingMessageDetailsService = async (messageId: number, loggedInUser: number) => {

    let message = await getTrainingMessageDetails(messageId, loggedInUser);

    if (!message) return [404, ErrorResponse.ResourceNotFound]

    return [200, {
        ok: true,
        result: {
            id: message.message_id,
            sender: message.agency_id ? "A" : "C",
            from: message.message_from,
            title: message.message_title,
            body: message.message_body ? JSON.parse(message.message_body) : message.message_body,
            created_at: message.message_created_at,
            user_name: message.user_name,
            is_training_completed: Boolean(message.is_training_completed),
            training_completed_at: message.training_completed_at,
            require_more_training: Boolean(message.require_more_training),
            require_training_updated_at: message.require_training_updated_at
        },
    }];
};

/**
 * Update the message read status
 * @param  loggedInUser
 * @param  {number} messageId
 */
export const updateMessageStatusService = async (messageId: number, loggedInUser) => {
    let message = await getMessageDetailsModel(messageId);
    if (!message) return [404, ErrorResponse.ResourceNotFound]

    await updateMessageReadStatusHelper(messageId, parseInt(loggedInUser.user_id))
    return [200, { ok: true }]
};


/**
 * Get message details
 * @param  {number} loggedInUser
 * @param  {number} messageId
 * @param  {number} messageReceiverWorkerId
 */
export const getMessageDetailsService = async (messageId: number, messageReceiverWorkerId: number) => {
    let message = await getMessageDetailsModel(messageId, messageReceiverWorkerId);

    if (!message) return [404, ErrorResponse.ResourceNotFound]
    return [200, {
        ok: true,
        result: {
            id: message.message_id,
            sender: message.agency_id || message.message_type === MessageType.SYSTEM ? "A" : "C",
            from: message.message_from,
            title: message.message_title,
            body: message.message_body ? JSON.parse(message.message_body) : message.message_body,
            created_at: message.createdAt ? message.createdAt : message.message_created_at,
            type: message.message_type.toLowerCase()
        },
    }];
};

/**
 * Get message template details by templateId
 * @param  {number} templateId
 */
export const getMessageTemplateService = async (templateId: number) => {
    let template = await getMessageTemplateDetails(templateId);
    if (!template) return [404, ErrorResponse.ResourceNotFound]
    template.body = JSON.parse(template.body)          //parse body from JSON string
    return [200, {
        ok: true,
        template
    }];
};

export const sendDefaultMessageTemplate = async (id: number) => {
    const payload = await getDefaultMessageTemplate();

    let templateInsert = []
    templateInsert = payload.map(payload => {
        return {
            name: payload.name,
            title: payload.title,
            type: payload.type,
            from: payload.from,
            body: JSON.parse(payload.body),
            createdBy: id.toString(),
            modifiedBy: id.toString()
        }
    })
    await createMessageTemplate(templateInsert);
}
