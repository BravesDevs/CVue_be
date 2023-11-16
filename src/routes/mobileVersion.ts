/**
 * All the mobile app related APIs.
 */
const express = require('express');
export const router = express.Router();

import { checkPermission } from './../middlewares/permission';
import { authorizeJwtToken } from './../middlewares/auth';
import { mobileVersion, UserType } from './../common';
import { getmobileVersion } from '../api';

// APIs
router.route(mobileVersion.GET_MOBILE_VERSION).get(authorizeJwtToken, checkPermission([UserType.AGENCY_WORKER]), getmobileVersion);
