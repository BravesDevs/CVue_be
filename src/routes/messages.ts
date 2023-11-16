/**
 * All the messages related APIs.
 */

const express = require('express');
export const router = express.Router();

import { checkPermission } from './../middlewares/permission';
import { authorizeJwtToken } from './../middlewares/auth';
import { message, UserType } from './../common';
import {
    sendMessageToWorkers, getSentMessagesList, getWorkerSideMessagesList, updateMessageTemplate, createMessageTemplate,
    getTrainingMessageDetails, updateMessageStatus, getMessageDetails, getMessageTemplateList, getMessageTemplate
} from '../api';

// APIs
router.route(message.MESSAGE)
    .post(authorizeJwtToken, checkPermission([UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), sendMessageToWorkers)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getSentMessagesList)


router.route(message.MESSAGE_DETAILS)
    .get(authorizeJwtToken, checkPermission([UserType.AGENCY_WORKER]), getMessageDetails)

router.route(message.WORKER_SIDE_MESSAGES_LIST)
    .get(authorizeJwtToken, checkPermission([UserType.AGENCY_WORKER]), getWorkerSideMessagesList)

router.route(message.TEMPLATES)
    .post(authorizeJwtToken, checkPermission([UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), createMessageTemplate)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getMessageTemplateList)

router.route(message.UPDATE_TEMPLATES)
    .put(authorizeJwtToken, checkPermission([UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), updateMessageTemplate)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getMessageTemplate)

router.route(message.TRAINING_MESSAGE_DETAILS)
    .get(authorizeJwtToken, checkPermission([UserType.AGENCY_WORKER]), getTrainingMessageDetails)

router.route(message.UPDATE_MESSAGE_STATUS)
    .put(authorizeJwtToken, checkPermission([UserType.AGENCY_WORKER]), updateMessageStatus)