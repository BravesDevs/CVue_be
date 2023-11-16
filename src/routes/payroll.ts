/**
 * All the PAYROLL related APIs.
 */

const express = require('express');
export const router = express.Router();
const upload = require("express-fileupload");

import { checkPermission } from './../middlewares/permission';
import { authorizeJwtToken } from './../middlewares/auth';
import { payroll, UserType } from './../common';
import { getCalculatedPayroll, uploadPayroll, getPayrollSummary, downloadPayrollSummary, downloadPayrollSampleFile } from '../api';
// APIs

router.route(payroll.GET_PAYROLL_DETAILS)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_SITE, UserType.CLEARVUE_ADMIN, UserType.CLIENT_REGIONAL]), getCalculatedPayroll);

router.route(payroll.UPLOAD_PAYROLL_AND_SUMMARY)
    .post(authorizeJwtToken, checkPermission([UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), upload(), uploadPayroll);

router.route(payroll.UPLOAD_PAYROLL_AND_SUMMARY)
    .get(authorizeJwtToken, checkPermission([UserType.AGENCY_ADMIN, UserType.CLIENT_SITE, UserType.CLIENT_ADMIN, UserType.CLEARVUE_ADMIN, UserType.CLIENT_REGIONAL, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getPayrollSummary);

router.route(payroll.DOWNLOAD_PAYROLL_CSV)
    .get(authorizeJwtToken, checkPermission([UserType.AGENCY_ADMIN, UserType.CLIENT_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), downloadPayrollSummary);

router.route(payroll.GET_PAYROLL_SAMPLE_SHEET)
    .get(authorizeJwtToken, checkPermission([UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), downloadPayrollSampleFile);