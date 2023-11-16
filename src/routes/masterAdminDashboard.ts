/**
 * All the job related APIs.
 */

const express = require('express');
export const router = express.Router();

import { checkPermission } from './../middlewares/permission';
import { authorizeJwtToken } from './../middlewares/auth';
import { masterAdminDashboard, UserType } from './../common';
import { getDashboardClientsList, getDashboardAgencyList, getDashboardSectorsList, getDashboardAnalyticsData, getDashboardPayrollData } from '../api';

// APIs

router.route(masterAdminDashboard.DASHBOARD_CLIENT_LIST)
    .get(authorizeJwtToken, checkPermission([UserType.CLEARVUE_ADMIN]), getDashboardClientsList);

router.route(masterAdminDashboard.DASHBOARD_AGENCY_LIST)
    .get(authorizeJwtToken, checkPermission([UserType.CLEARVUE_ADMIN]), getDashboardAgencyList);

router.route(masterAdminDashboard.DASHBOARD_SECTOR_LIST)
    .get(authorizeJwtToken, checkPermission([UserType.CLEARVUE_ADMIN]), getDashboardSectorsList);

router.route(masterAdminDashboard.DASHBOARD_ANALYTICS)
    .get(authorizeJwtToken, checkPermission([UserType.CLEARVUE_ADMIN]), getDashboardAnalyticsData);

router.route(masterAdminDashboard.DASHBOARD_PAYROLL_LIST)
    .get(authorizeJwtToken, checkPermission([UserType.CLEARVUE_ADMIN]), getDashboardPayrollData)