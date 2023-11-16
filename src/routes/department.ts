/**
 * All the department related APIs.
 */

const express = require('express');
export const router = express.Router();

import { checkPermission } from './../middlewares/permission';
import { authorizeJwtToken } from './../middlewares/auth';
import { department, UserType } from './../common';
import { createDepartment, updateDepartment, getDepartmentList } from '../api';

// APIs
router.route(department.CREATE_AND_GET_LIST_OF_DEPARTMENT)
    .post(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN]), createDepartment)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.AGENCY_ADMIN, UserType.CLIENT_SITE, UserType.CLIENT_REGIONAL, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getDepartmentList);

router.route(department.UPDATE_DEPARTMENT)
    .put(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN]), updateDepartment)
