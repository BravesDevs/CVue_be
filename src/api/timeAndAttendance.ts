import { validateRequestData, getSignedUrlForGetObject, notifyBugsnag } from './../utils';
import { QueryParamsSchemaWithIdOnly, timeAndAttendanceCsvSchema, timeAndAttendanceIdsSchema } from './../common';
import { addTimeAndAttendance, getListOfTimeAndAttendanceService, getDetailOfTimeAndAttendanceService } from '../services'
import { config } from '../configurations';
const path = require('path');
const csvParser = require('csvtojson');

/**
 * API to upload and process the Time and Attendance data.
 * @param req
 * @param res
 * @param next
 */
export const uploadTimeAndAttendance = async (req, res, next) => {
    try {
        if (!req.files) {
            return res.status(400).json({
                "status": 400,
                "ok": false,
                "message": "Missing data for required fields.",
                "error": "BAD_REQUEST"
            });
        }
        let extension = path.extname(req.files.timeAndAttendance.name);
        if (extension !== ".csv") {
            return res.status(400).json({
                "status": 400,
                "ok": false,
                "message": "Invalid file type.",
                "error": "BAD_REQUEST"
            })
        }
        let csv = String(req.files.timeAndAttendance.data)
        let csvData = await csvParser().fromString(req.files.timeAndAttendance.data.toString('utf8'));
        let payload = await validateRequestData(timeAndAttendanceCsvSchema, csvData, true);
        await validateRequestData(timeAndAttendanceIdsSchema, req.body);
        // req.files.timeAndAttendance.name,
        let response = await addTimeAndAttendance(csv, payload, req.body, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to GET the list of Time and Attendance Data.
 * @param req
 * @param res
 * @param next
 */
export const getListOfTimeAndAttendance = async (req, res, next) => {
    try {
        let response = await getListOfTimeAndAttendanceService(req.user.client_id, req.query.page, req.query.limit, req.query.sort_by, req.query.sort_type);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to GET the details of the Time and Attendance.
 * @param req
 * @param res
 * @param next
 */
export const getDetailOfTimeAndAttendance = async (req, res, next) => {
    try {
        await validateRequestData(QueryParamsSchemaWithIdOnly, req.params);
        let response = await getDetailOfTimeAndAttendanceService(req.params.id, req.query.page, req.query.limit, req.query.sort_by, req.query.sort_type);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to download sample time and attendance.
 * @param req
 * @param res
 * @param next
 */
export const downloadTimeAndAttendanceSampleFile = async (req, res, next) => {
    try {
        let link = await getSignedUrlForGetObject(config.BUCKET_NAME, config.TIME_AND_ATTENDANCE_SAMPLE_FOLDER, config.TIME_AND_ATTENDANCE_SAMPLE_FILE_NAME);
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