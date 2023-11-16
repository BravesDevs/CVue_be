/**
 * All the job related APIs.
 */

const express = require('express');
export const router = express.Router();

import { checkPermission } from '../middlewares/permission';
import { authorizeJwtToken } from '../middlewares/auth';
import {
    activityAllStats, activityBottomDeck, dashboardLeaversBottonDeck, dashboardLeaversTopDeck, dashboardWorkForce,
    dashboardWorkForceBottomDeck, header, UserType, dashboardDemographics, trendsAnalysis
} from '../common';
import {
    getWorkerDemographicsData, getLengthOfService, getLeaversCountAndStarterRetention, getLeaversShiftUtilization,
    getAgencyWiseLeaversLengthOfService, getAgencyWiseLeaversCountAndStarterRetention, getAgencyWiseLeaversShiftUtilization, getWorkForceShiftUtilization,
    getWorkForceLengthOfService, getAgencyWiseWorkForceLengthOfService, getAgencyWiseWorkForceDemoGraphics, getAgencyWiseWorkShiftUtilization,
    getActivityAllStats, getActivityHeadCount, getActivitySpend, getActivityAverageHours, getHeaderStats,
    getLeaversAnalysis, getRatings, getWorkForcePoolUtilization, getLeavers, getActivityShiftDetails, getGenderAnalytics, getProximityAnalytics, getLeaverPoolUtilization,
    getAgeAnalytics, getSpendTrendsAnalystics, getHoursTrendsAnalystics, getTotalHeadsTrendsAnalystics, getLeaversTrendsAnalystics, getSiteRatingsTrendsAnalystics,
    getAgencyRatingsTrendsAnalystics, getCompanyRatingsTrendsAnalystics
} from '../api';

// Routes for work force top deck.
router.route(dashboardWorkForce.DASHBOARD_WORKER_DEMOGRAPHICS)
    .get(authorizeJwtToken, checkPermission([UserType.AGENCY_ADMIN, UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getWorkerDemographicsData);

router.route(dashboardWorkForce.DASHBOARD_WORKER_SHIFT_UTILIZATION)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getWorkForceShiftUtilization);

router.route(dashboardWorkForce.DASHBOARD_WORKER_LENGTH_OF_SERVICE)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getWorkForceLengthOfService);

router.route(dashboardWorkForce.POOL_UTILIZATION)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getWorkForcePoolUtilization);




//Dashboard Leavers top Deck
router.route(dashboardLeaversTopDeck.LEAVERS_COUNT_AND_STARTER_RETENTION)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getLeaversCountAndStarterRetention);

router.route(dashboardLeaversTopDeck.LEAVERS_SHIFT_UTILIZATION)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getLeaversShiftUtilization);

router.route(dashboardLeaversTopDeck.LEAVERS_LENGTH_OF_SERVICE)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getLengthOfService);

router.route(dashboardLeaversTopDeck.POOL_UTILIZATION)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getLeaverPoolUtilization);


//Routes for Leavers bottom deck

router.route(dashboardLeaversBottonDeck.AGENCY_WISE_LEAVERS_LENGTH_OF_SERVICE)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getAgencyWiseLeaversLengthOfService);

router.route(dashboardLeaversBottonDeck.AGENCY_WISE_LEAVERS_COUNT_AND_STARTER_RETENTION)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getAgencyWiseLeaversCountAndStarterRetention);

router.route(dashboardLeaversBottonDeck.AGENCY_WISE_LEAVERS_SHIFT_UTILIZATION)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getAgencyWiseLeaversShiftUtilization);

router.route(dashboardLeaversBottonDeck.LEAVERS)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getLeavers);


//Routes for workforce bottom deck.
router.route(dashboardWorkForceBottomDeck.DASHBOARD_WORKER_LENGTH_OF_SERVICE)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getAgencyWiseWorkForceLengthOfService);

router.route(dashboardWorkForceBottomDeck.DASHBOARD_WORKER_DEMOGRAPHICS)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getAgencyWiseWorkForceDemoGraphics);

router.route(dashboardWorkForceBottomDeck.DASHBOARD_WORKER_SHIFT_UTILIZATION)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getAgencyWiseWorkShiftUtilization);

router.route(dashboardWorkForceBottomDeck.HEAD_COUNT)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getActivityHeadCount);

//Routes for activity top deck.
router.route(activityAllStats.ALL_STATS)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getActivityAllStats);


//Routes for activity Bottom Deck
router.route(activityBottomDeck.SPEND)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getActivitySpend);

router.route(activityBottomDeck.AVERAGE_HOURS)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getActivityAverageHours);

router.route(activityBottomDeck.SHIFT_DETAILS)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getActivityShiftDetails);


//Routes for Header.
router.route(header.HEADER_STATS)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getHeaderStats);

router.route(header.LEAVERS_ANALYSIS)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getLeaversAnalysis);

router.route(header.RATINGS)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getRatings);


// Routes for demographics page APIs
router.route(dashboardDemographics.GENDER)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getGenderAnalytics);

router.route(dashboardDemographics.PROXIMITY)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getProximityAnalytics);

router.route(dashboardDemographics.AGE)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getAgeAnalytics);

// Routes for trends page APIs
router.route(trendsAnalysis.GET_STANDARD_OVERTIME_SPEND)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.CLIENT_REGIONAL, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getSpendTrendsAnalystics);

router.route(trendsAnalysis.GET_STANDARD_OVERTIME_HOURS)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.CLIENT_REGIONAL, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getHoursTrendsAnalystics);

router.route(trendsAnalysis.GET_TOTAL_HEADS)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.CLIENT_REGIONAL, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getTotalHeadsTrendsAnalystics);

router.route(trendsAnalysis.GET_LEAVERS_ANALYSIS)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.CLIENT_REGIONAL, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getLeaversTrendsAnalystics);

router.route(trendsAnalysis.SITE_RATING)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.CLIENT_REGIONAL, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getSiteRatingsTrendsAnalystics);

router.route(trendsAnalysis.AGENCY_RATING)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.CLIENT_REGIONAL, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getAgencyRatingsTrendsAnalystics);

router.route(trendsAnalysis.COMPANY_RATING)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.CLIENT_REGIONAL, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getCompanyRatingsTrendsAnalystics);
