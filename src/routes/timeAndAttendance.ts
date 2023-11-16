/**
 * All the TIME AND ATTENDANCE related APIs.
 */

const express = require('express');
export const router = express.Router();

import { checkPermission } from './../middlewares/permission';
import { authorizeJwtToken } from './../middlewares/auth';
import { timeAndAttendance, UserType } from './../common';
import { uploadTimeAndAttendance, getListOfTimeAndAttendance, getDetailOfTimeAndAttendance, downloadTimeAndAttendanceSampleFile } from '../api';
const upload = require("express-fileupload");
// APIs

router.route(timeAndAttendance.UPLOAD_TIME_AND_ATTENDANCE)
    .post(authorizeJwtToken, checkPermission([UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), upload(), uploadTimeAndAttendance);

// router.route(timeAndAttendance.GET_LIST_OF_TIME_AND_ATTENDANCE)
//     .get(authorizeJwtToken, checkPermission([UserType.AGENCY_ADMIN, UserType.CLIENT_ADMIN, UserType.CLIENT_SITE]), getListOfTimeAndAttendance);

router.route(timeAndAttendance.GET_TIME_AND_ATTENDANCE_SAMPLE_SHEET)
    .get(authorizeJwtToken, checkPermission([UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), downloadTimeAndAttendanceSampleFile);

// router.route(timeAndAttendance.GET_DETAIL_OF_TIME_AND_ATTENDANCE)
//     .get(authorizeJwtToken, checkPermission([UserType.AGENCY_ADMIN, UserType.CLIENT_ADMIN, UserType.CLIENT_SITE]), getDetailOfTimeAndAttendance);
