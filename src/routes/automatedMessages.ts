/**
 * All the Automated Messages related APIs.
 */

const express = require('express');
export const router = express.Router();

import { schedulerEventsAuth } from './../middlewares/auth';
import { automatedMessages } from './../common';
import { sendTimelineCompletionMessages, sendBirthdayMessages, sendWorkerInactiveMessages,
    sendFirstDayWelcomeMessage } from '../api';

// APIs
router.route(automatedMessages.TIMELINE_MESSAGES)
    .post(schedulerEventsAuth, sendTimelineCompletionMessages);

router.route(automatedMessages.BIRTHDAY_MESSAGES)
    .post(schedulerEventsAuth, sendBirthdayMessages);

router.route(automatedMessages.WORKER_INACTIVE_MESSAGES)
    .post(schedulerEventsAuth, sendWorkerInactiveMessages);

router.route(automatedMessages.FIRST_DAY_WELCOME_MESSAGE)
    .post(schedulerEventsAuth, sendFirstDayWelcomeMessage);
