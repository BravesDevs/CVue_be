import { validateRequestData } from './../utils';
import { PaginationSchema, PayrollListPaginationSchema } from './../common';
import { getDashboardClientsListService, getDashboardAgencyListService, getDashboardSectorsListService, getDashboardAnalyticsDataService, getDashboardPayrollDataService } from '../services'
import { notifyBugsnag } from '../utils'

/**
 * Get list of clients for the dashboard
 * @param req Request
 * @param res Response
 */

export const getDashboardClientsList = async (req, res, next) => {
    try {
        await validateRequestData(PaginationSchema, req.query);
        let response = await getDashboardClientsListService(req.query.page, req.query.limit, req.query.sort_by, req.query.sort_type);
        res.status(200).json(response);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};


/**
 * Get list of agencies for the dashboard
 * @param req Request
 * @param res Response
 */

export const getDashboardAgencyList = async (req, res, next) => {
    try {
        await validateRequestData(PaginationSchema, req.query);
        let response = await getDashboardAgencyListService(req.query.page, req.query.limit, req.query.sort_by, req.query.sort_type);
        res.status(200).json(response);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};



/**
 * Get list of sectors for the dashboard
 * @param req Request
 * @param res Response
 */

export const getDashboardSectorsList = async (req, res, next) => {
    try {
        await validateRequestData(PaginationSchema, req.query);
        let response = await getDashboardSectorsListService(req.query.page, req.query.limit, req.query.sort_by, req.query.sort_type);
        res.status(200).json(response);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};


/**
 * Get dashboard analytics data
 * @param req Request
 * @param res Response
 */

export const getDashboardAnalyticsData = async (req, res, next) => {
    try {
        let response = await getDashboardAnalyticsDataService();
        res.status(200).json(response);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};
/**
 * Get dashboard payroll data
 * @param req Request
 * @param res Response
 */

export const getDashboardPayrollData = async (req, res, next) => {
    try {
        await validateRequestData(PayrollListPaginationSchema, req.query);
        let response = await getDashboardPayrollDataService(req.query);
        res.status(200).json(response);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};
