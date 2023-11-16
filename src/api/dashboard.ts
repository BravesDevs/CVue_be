import {
    getActivityAllStatsService,
    getActivityAverageHoursService,
    getActivityHeadCountService,
    getActivitySpendService,
    getAgencyWiseLeaversCountAndStarterRetentionService, getAgencyWiseLeaversLOSService,
    getAgencyWiseLeaversShiftUtilizationService, getAgencyWiseWorkForceDemoGraphicsService, getAgencyWiseWorkForceLengthOfServService, getAgencyWiseWorkShiftUtilizationService,
    getHeaderStatsService, getLeaversAnalysisService, getLeaversCountAndStarterRetentionService,
    getLeaversService,
    getLeaversShiftUtilizationService, getLeaversLengthOfServService, getRatingsService, getWorkerDemographicsDataService,
    getWorkForceLOSService,
    getWorkForcePoolUtilizationService, getLeaverPoolUtilizationService,
    getWorkForceShiftUtilizationService, getActivityShiftDetailsService, getGenderAnalyticsService, getProximityAnalyticsService, getAgeAnalyticsService,
    getSpendTrendsAnalysticsService, getHoursTrendsAnalysticsService, getTotalHeadsTrendsAnalysticsService, getLeaversTrendsAnalysticsService,
    getSiteRatingsTrendsAnalysticService, getAgencyRatingsTrendsAnalysticService, getCompanyRatingsTrendsAnalysticService
} from '../services';
import {
    dashboardApiSchema, dashboardApiWithDateFiltersSchema, dashboardWithoutAgencyIdApiSchema, QueryParamsForSurveyAnalysis,
    dashboardApiWithOutAgencyIdSchema, dashboardApiWithMandatoryDateFiltersSchema, demographicsDashboardSchema, dashboardTrendsFilterSchema, trendsAnalysisSchema
} from '../common';
import { validateRequestData, notifyBugsnag } from '../utils';


/*
    Workforce Top Deck APIs
*/

/**
 * API For workers demographics data.
 * @param req Request
 * @param res Response
 * @param next
 */
export const getWorkerDemographicsData = async (req, res, next) => {
    try {
        await validateRequestData(demographicsDashboardSchema, req.query);
        let response = await getWorkerDemographicsDataService(req.query);
        res.status(200).json(response);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

/**
 * API for workers shift utilization.
*/
export const getWorkForceShiftUtilization = async (req, res, next) => {
    try {
        await validateRequestData(dashboardApiWithDateFiltersSchema, req.query);
        let response = await getWorkForceShiftUtilizationService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}


/**
 * Fetch workers length of service.
*/
export const getWorkForceLengthOfService = async (req, res, next) => {
    try {
        await validateRequestData(dashboardApiWithDateFiltersSchema, req.query);
        let response = await getWorkForceLOSService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * Fetch Workforce pool utilization.
*/
export const getWorkForcePoolUtilization = async (req, res, next) => {
    try {
        await validateRequestData(dashboardApiWithDateFiltersSchema, req.query);
        let response = await getWorkForcePoolUtilizationService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * Leavers Top Deck APIs.
 * Leavers count.
*/
export const getLeaversCountAndStarterRetention = async (req, res, next) => {
    try {
        await validateRequestData(dashboardApiWithDateFiltersSchema, req.query);
        let response = await getLeaversCountAndStarterRetentionService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

export const getLeaversShiftUtilization = async (req, res, next) => {
    try {
        await validateRequestData(dashboardWithoutAgencyIdApiSchema, req.query);
        let response = await getLeaversShiftUtilizationService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

export const getLengthOfService = async (req, res, next) => {
    try {
        await validateRequestData(dashboardApiWithDateFiltersSchema, req.query);
        let response = await getLeaversLengthOfServService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * Fetch leaver pool utilization.
*/
export const getLeaverPoolUtilization = async (req, res, next) => {
    try {
        await validateRequestData(dashboardApiWithDateFiltersSchema, req.query);
        let response = await getLeaverPoolUtilizationService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * Leavers Bottom Deck APIs.
*/
export const getAgencyWiseLeaversLengthOfService = async (req, res, next) => {
    try {
        await validateRequestData(dashboardApiWithDateFiltersSchema, req.query);
        let response = await getAgencyWiseLeaversLOSService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

export const getAgencyWiseLeaversCountAndStarterRetention = async (req, res, next) => {
    try {
        await validateRequestData(dashboardWithoutAgencyIdApiSchema, req.query);
        let response = await getAgencyWiseLeaversCountAndStarterRetentionService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

export const getAgencyWiseLeaversShiftUtilization = async (req, res, next) => {
    try {
        await validateRequestData(dashboardWithoutAgencyIdApiSchema, req.query);
        let response = await getAgencyWiseLeaversShiftUtilizationService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

export const getLeavers = async (req, res, next) => {
    try {
        await validateRequestData(dashboardWithoutAgencyIdApiSchema, req.query);
        let response = await getLeaversService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}


/**
 * WorkForce Bottom Deck APIs.
*/

export const getAgencyWiseWorkForceLengthOfService = async (req, res, next) => {
    try {
        await validateRequestData(dashboardApiWithDateFiltersSchema, req.query);
        let response = await getAgencyWiseWorkForceLengthOfServService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

export const getAgencyWiseWorkForceDemoGraphics = async (req, res, next) => {
    try {
        await validateRequestData(dashboardApiSchema, req.query);
        let response = await getAgencyWiseWorkForceDemoGraphicsService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

export const getAgencyWiseWorkShiftUtilization = async (req, res, next) => {
    try {
        await validateRequestData(dashboardWithoutAgencyIdApiSchema, req.query);
        let response = await getAgencyWiseWorkShiftUtilizationService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * Activity top deck.
 */
export const getActivityAllStats = async (req, res, next) => {
    try {
        await validateRequestData(dashboardApiWithMandatoryDateFiltersSchema, req.query);
        let response = await getActivityAllStatsService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        next(err);
    }
}

/**
 * Activity Top Deck APIs.
 */

export const getActivityShiftDetails = async (req, res, next) => {
    try {
        await validateRequestData(dashboardWithoutAgencyIdApiSchema, req.query);
        let response = await getActivityShiftDetailsService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

export const getActivityHeadCount = async (req, res, next) => {
    try {
        await validateRequestData(dashboardWithoutAgencyIdApiSchema, req.query);
        let response = await getActivityHeadCountService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

export const getActivitySpend = async (req, res, next) => {
    try {
        await validateRequestData(dashboardWithoutAgencyIdApiSchema, req.query);
        let response = await getActivitySpendService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

export const getActivityAverageHours = async (req, res, next) => {
    try {
        await validateRequestData(dashboardApiWithDateFiltersSchema, req.query);
        let response = await getActivityAverageHoursService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * Header APIs.
*/
export const getHeaderStats = async (req, res, next) => {
    try {
        await validateRequestData(dashboardApiWithDateFiltersSchema, req.query);
        let response = await getHeaderStatsService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

export const getLeaversAnalysis = async (req, res, next) => {
    try {
        await validateRequestData(QueryParamsForSurveyAnalysis, req.query);
        let response = await getLeaversAnalysisService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

export const getRatings = async (req, res, next) => {
    try {
        await validateRequestData(dashboardApiWithDateFiltersSchema, req.query);
        let response = await getRatingsService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}


/**
 * Demographics APIs
 */

export const getGenderAnalytics = async (req, res, next) => {
    try {
        await validateRequestData(demographicsDashboardSchema, req.query);
        let response = await getGenderAnalyticsService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

export const getProximityAnalytics = async (req, res, next) => {
    try {
        await validateRequestData(demographicsDashboardSchema, req.query);
        let response = await getProximityAnalyticsService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

export const getAgeAnalytics = async (req, res, next) => {
    try {
        await validateRequestData(demographicsDashboardSchema, req.query);
        let response = await getAgeAnalyticsService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to get total spend for trends analysis
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const getSpendTrendsAnalystics = async (req, res, next) => {
    try {
        await validateRequestData(dashboardTrendsFilterSchema, req.query);
        let response = await getSpendTrendsAnalysticsService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to get total hours for trends analysis
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const getHoursTrendsAnalystics = async (req, res, next) => {
    try {
        await validateRequestData(dashboardTrendsFilterSchema, req.query);
        let response = await getHoursTrendsAnalysticsService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to get total heads for trends analysis
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */

export const getTotalHeadsTrendsAnalystics = async (req, res, next) => {
    try {
        await validateRequestData(dashboardTrendsFilterSchema, req.query);
        let response = await getTotalHeadsTrendsAnalysticsService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to get total leaver workers for trends analysis
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const getLeaversTrendsAnalystics = async (req, res, next) => {
    try {
        await validateRequestData(dashboardTrendsFilterSchema, req.query);
        let response = await getLeaversTrendsAnalysticsService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

export const getSiteRatingsTrendsAnalystics = async (req, res, next) => {
    try {
        await validateRequestData(trendsAnalysisSchema, req.query);
        let response = await getSiteRatingsTrendsAnalysticService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

export const getAgencyRatingsTrendsAnalystics = async (req, res, next) => {
    try {
        await validateRequestData(trendsAnalysisSchema, req.query);
        let response = await getAgencyRatingsTrendsAnalysticService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

export const getCompanyRatingsTrendsAnalystics = async (req, res, next) => {
    try {
        await validateRequestData(trendsAnalysisSchema, req.query);
        let response = await getCompanyRatingsTrendsAnalysticService(req.query);
        res.status(200).json(response);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}
