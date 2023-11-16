import {
    getTimelineQualifiedWorkerDetails, getWorkAnniversaryQualifiedWorkerDetails,
    getTimelineRelatedMessagesDetails, addRecordInMessageReceiverGroup, getBirthdayWorkerDetails,
    getMessageDetailsByLabel, getWorkerDetailsWhoRemainInactive, inactivateWorkers,
    getWorkersWhoseStartDateIsCurrentDate, getDeviceTokens, createSystemTypeMessage
} from "../models";
import { AutomatedMessagesLabels, MessageType } from "../common";
import { sendMessageNotification } from ".";
import { config } from "../configurations";
import { arrayToObject } from "../utils";

/**
 * Send timeline completion messages to the workers
 */
export const sendTimelineCompletionMessagesService = async () => {
    let timelineRelatedMessagesDetails =
        await getTimelineRelatedMessagesDetails();

    let messageDetailsByLabel = arrayToObject(
        timelineRelatedMessagesDetails,
        "label"
    );

    await sendAutomatedTimelineEventMessages(messageDetailsByLabel);
    await sendAnniversaryMessage(messageDetailsByLabel);
    return [
        200,
        {
            ok: true,
        },
    ];
};

/**
 * Send automated messages on completion of certain timeline
 * @param  {any} messageDetailsByLabel
 */
const sendAutomatedTimelineEventMessages = async (
    messageDetailsByLabel: any
) => {
    let daysDurationsWorkerDetails = {
        "7": {
            worker_ids: [],
            device_tokens: [],
        },
        "14": {
            worker_ids: [],
            device_tokens: [],
        },
        "28": {
            worker_ids: [],
            device_tokens: [],
        },
        "56": {
            worker_ids: [],
            device_tokens: [],
        },
        "84": {
            worker_ids: [],
            device_tokens: [],
        }
    };
    let timelineQualifiedWorkerDetails =
        await getTimelineQualifiedWorkerDetails();

    for (let element of timelineQualifiedWorkerDetails) {
        daysDurationsWorkerDetails[element.duration]["worker_ids"].push(element.id);
        element.device_token &&
            daysDurationsWorkerDetails[element.duration]["device_tokens"].push(
                element.device_token
            );
    }

    for (let key in daysDurationsWorkerDetails) {
        await sendDayDurationMessage(
            key,
            daysDurationsWorkerDetails,
            messageDetailsByLabel
        );
    }
};

/**
 * Send day wise messages and notifications to the workers
 * @param  {string} numberOfDays
 * @param  {any} workerDetails
 * @param  {any} messageDetailsByLabel
 */
const sendDayDurationMessage = async (
    numberOfDays: string,
    workerDetails: any,
    messageDetailsByLabel: any
) => {
    const messageNameMapping = {
        "7": AutomatedMessagesLabels.NEW_STARTER_WEEK_1,
        "14": AutomatedMessagesLabels.NEW_STARTER_WEEK_2,
        "28": AutomatedMessagesLabels.NEW_STARTER_WEEK_4,
        "56": AutomatedMessagesLabels.NEW_STARTER_WEEK_8,
        "84": AutomatedMessagesLabels.NEW_STARTER_WEEK_12
    };

    const workerIds = workerDetails[numberOfDays]
        ? workerDetails[numberOfDays].worker_ids
        : [];
    const messageDetails =
        messageDetailsByLabel[messageNameMapping[numberOfDays]];

    await sendAutomatedEventMessages(
        workerIds,
        messageDetails,
        workerDetails[numberOfDays].device_tokens || []
    );
};


/**
 * Send anniversary completion messages
 * @param  {any} messageDetailsByLabel
 */
const sendAnniversaryMessage = async (messageDetailsByLabel: any) => {
    let workAnniversaryQualifiedWorkerDetails =
        await getWorkAnniversaryQualifiedWorkerDetails();

    let workerIds = [];
    let deviceToken = [];

    if (workAnniversaryQualifiedWorkerDetails.length) {
        workAnniversaryQualifiedWorkerDetails.forEach((workerDetail) => {
            workerIds.push(workerDetail.id);
            workerDetail.device_token && deviceToken.push(workerDetail.device_token);
        })
        await sendAutomatedEventMessages(workerIds, messageDetailsByLabel[AutomatedMessagesLabels.ANNUAL_WORK_ANNIVERSARY], deviceToken);
    }
};

/**
 * Send Automated messages and notifications to the workers
 * @param  {Array<string>} workerIds
 * @param  {any} messageDetails
 * @param  {Array<string>} deviceTokens
 */
export const sendAutomatedEventMessages = async (
    workerIds: Array<number>,
    messageDetails: any,
    deviceTokens: Array<string>
) => {
    if (workerIds.length && messageDetails) {

        // Add record in message table
        let insertedMessage = await createSystemTypeMessage(messageDetails.id);

        if (insertedMessage && JSON.parse(JSON.stringify(insertedMessage)).insertId) {
            // Add record in message_receiver_workers table
            await addRecordInMessageReceiverGroup(
                JSON.parse(JSON.stringify(insertedMessage)).insertId,
                workerIds,
                config.DEFAULT_SYSTEM_USER_ID
            );

            // Send notification to the workers asynchronously
            if (deviceTokens.length) {
                sendMessageNotification(
                    null,
                    {
                        type: MessageType.GENERAL,
                        body: messageDetails.body,
                        title: messageDetails.title,
                    },
                    messageDetails.id,
                    { agency_id: 1 },
                    [...new Set(deviceTokens)]
                );
            }
        }
    }
};


/**
 * Send birthday messages to the workers
 */
export const sendBirthdayMessagesService = async () => {
    let workerDetails = await getBirthdayWorkerDetails();

    let workerIds = [];
    let deviceToken = [];

    if (workerDetails.length) {
        workerDetails.forEach((workerDetail) => {
            workerIds.push(workerDetail.id);
            workerDetail.device_token && deviceToken.push(workerDetail.device_token);
        });
        await sendAutomatedEventMessages(
            workerIds,
            await getMessageDetailsByLabel(AutomatedMessagesLabels.BIRTHDAY_MESSAGES),
            deviceToken
        );
    }
    return [
        200,
        {
            ok: true,
        },
    ];
};


/**
 * Send messages to the remaining inactive for last week and for last 2 weeks
 */
export const workerInactiveMessagesService = async () => {

    await sendWorkerInactiveMessages(2);
    await sendWorkerInactiveMessages(1);
    return [
        200,
        {
            ok: true,
        },
    ];
};

const sendWorkerInactiveMessages = async (week: number) => {
    let inactiveWorkerDetails = await getWorkerDetailsWhoRemainInactive(week);

    if (inactiveWorkerDetails.length) {
        let inactiveWorkerIds = [];
        let inactiveDeviceToken = [];

        inactiveWorkerDetails.forEach((workerDetail) => {
            inactiveWorkerIds.push(workerDetail.id);
            workerDetail.device_token && inactiveDeviceToken.push(workerDetail.device_token);
        });

        week === 2 && await inactivateWorkers(inactiveWorkerIds); // Inactivate workers if they are inactivate for 2 weeks
        await sendAutomatedEventMessages(
            inactiveWorkerIds,
            await getMessageDetailsByLabel(
                week == 2 ? AutomatedMessagesLabels.UNASSINGED_WORKER : AutomatedMessagesLabels.ZERO_HOURS_MESSAGE
            ),
            inactiveDeviceToken);
    }
};


/**
 * Send first day welcome message to the workers
 */
export const sendFirstDayWelcomeMessageService = async () => {

    let workerDetails = await getWorkersWhoseStartDateIsCurrentDate();

    if (workerDetails.length) {
        let workerIds = [];
        let deviceToken = [];

        workerDetails.forEach((workerDetail) => {
            workerIds.push(workerDetail.id);
            workerDetail.device_token && deviceToken.push(workerDetail.device_token);
        });

        await sendAutomatedEventMessages(
            workerIds,
            await getMessageDetailsByLabel(AutomatedMessagesLabels.FIRST_DAY_WELCOME_MESSAGE),
            deviceToken);
    }
    return [
        200,
        {
            ok: true,
        },
    ];
};


/**
 * Send unassigned messages to the workers
 * @param  {Array<string>} workerIds
 */
export const sendUnassignedWorkerMessages = async (workerIds: Array<number>) => {
    let workerDetails = await getDeviceTokens(workerIds);
    let deviceTokens = [];

    workerDetails.forEach((workerDetail) => {
        workerDetail.device_token && deviceTokens.push(workerDetail.device_token);
    })

    await sendAutomatedEventMessages(
        workerIds,
        await getMessageDetailsByLabel(AutomatedMessagesLabels.UNASSINGED_WORKER),
        deviceTokens);
};
