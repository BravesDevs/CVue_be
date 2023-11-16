const _ = require('lodash');
const moment = require('moment');
const uuid = require('uuid');
const { EasyPromiseAll } = require('easy-promise-all');
import { MessageActions } from "./../common";
import { uploadFileOnS3, deleteObject, notifyBugsnag } from './../utils';
import { config } from "../configurations";

import {
    updateTimeAndAttendance, getTimeAndAttendanceDataForPayroll, deletePayrollMetaById, getWorkerByEmployeeIdAndAgencyId, getJobAssociationWithRateCardByJobIds,
    addPayrollData, getPayrollsByTimeAndAttendanceId, createPayrollMeta, getPayrollMetaById, getTimeAndAttendance, getAgencyAssociationByAgencyIdAndClientId,
    addPayrollSummaryData, getTimeAndAttendanceListWithPayrollSummary, getPayrollMeta, getTimeAndAttendanceCountWithTotalPayrollSaving, getPayrollsByPayrollMetaId, deletePayrollByMetaId
} from "./../models";
import { ErrorCodes, ErrorResponse, TimeAndAttendanceStatus, PayrollAssumptions } from "./../common";

const staticPayrollCalculation = (timeAndAttendanceDetail, rateCard) => {
    const nationalInsurance = parseFloat((rateCard.insurance_rate * timeAndAttendanceDetail.hour_approved).toFixed(2));
    const holiday = parseFloat((rateCard.holiday_pay_rate * timeAndAttendanceDetail.hour_approved).toFixed(2));
    const apprenticeshipLevy = parseFloat((rateCard.apprenticeship_rate * timeAndAttendanceDetail.hour_approved).toFixed(2));
    const pension = parseFloat((rateCard.pension_rate * timeAndAttendanceDetail.hour_approved).toFixed(2));
    // Addition of all above values(NI, holiday, apprenticeship and pension) with pay rate and agency margin.
    const payrollStaticTotal = parseFloat((nationalInsurance + holiday + apprenticeshipLevy + pension + rateCard.pay_per_hour + timeAndAttendanceDetail.margin).toFixed(2));
    return {
        nationalInsurance,
        holiday,
        apprenticeshipLevy,
        pension,
        payrollStaticTotal,
    }
};

const dynamicPayrollCalculation = (timeAndAttendanceDetail, rateCard) => {
    // Condition for national insurance full time hours - If rateCard `full_time_hours` are less than `hours_approved` (csv) than NI will be calculated from `hours_approved` instead of `full_time_hours`.
    const niFullTimeHours = rateCard.full_time_hours_dynamic < timeAndAttendanceDetail.hour_approved
        ? timeAndAttendanceDetail.hour_approved
        : rateCard.full_time_hours_dynamic;
    // Condition for pension rate - `start_date` (from the worker table) is less than 12 week from `current_date` than pension rate is 0.
    const pensionRate = moment(new Date()).diff(moment(timeAndAttendanceDetail.start_date), 'weeks') < 12 ? 0 : PayrollAssumptions.PENSION_CONTRIBUTION;

    // Dynamic NI rate calculation using `(Pay Rate * weekly Hrs - N.I. Threshold(Assumption) ) * N.I. Rate / Weekly Hrs` formula.
    const nationalInsurance = parseFloat((
        (rateCard.pay_per_hour_dynamic * niFullTimeHours - PayrollAssumptions.NI_THRESHOLD) * PayrollAssumptions.NI_RATE / niFullTimeHours).toFixed(2));
    // Dynamic holiday rate calculation using `(Pay Rate + NI) * Holiday Rate(Assumption) (12.07%)` formula.
    const holiday = parseFloat(((rateCard.pay_per_hour_dynamic + nationalInsurance) * PayrollAssumptions.HOLIDAY_RATE).toFixed(2));
    // Dynamic apprenticeship levy rate calculation using `(Pay Rate + holiday) * Apprenticeship Levy(Assumption) (0.50%)` formula.
    const apprenticeshipLevy = parseFloat(((rateCard.pay_per_hour_dynamic + holiday) * PayrollAssumptions.APPRENTICESHIP_LEVY).toFixed(2));
    // Dynamic pension rate calculation using `((((Pay Rate + Holiday) * Weekly Hrs) - Pension Threshold(Assumption)) * Pension Contribution(Assumption)(3%) ) / Weekly Hrs` formula.
    const pension = parseFloat(((((
        (rateCard.pay_per_hour_dynamic + holiday) * rateCard.full_time_hours_dynamic
    ) - PayrollAssumptions.PENSION_THRESHOLD) * pensionRate) / rateCard.full_time_hours_dynamic).toFixed(2));

    // Additions above all values(NI, holiday, apprenticeship and pension) with pay rate and agency margin and multiplies by hours approved (csv).
    const payrollDynamicTotal = parseFloat(((
        nationalInsurance + holiday + apprenticeshipLevy + pension + rateCard.pay_per_hour + timeAndAttendanceDetail.margin
    ) * timeAndAttendanceDetail.hour_approved).toFixed(2));

    return {
        nationalInsuranceDynamic: nationalInsurance,
        holidayDynamic: holiday,
        apprenticeshipLevyDynamic: apprenticeshipLevy,
        pensionDynamic: pension,
        payrollDynamicTotal: payrollDynamicTotal,
    }
};

/**
 * ------ older ------------
 * Add payroll calculation
 * @param timeAndAttendanceId Time and Attendance id.
 * @param loggedInUserId Logged in user's id.
 */
export const addPayroll = async (timeAndAttendanceId, loggedInUserId) => {
    await updateTimeAndAttendance(timeAndAttendanceId, { status: TimeAndAttendanceStatus.PROCESSING });
    const timeAndAttendanceDetails = await getTimeAndAttendanceDataForPayroll(timeAndAttendanceId);
    const jobAssociationAndRateCardDetails = await getJobAssociationWithRateCardByJobIds(_.map(timeAndAttendanceDetails, 'job_id'));

    const dataToBeInsert = [];
    for (let i = 0; i < timeAndAttendanceDetails.length; i++) {
        const rateCard = _.find(jobAssociationAndRateCardDetails, { job_id: timeAndAttendanceDetails[i].job_id });
        const calculatedStaticPayroll = staticPayrollCalculation(timeAndAttendanceDetails[i], rateCard);
        const calculatedDynamicPayroll = dynamicPayrollCalculation(timeAndAttendanceDetails[i], rateCard);
        const object = {
            "timeAndAttendanceDataId": timeAndAttendanceDetails[i].id,
            "payPerHour": rateCard.pay_per_hour,
            "nationalInsurance": calculatedStaticPayroll.nationalInsurance,
            "holiday": calculatedStaticPayroll.holiday,
            "apprenticeshipLevy": calculatedStaticPayroll.apprenticeshipLevy,
            "pension": calculatedStaticPayroll.pension,
            "payPerHourDynamic": rateCard.pay_per_hour_dynamic,
            "nationalInsuranceDynamic": calculatedDynamicPayroll.nationalInsuranceDynamic,
            "holidayDynamic": calculatedDynamicPayroll.holidayDynamic,
            "apprenticeshipLevyDynamic": calculatedDynamicPayroll.apprenticeshipLevyDynamic,
            "pensionDynamic": calculatedDynamicPayroll.pensionDynamic,
            "agencyId": timeAndAttendanceDetails[i].agency_id,
            "clientId": timeAndAttendanceDetails[i].client_id,
            "workerId": timeAndAttendanceDetails[i].worker_id,
            "margin": timeAndAttendanceDetails[i].margin,
            "payrollStaticTotal": calculatedStaticPayroll.payrollStaticTotal,
            "payrollDynamicTotal": calculatedDynamicPayroll.payrollDynamicTotal,
            "clearvueSavings": (calculatedStaticPayroll.payrollStaticTotal - calculatedDynamicPayroll.payrollDynamicTotal).toFixed(2), // static payroll total and dynamic payroll total’s difference
            "createdBy": loggedInUserId,
            "updatedBy": loggedInUserId,
        }
        dataToBeInsert.push(object);
    }
    await addPayrollData(dataToBeInsert);
    await updateTimeAndAttendance(timeAndAttendanceId, {
        status: TimeAndAttendanceStatus.PROCESSED,
        updatedBy: loggedInUserId,
        updatedAt: new Date(),
    });
};

/**
 * Service to GET calculated payroll service.
 */
export const getCalculatedPayrollService = async (timeAndSheetId, data) => {
    let whereClause = ``;
    if (data.client_id && data.agency_id) {
        whereClause = `payroll.clientId = ${data.client_id} AND payroll.agencyId = ${data.agency_id}`;
    } else if (data.client_id && !data.agency_id) {
        whereClause = `payroll.clientId = ${data.client_id}`;
    } else if (!data.client_id && data.agency_id) {
        whereClause = `payroll.agencyId = ${data.agency_id}`;
    }
    const payrolls = await getPayrollsByTimeAndAttendanceId(timeAndSheetId, whereClause, data.page || 1, data.limit || 10, data.sort_by || "id", data.sort_type || "asc");
    return [200, {
        ok: true,
        payroll_list: payrolls,
    }];
}

/**
 * Service to GET payroll summary.
 */
export const getPayrollSummaryService = async (data) => {
    let whereClause = `time_and_attendance.clientId = ${data.client_id}`;
    if (data.agency_id) {
        whereClause = `${whereClause} AND time_and_attendance.agencyId = ${data.agency_id}`;
    }
    if (data.site_id) {
        whereClause = `${whereClause} AND time_and_attendance.siteId = ${data.site_id}`;
    }
    if (data.region_id) {
        whereClause = `${whereClause} AND site.regionId = ${data.region_id}`;
    }
    if (data.start_date && data.end_date) {
        whereClause = `${whereClause} AND time_and_attendance.startDate >= '${data.start_date}' AND time_and_attendance.endDate <= '${data.end_date}'`;
    }
    let { payrolls, sumAndCount } = await EasyPromiseAll({
        payrolls: getTimeAndAttendanceListWithPayrollSummary(whereClause, data.page || 1, data.limit || 10, data.sort_by || "id", data.sort_type || "asc"),
        sumAndCount: getTimeAndAttendanceCountWithTotalPayrollSaving(whereClause)
    })
    payrolls = _.map(payrolls, (p) => {
        p.worker_clock_report = p.time_and_attendance_status ? true : false;
        p.detail_payroll_report = p.payroll_meta_status ? true : false;
        return p;
    })
    return [200, {
        ok: true,
        payroll_list: payrolls,
        count: sumAndCount.count,
        total: sumAndCount.total
    }];
}

/**
 * Service for downloading the payroll summary.
 */
export const downloadPayrollSummaryService = async (payrollMetaId) => {
    const payrolls = await getPayrollsByPayrollMetaId(payrollMetaId)
    return [200, {
        ok: true,
        payroll_list: payrolls,
    }];
}

/**
 * Service to adding the payroll.
 */
export const addPayrollDataService = async (fileContent, payrollData, payload, loggedInUser) => {
    const timeAndAttendance = await getTimeAndAttendance({ startDate: payload.start_date, endDate: payload.end_date, agencyId: payload.agency_id, clientId: payload.client_id, siteId: payload.site_id })
    if (!timeAndAttendance) {
        return [404, ErrorResponse.WorkerClockReportNotFound]
    }
    let payroll;
    try {
        const exisitingPayrollMeta = await getPayrollMeta({ startDate: payload.start_date, endDate: payload.end_date, agencyId: payload.agency_id, clientId: payload.client_id, siteId: payload.site_id });
        if (exisitingPayrollMeta) {
            return [409, ErrorResponse.FileAlreadyExists];
        }
        const fileName = uuid.v4();
        // upload s3
        const url = await uploadFileOnS3(
            config.BUCKET_NAME,
            config.PAYROLL_REPORT_FOLDER,
            fileName,
            "csv",
            fileContent
        );
        const payrollMetaData = {
            path: url.location,
            name: fileName,
            week: payload.week,
            status: TimeAndAttendanceStatus.PROCESSED,
            timeAndAttendanceId: timeAndAttendance.id,
            startDate: payload.start_date,
            endDate: payload.end_date,
            clientId: payload.client_id,
            agencyId: payload.agency_id,
            siteId: payload.site_id,
            createdBy: loggedInUser.user_id,
            updatedBy: loggedInUser.user_id,
        }
        payroll = await createPayrollMeta(payrollMetaData)
        payroll = await getPayrollMetaById(payroll.id);
        const workerIds = _.uniq(_.map(payrollData, "employee_id"))
        const { workers, association } = await EasyPromiseAll({
            workers: getWorkerByEmployeeIdAndAgencyId(workerIds, payload.agency_id),
            association: getAgencyAssociationByAgencyIdAndClientId(payload.agency_id, payload.client_id)
        });
        const workerNotFound = [], payrollDataToInsert = [];
        for (let i = 0; i < workerIds.length; i++) {
            const worker = _.find(workers, { employee_id: workerIds[i], agency_id: payload.agency_id })
            const empPayroll = _.filter(payrollData, { employee_id: workerIds[i] })
            // Calculate total pay
            const totalPay = _.round(_.sumBy(empPayroll, "total_pay"), 2)
            // Calculate NI
            const ni = totalPay > config.NI_THRESHOLD? _.round((((totalPay - Number(config.NI_THRESHOLD)) * Number(config.NI_PERCENT)) / 100), 2) : 0
            // Calculate Holiday
            const holiday = _.round((((totalPay + ni) * Number(config.HOLIDAY_PAY_PERCENT)) / 100), 2);
            // Calculate Pension
            const pension = worker ? (moment(new Date()).diff(moment(worker.start_date), 'weeks') < 12 ||
                moment(new Date()).diff(moment(worker.dob), 'years') < 22 ||
                totalPay < 120) ? 0 : _.round((((totalPay + holiday - 120) * 3) / 100), 2) : 0;
            // Calculate app levy
            const levy = _.round((((totalPay + holiday) * 0.5) / 100), 2);

            const totalHour = _.round(_.sumBy(empPayroll, "total_hour"), 2);
            const discount = _.round(_.sumBy(empPayroll, "discount"), 2);
            const totalCharge = _.round(_.sumBy(empPayroll, "total_charge"), 2);
            // Calculate Actual Cost
            const actualCostToEmploy = _.round(_.sum([totalPay, ni, holiday, levy, pension]), 2) // payrollData[i].discount
            // Total Margin
            // const totalMargin = _.round(_.multiply(totalHour, association.margin), 2);
            const totalMargin = _.round(_.subtract(totalCharge, actualCostToEmploy), 2);
            // total charge - actual employment cost
            // Actual margin
            const actalMargin = totalMargin ? _.round(_.divide(totalMargin, totalHour), 2) : 0;
            // Credit Per Hour
            const creditPerHour = actalMargin ? _.round(_.subtract(actalMargin, association.margin), 2) : 0;

            payrollDataToInsert.push({
                payrollMetaId: payroll.id,
                totalHours: totalHour,
                totalCharge: totalCharge,
                totalPay: totalPay,
                nationalInsurance: ni,
                holiday: holiday,
                apprenticeshipLevy: levy,
                discount: discount,
                pension: pension,
                clientId: payload.client_id,
                agencyId: payload.agency_id,
                siteId: payload.site_id,
                createdBy: loggedInUser.user_id,
                updatedBy: loggedInUser.user_id,
                week: payload.week,
                startDate: payload.start_date,
                endDate: payload.end_date,
                workerId: worker ? worker.id : workerNotFound.push(workerIds[i]),
                actualCostToEmploy: actualCostToEmploy,
                totalAgencyMargin: totalMargin,
                actualMargin: actalMargin,
                rateCardMargin: Number(association.margin),
                creditPerHour: creditPerHour,
                clearvueSavings: _.round(_.subtract(totalMargin, _.round(_.multiply(totalHour, association.margin), 2)), 2) // Total Margin - Total Agency Margin
            })
        }
        if (_.size(workerNotFound)) {
            await deleteObject(config.BUCKET_NAME, config.PAYROLL_REPORT_FOLDER, payroll.name)
            await deletePayrollMetaById(payroll.id);
            return [400, {
                ok: false,
                message: `worker id does not match for employee id(s): ${workerNotFound}`
            }]
        }
        const payrollSummary = {
            payrollMetaId: payroll.id,
            clientId: payload.client_id,
            siteId: payload.site_id,
            agencyId: payload.agency_id,
            totalHours: _.round(_.sumBy(payrollDataToInsert, 'totalHours'), 2),
            totalCharge: _.round(_.sumBy(payrollDataToInsert, 'totalCharge'), 2),
            totalPay: _.round(_.sumBy(payrollDataToInsert, 'totalPay'), 2),
            totalAgencyMargin: _.round(_.sumBy(payrollDataToInsert, 'totalAgencyMargin'), 2),
            actualMargin: _.round(_.round(_.sumBy(payrollDataToInsert, 'totalAgencyMargin'), 2) / _.round(_.sumBy(payrollDataToInsert, 'totalHours'), 2), 2),
            rateCardMargin: _.round(_.meanBy(payrollDataToInsert, 'rateCardMargin'), 2),
            creditPerHour: _.round(_.sumBy(payrollDataToInsert, 'creditPerHour'), 2),
            clearvueSavings: _.round(( _.round(_.sumBy(payrollDataToInsert, 'totalAgencyMargin'), 2) - _.round(( _.round(_.sumBy(payrollDataToInsert, 'totalHours'), 2) * _.round(_.meanBy(payrollDataToInsert, 'rateCardMargin'), 2)), 2)), 2),// _.round(_.sumBy(payrollDataToInsert, 'clearvueSavings'), 2),
            startDate: payload.start_date,
            endDate: payload.end_date,
            week: payload.week,
            createdBy: loggedInUser.user_id,
            updatedBy: loggedInUser.user_id
        }
        await addPayrollData(payrollDataToInsert);
        await addPayrollSummaryData(payrollSummary);
        return [201, {
            'ok': true,
            message: MessageActions.CREATE_PAYROLL,
        }]
    } catch (err) {
        await deleteObject(config.BUCKET_NAME, config.PAYROLL_REPORT_FOLDER, payroll.name)
        await deletePayrollMetaById(payroll.id);
        await deletePayrollByMetaId(payroll.id);
        if (err.code === ErrorCodes.dbReferenceError) {
            return [404, ErrorResponse.ResourceNotFound]    // Return 404 if any foreign key contraint is not available in DB
        } else {
            notifyBugsnag(err);
            return [500, err.message]
        }
    }

}

/**
 * Service to adding the payroll.
 */
export const addPayrollDataAsPerTimeAndAttendance = async (payrollData, payload, loggedInUser) => {
    let payroll;
    try {
        const exisitingPayrollMeta = await getPayrollMeta({ startDate: payload.start_date, endDate: payload.end_date, agencyId: payload.agency_id, clientId: payload.client_id, siteId: payload.site_id });
        if (exisitingPayrollMeta) {
            return [409, ErrorResponse.FileAlreadyExists];
        }

        const payrollMetaData = {
            path: null,
            name: uuid.v4(),
            week: payload.week,
            status: TimeAndAttendanceStatus.PROCESSED,
            timeAndAttendanceId: payload.time_and_attendance_id,
            startDate: payload.start_date,
            endDate: payload.end_date,
            clientId: payload.client_id,
            agencyId: payload.agency_id,
            siteId: payload.site_id,
            createdBy: loggedInUser.user_id,
            updatedBy: loggedInUser.user_id,
        }
        payroll = await createPayrollMeta(payrollMetaData);
        

        const payrollDataToInsert = [];
        const association = await getAgencyAssociationByAgencyIdAndClientId(payload.agency_id, payload.client_id)

        payrollData.forEach((payrollRecord) => {
            // Calculate total pay
            const totalPay = _.round(payrollRecord.total_pay, 2);

            // Calculate NI
            const ni = totalPay > config.NI_THRESHOLD? _.round((((totalPay - Number(config.NI_THRESHOLD)) * Number(config.NI_PERCENT)) / 100), 2) : 0;
             
            // Calculate Holiday
            const holiday = _.round((((totalPay + ni) * Number(config.HOLIDAY_PAY_PERCENT)) / 100), 2);
             
            // Calculate Pension
            const pension = (moment(new Date()).diff(moment(payrollRecord.worker_start_date), 'weeks') < 12 ||
            moment(new Date()).diff(moment(payrollRecord.worker_dob), 'years') < 22 ||
            totalPay < 120) ? 0 : _.round((((totalPay + holiday - 120) * 3) / 100), 2) ;

            // Calculate app levy
            const levy = _.round((((totalPay + holiday) * 0.5) / 100), 2);
            
            const totalHour = _.round(payrollRecord.total_hour, 2);
            const discount = 0; // Currently not used
            const totalCharge = _.round(payrollRecord.total_charge, 2);

            // Calculate Actual Cost
            const actualCostToEmploy = _.round(_.sum([totalPay, ni, holiday, levy, pension]), 2) // payrollData[i].discount
            
            // Total Margin
            // const totalMargin = _.round(_.multiply(totalHour, association.margin), 2);
            const totalMargin = _.round(_.subtract(totalCharge, actualCostToEmploy), 2);
            
            // total charge - actual employment cost
            // Actual margin
            const actalMargin = totalMargin ? _.round(_.divide(totalMargin, totalHour), 2) : 0;
            
            // Credit Per Hour
            const creditPerHour = actalMargin ? _.round(_.subtract(actalMargin, association.margin), 2) : 0;

            payrollDataToInsert.push({
                payrollMetaId: payroll.id,
                totalHours: totalHour,
                totalCharge: totalCharge,
                totalPay: totalPay,
                nationalInsurance: ni,
                holiday: holiday,
                apprenticeshipLevy: levy,
                discount: discount,
                pension: pension,
                clientId: payload.client_id,
                agencyId: payload.agency_id,
                siteId: payload.site_id,
                createdBy: loggedInUser.user_id,
                updatedBy: loggedInUser.user_id,
                week: payload.week,
                startDate: payload.start_date,
                endDate: payload.end_date,
                workerId: payrollRecord.worker_id,
                actualCostToEmploy: actualCostToEmploy,
                totalAgencyMargin: totalMargin,
                actualMargin: actalMargin,
                rateCardMargin: Number(association.margin),
                creditPerHour: creditPerHour,
                clearvueSavings: _.round(_.subtract(totalMargin, _.round(_.multiply(totalHour, association.margin), 2)), 2) // Total Margin - Total Agency Margin
            })
        })

        const payrollSummary = {
            payrollMetaId: payroll.id,
            clientId: payload.client_id,
            siteId: payload.site_id,
            agencyId: payload.agency_id,
            totalHours: _.round(_.sumBy(payrollDataToInsert, 'totalHours'), 2),
            totalCharge: _.round(_.sumBy(payrollDataToInsert, 'totalCharge'), 2),
            totalPay: _.round(_.sumBy(payrollDataToInsert, 'totalPay'), 2),
            totalAgencyMargin: _.round(_.sumBy(payrollDataToInsert, 'totalAgencyMargin'), 2),
            actualMargin: _.round(_.round(_.sumBy(payrollDataToInsert, 'totalAgencyMargin'), 2) / _.round(_.sumBy(payrollDataToInsert, 'totalHours'), 2), 2),
            rateCardMargin: _.round(_.meanBy(payrollDataToInsert, 'rateCardMargin'), 2),
            creditPerHour: _.round(_.sumBy(payrollDataToInsert, 'creditPerHour'), 2),
            clearvueSavings: _.round(( _.round(_.sumBy(payrollDataToInsert, 'totalAgencyMargin'), 2) - _.round(( _.round(_.sumBy(payrollDataToInsert, 'totalHours'), 2) * _.round(_.meanBy(payrollDataToInsert, 'rateCardMargin'), 2)), 2)), 2),// _.round(_.sumBy(payrollDataToInsert, 'clearvueSavings'), 2),
            startDate: payload.start_date,
            endDate: payload.end_date,
            week: payload.week,
            createdBy: loggedInUser.user_id,
            updatedBy: loggedInUser.user_id
        }

        await addPayrollData(payrollDataToInsert);
        await addPayrollSummaryData(payrollSummary);
        return [201, {
            'ok': true,
            message: MessageActions.CREATE_PAYROLL,
        }]
    } catch (err) {
        await deletePayrollMetaById(payroll.id);
        await deletePayrollByMetaId(payroll.id);
        if (err.code === ErrorCodes.dbReferenceError) {
            return [404, ErrorResponse.ResourceNotFound]    // Return 404 if any foreign key contraint is not available in DB
        } else {
            notifyBugsnag(err);
            return [500, err.message]
        }
    }

}