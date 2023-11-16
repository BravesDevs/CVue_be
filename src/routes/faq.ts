/**
 * All the faq related APIs.
 */
const express = require('express');
export const router = express.Router();

import { checkPermission } from './../middlewares/permission';
import { authorizeJwtToken } from './../middlewares/auth';
import { faq, UserType } from './../common';
import { getFaqList } from '../api';

// APIs
router.route(faq.GET_LIST_OF_FAQ).get(authorizeJwtToken, checkPermission([UserType.AGENCY_WORKER]), getFaqList);
