/**
 * All the service layer methods for the TIME AND ATTENDANCE.
 */
const { EasyPromiseAll } = require('easy-promise-all');
const _ = require('lodash')
import { ErrorCodes, ErrorResponse, TimeAndAttendanceStatus } from "./../common";
import {
    addTimeAndAttendanceData,
    createTimeAndAttendance,
    getTimeAndAttendanceList,
    getTimeAndAttendance,
    getTimeAndAttendanceDetail,
    getWorkerByEmployeeIdAndAgencyId,
    getTimeAndAttendanceById,
    deleteTimeAndAttendanceById,
    getTimeAndAttendanceCount,
    getTimeAndAttendanceDataCount,
    getSiteById, deleteTimeAndAttendanceDataById
} from "./../models";
import { MessageActions } from "./../common";
import { uploadFileOnS3, deleteObject, notifyBugsnag, getNumberValue } from './../utils';
import { config } from "../configurations";
import { addPayrollDataAsPerTimeAndAttendance } from '.';
import { logger } from '../utils';

const uuid = require('uuid');

/**
 * Service to add T&A.
 */
export const addTimeAndAttendance = async (fileContent, timeAndAttendanceData, payload, loggedInUser) => {
    let timeAndAttendance: any = {};
    try {
        const exisitingTimeAndAttendance = await getTimeAndAttendance({
            startDate: payload.start_date,
            endDate: payload.end_date,
            agencyId: payload.agency_id,
            clientId: payload.client_id,
            siteId: payload.site_id
        });
        if (exisitingTimeAndAttendance) {
            return [409, ErrorResponse.FileAlreadyExists];
        }
        const fileName = uuid.v4();
        // upload s3
        const url = await uploadFileOnS3(
            config.BUCKET_NAME,
            config.TIME_AND_ATTENDANCE_FOLDER,
            fileName,
            "csv",
            fileContent
        );
        const timeAndAttendanceMetaData = {
            path: url.location,
            name: fileName,
            week: payload.week,
            status: TimeAndAttendanceStatus.PROCESSED,
            clientId: payload.client_id,
            agencyId: payload.agency_id,
            siteId: payload.site_id,
            startDate: payload.start_date,
            endDate: payload.end_date,
            createdBy: loggedInUser.user_id,
            updatedBy: loggedInUser.user_id,
        }
        timeAndAttendance = await createTimeAndAttendance(timeAndAttendanceMetaData);
        timeAndAttendance = await getTimeAndAttendanceById(timeAndAttendance.id);
        const { site, workers } = await EasyPromiseAll({
            site: getSiteById(payload.site_id),
            workers: getWorkerByEmployeeIdAndAgencyId(_.map(timeAndAttendanceData, 'employee_id').filter(x => Boolean(x)), payload.agency_id, _.map(timeAndAttendanceData, 'payroll_ref').filter(x => Boolean(x)))
        });
        const workerNotFoundEmployeeId = [];
        const workerNotFoundPayrollRef = [];
        let payrollDataObject = {};

        for (let i = 0; i < timeAndAttendanceData.length; i++) {
            let worker = null;

            if (timeAndAttendanceData[i].employee_id) {
                worker = _.find(workers, { employee_id: timeAndAttendanceData[i].employee_id, agency_id: payload.agency_id });

            } else if (timeAndAttendanceData[i].payroll_ref && !worker) {
                worker = _.find(workers, { payroll_ref: timeAndAttendanceData[i].payroll_ref, agency_id: payload.agency_id });

            }

            if(worker){
                timeAndAttendanceData[i].workerId = worker.id;
                timeAndAttendanceData[i].shiftId = worker.shift_id;
                timeAndAttendanceData[i].departmentId = worker.department_id;

                // Prepare object to process the payroll data
                if (payrollDataObject[worker.id]) {
                    payrollDataObject[worker.id].total_hour += getNumberValue(timeAndAttendanceData[i].week_hours);
                    payrollDataObject[worker.id].total_charge += getNumberValue(timeAndAttendanceData[i].total_charges);
                    payrollDataObject[worker.id].total_pay += getNumberValue(timeAndAttendanceData[i].standard_pay) + getNumberValue(timeAndAttendanceData[i].overtime_pay);
                } else {
                    payrollDataObject[worker.id] = {
                        worker_id: worker.id,
                        worker_dob: worker.dob,
                        worker_start_date: worker.start_date,
                        total_hour: getNumberValue(timeAndAttendanceData[i].week_hours),
                        total_charge: getNumberValue(timeAndAttendanceData[i].total_charges),
                        total_pay: getNumberValue(timeAndAttendanceData[i].standard_pay) + getNumberValue(timeAndAttendanceData[i].overtime_pay),
                    }
                }
            } else {
                timeAndAttendanceData[i].employee_id && workerNotFoundEmployeeId.push(timeAndAttendanceData[i].employee_id);
                timeAndAttendanceData[i].payroll_ref && workerNotFoundPayrollRef.push(timeAndAttendanceData[i].payroll_ref);
                !timeAndAttendanceData[i].payroll_ref && !timeAndAttendanceData[i].employee_id && workerNotFoundEmployeeId.push("''");
                !timeAndAttendanceData[i].payroll_ref && !timeAndAttendanceData[i].employee_id && workerNotFoundPayrollRef.push("''");
            }

            timeAndAttendanceData[i].payrollRef = timeAndAttendanceData[i].payroll_ref;
            timeAndAttendanceData[i].weeklyHours = timeAndAttendanceData[i].week_hours;
            timeAndAttendanceData[i].payType = timeAndAttendanceData[i].pay_type;
            timeAndAttendanceData[i].payRate = timeAndAttendanceData[i].pay_rate;
            timeAndAttendanceData[i].totalCharge = timeAndAttendanceData[i].total_charges;
            timeAndAttendanceData[i].standardCharge = timeAndAttendanceData[i].standard_charges;
            timeAndAttendanceData[i].overtimeCharge = timeAndAttendanceData[i].overtime_charges;
            timeAndAttendanceData[i].chargeRate = timeAndAttendanceData[i].charge_rate;
            timeAndAttendanceData[i].standardPay = timeAndAttendanceData[i].standard_pay;
            timeAndAttendanceData[i].overtimePay = timeAndAttendanceData[i].overtime_pay;
            timeAndAttendanceData[i].day_1 = timeAndAttendanceData[i].sun;
            timeAndAttendanceData[i].day_2 = timeAndAttendanceData[i].mon;
            timeAndAttendanceData[i].day_3 = timeAndAttendanceData[i].tue;
            timeAndAttendanceData[i].day_4 = timeAndAttendanceData[i].wed;
            timeAndAttendanceData[i].day_5 = timeAndAttendanceData[i].thu;
            timeAndAttendanceData[i].day_6 = timeAndAttendanceData[i].fri;
            timeAndAttendanceData[i].day_7 = timeAndAttendanceData[i].sat;
            timeAndAttendanceData[i].clientId = payload.client_id;
            timeAndAttendanceData[i].agencyId = payload.agency_id;
            timeAndAttendanceData[i].siteId = payload.site_id;
            timeAndAttendanceData[i].regionId = site.region_id;
            timeAndAttendanceData[i].createdBy = loggedInUser.user_id;
            timeAndAttendanceData[i].updatedBy = loggedInUser.user_id;
            timeAndAttendanceData[i].timeAndAttendanceId = timeAndAttendance.id;
            timeAndAttendanceData[i].week = payload.week;
            timeAndAttendanceData[i].startDate = payload.start_date;
            timeAndAttendanceData[i].endDate = payload.end_date;

        }

        let otherDetails = {
            client_id: payload.client_id,
            agency_id: payload.agency_id,
            site_id: payload.site_id,
            week: payload.week,
            start_date: payload.start_date,
            end_date: payload.end_date,
            time_and_attendance_id: timeAndAttendance.id
        }

        if (_.size(workerNotFoundEmployeeId) || _.size(workerNotFoundPayrollRef)) {
            if (timeAndAttendance.id) {
                await deleteObject(config.BUCKET_NAME, config.TIME_AND_ATTENDANCE_FOLDER, timeAndAttendance.name)
                await deleteTimeAndAttendanceById(timeAndAttendance.id);
            }

            logger.info(`Worker id does not match for employee id(s): (${workerNotFoundEmployeeId}) or payroll ref(s): (${workerNotFoundPayrollRef}). Other details: ${JSON.stringify(otherDetails)}`);

            return [400, {
                ok: false,
                message: `worker id does not match for employee id(s): (${workerNotFoundEmployeeId}) or payroll ref(s): (${workerNotFoundPayrollRef})`
            }]
        }
        
        // Add payroll report data
        await deleteTimeAndAttendanceDataById(timeAndAttendance.id);
        await addTimeAndAttendanceData(timeAndAttendanceData);
        await addPayrollDataAsPerTimeAndAttendance(
            Object.entries(payrollDataObject).map(e => e[1]),  otherDetails, loggedInUser
        );

        return [201, {
            'ok': true,
            message: MessageActions.CREATE_TIME_AND_ATTENDANCE,
        }]
    } catch (err) {
        if (timeAndAttendance.id) {
            await deleteObject(config.BUCKET_NAME, config.TIME_AND_ATTENDANCE_FOLDER, timeAndAttendance.name);
            await deleteTimeAndAttendanceDataById(timeAndAttendance.id);
            await deleteTimeAndAttendanceById(timeAndAttendance.id);
        }

        if (err.code === ErrorCodes.dbReferenceError) {
            return [404, ErrorResponse.ResourceNotFound]    // Return 404 if any foreign key contraint is not available in DB
        } else {
            notifyBugsnag(err);
            return [500, err.message]
        }
    }

};

/**
 * Service to GET T&A.
 */
export const getListOfTimeAndAttendanceService = async (client_id, page, limit, sortBy, sortType) => {
    const { timeAndAttendanceList, count } = await EasyPromiseAll({
        timeAndAttendanceList: getTimeAndAttendanceList(`client_id = ${client_id}`, page, limit, sortBy, sortType),
        count: getTimeAndAttendanceCount({ clientId: client_id })
    });
    return [200, {
        ok: true,
        time_and_attendance_list: timeAndAttendanceList,
        count
    }];
}

/**
 * Service to GET T&A details.
 */
export const getDetailOfTimeAndAttendanceService = async (id, page, limit, sortBy, sortType) => {
    const { timeAndAttendanceDetail, count } = await EasyPromiseAll({
        timeAndAttendanceDetail: getTimeAndAttendanceDetail(id, page, limit, sortBy, sortType),
        count: getTimeAndAttendanceDataCount(id)
    });
    return [200, {
        ok: true,
        time_and_attendance_detail: timeAndAttendanceDetail,
        count
    }];
}


