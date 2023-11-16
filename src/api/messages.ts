import { validateRequestData } from './../utils';
import {
    SendMessageRequestSchema, SendMessageRequestParamsSchema, GetSentMessageListSchema, CreateMessageTemplateSchema,
    QueryParamsSchemaWithIdOnly, getWorkerSideMessagesListSchema, GeTemnplateListSchema, GetMessageRequestParamsSchema
} from './../common';
import {
    sendMessageToWorkersService, getSentMessagesListService, createMessageTemplateService, updateMessageTemplateService,
    getWorkerSideMessagesListService, getWorkerTrainingMessageDetailsService, updateMessageStatusService,
    getMessageDetailsService, getTemplateListService, getMessageTemplateService
} from '../services';
import { notifyBugsnag } from '../utils';

/**
 * Send new message to workers
 * @param req Request
 * @param res Response
 */
export const sendMessageToWorkers = async (req, res, next) => {
    try {
        // Validate request body
        await validateRequestData(SendMessageRequestParamsSchema, req.query);
        await validateRequestData(SendMessageRequestSchema, req.body);
        let response = await sendMessageToWorkersService(req.body, req.user.user_id, req.query);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};


/**
 * Get list of sent messages 
 * @param req Request
 * @param res Response
 */
export const getSentMessagesList = async (req, res, next) => {
    try {
        // Validate request body
        let response = await getSentMessagesListService(
            req.user.user_id,
            await validateRequestData(GetSentMessageListSchema, req.query)
        );
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};


/**
 * Get list of messages for the workers to display in mobile application
 * @param req Request
 * @param res Response
 */
export const getWorkerSideMessagesList = async (req, res, next) => {
    try {
        // Validate request body
        let params = await validateRequestData(getWorkerSideMessagesListSchema, req.query);
        params.sort_by = "created_at"
        params.sort_type = "DESC"
        let response = await getWorkerSideMessagesListService(req.params.user_id, params);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};


/**
 * Get training message details
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const getTrainingMessageDetails = async (req, res, next) => {
    try {
        await validateRequestData(QueryParamsSchemaWithIdOnly, req.params);
        let response = await getWorkerTrainingMessageDetailsService(req.params.id, req.user.user_id);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

/**
 * Get message details to display that into the mobile app 
 * @param req Request
 * @param res Response
 */
export const getMessageDetails = async (req, res, next) => {
    try {
        await validateRequestData(QueryParamsSchemaWithIdOnly, req.params);          // Validate path params
        await validateRequestData(GetMessageRequestParamsSchema, req.query);        // Validate query params
        let response = await getMessageDetailsService(req.params.id, req.query.message_receiver_worker_id);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};


/**
 * create a new message template
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const createMessageTemplate = async (req, res, next) => {
    try {
        // Validate request body
        await validateRequestData(CreateMessageTemplateSchema, req.body);
        let response = await createMessageTemplateService(req.body, req.user.user_id);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

/**
 * Update existing templates
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const updateMessageTemplate = async (req, res, next) => {
    try {
        // Validate query params
        await validateRequestData(QueryParamsSchemaWithIdOnly, req.params);
        // Validate request body
        await validateRequestData(CreateMessageTemplateSchema, req.body);
        let response = await updateMessageTemplateService(req.params.id, req.body, req.user.user_id);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

/**
 * get list of available templates
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const getMessageTemplateList = async (req, res, next) => {
    try {
        let response = await getTemplateListService(
            req.user.user_id,
            await validateRequestData(GeTemnplateListSchema, req.query)
        );
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};


/**
 * Update available templates
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const updateMessageStatus = async (req, res, next) => {
    try {
        await validateRequestData(QueryParamsSchemaWithIdOnly, req.params);
        let response = await updateMessageStatusService(req.params.id, req.user);
        res.status(response[0]).json(response[1]);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * Get existing template details
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const getMessageTemplate = async (req, res, next) => {
    try {
        await validateRequestData(QueryParamsSchemaWithIdOnly, req.params);
        let response = await getMessageTemplateService(req.params.id);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};
