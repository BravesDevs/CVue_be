/**
 * All the job related APIs.
 */

const express = require('express');
export const router = express.Router();

import { checkPermission } from './../middlewares/permission';
import { authorizeJwtToken } from './../middlewares/auth';
import { job, UserType } from './../common';
import { createJob, getJobList, getJobListForDropDown, updateJob, getJobNameListForDropDown } from '../api';

// APIs
router.route(job.CREATE_AND_GET_LIST_OF_JOB)
    .post(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN]), createJob)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.AGENCY_ADMIN, UserType.CLIENT_SITE, UserType.CLIENT_REGIONAL, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getJobList);

router.route(job.UPDATE_JOB)
    .put(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN]), updateJob)

router.route(job.GET_JOBS_DROPDOWN_BY_SITE)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.AGENCY_ADMIN, UserType.CLIENT_SITE, UserType.CLIENT_REGIONAL, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getJobListForDropDown);

router.route(job.GET_JOBS_NAME_DROPDOWN_BY_SITE)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.AGENCY_ADMIN, UserType.CLIENT_SITE, UserType.CLIENT_REGIONAL, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getJobNameListForDropDown);