import {
    sendTimelineCompletionMessagesService, sendBirthdayMessagesService,
    workerInactiveMessagesService, sendFirstDayWelcomeMessageService
} from '../services';
import { notifyBugsnag } from '../utils';

/**
 * Send messages to the workers on completion of certain timeline
 * @param req Request
 * @param res Response
 */
export const sendTimelineCompletionMessages = async (req, res, next) => {
    try {
        let response = await sendTimelineCompletionMessagesService();
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};



/**
 * Send messages to the workers for thier birthday
 * @param req Request
 * @param res Response
 */
 export const sendBirthdayMessages = async (req, res, next) => {
    try {
        let response = await sendBirthdayMessagesService();
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};


/**
 * Send messages to the remaining inactive for last week and for last 2 weeks
 * @param req Request
 * @param res Response
 */
 export const sendWorkerInactiveMessages = async (req, res, next) => {
    try {
        let response = await workerInactiveMessagesService();
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};


/**
 * Send first day welcome message to the workers
 * @param req Request
 * @param res Response
 */
 export const sendFirstDayWelcomeMessage = async (req, res, next) => {
    try {
        let response = await sendFirstDayWelcomeMessageService();
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};
