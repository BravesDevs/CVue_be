import { validateRequestData, notifyBugsnag, getSignedUrlForGetObject } from './../utils';
import { PaginationSchema, QueryParamsSchemaWithIdOnly, payrollReportCsvSchema, payrollReportBodySchema, QueryParamsForPayrollSummary } from './../common';
import { getCalculatedPayrollService, addPayrollDataService, getPayrollSummaryService, downloadPayrollSummaryService } from '../services'
import { config } from '../configurations';
const path = require('path');
const csvParser = require('csvtojson');

/**
 * API to calculate the Payroll.
 * @param req
 * @param res
 * @param next
 */
export const getCalculatedPayroll = async (req, res, next) => {
    try {
        await validateRequestData(QueryParamsSchemaWithIdOnly, req.params);
        await validateRequestData(PaginationSchema, req.query);
        let response = await getCalculatedPayrollService(req.params.id, req.query);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to get the Payroll Summary.
 * @param req
 * @param res
 * @param next
 */
export const getPayrollSummary = async (req, res, next) => {
    try {
        await validateRequestData(QueryParamsForPayrollSummary, req.query);
        let response = await getPayrollSummaryService(req.query);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}


/**
 * API to download the Payroll Summary.
 * @param req
 * @param res
 * @param next
 */
export const downloadPayrollSummary = async (req, res, next) => {
    try {
        await validateRequestData(QueryParamsSchemaWithIdOnly, req.params);
        let response = await downloadPayrollSummaryService(req.params.id);
        res.setHeader('Content-Type', 'text/csv');
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to upload the Payroll Sheet.
 * @param req
 * @param res
 * @param next
 */
export const uploadPayroll = async (req, res, next) => {
    try {
        if (!req.files) {
            return res.status(400).json({
                "status": 400,
                "ok": false,
                "message": "Missing data for required fields.",
                "error": "BAD_REQUEST"
            });
        }
        let extension = path.extname(req.files.payroll_report.name);
        if (extension !== ".csv") {
            return res.status(400).json({
                "status": 400,
                "ok": false,
                "message": "Invalid file type.",
                "error": "BAD_REQUEST"
            })
        }
        let csv = String(req.files.payroll_report.data)
        let csvData = await csvParser().fromString(req.files.payroll_report.data.toString('utf8'));
        let payload = await validateRequestData(payrollReportCsvSchema, csvData, true);
        await validateRequestData(payrollReportBodySchema, req.body);
        let response = await addPayrollDataService(csv, payload, req.body, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to download sample document for Payroll.
 * @param req
 * @param res
 * @param next
 */
export const downloadPayrollSampleFile = async (req, res, next) => {
    try {
        let link = await getSignedUrlForGetObject(config.BUCKET_NAME, config.PAYROLL_REPORT_SAMPLE_FOLDER, config.PAYROLL_REPORT_SAMPLE_FILE_NAME);
        res.status(200).json({
            ok: true,
            "resource_url": link.url,
        })
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}