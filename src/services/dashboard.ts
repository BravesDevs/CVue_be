import {
    getWorkerDemographicsDetails, getStartAndInactivatedDateForTheWorkers,
    getAgencyWiseWorkerDemographicsDetails, getStartAndInactivatedDateForTheAgencyWiseWorkers, getAssociatedAgenciesList,
    getShiftFulfillmentFromBookingAssociation, getShiftUtilisationDetailsModel, getWorkersWorkingHours,
    getWorkersDayWiseShiftUtilisationDetails, getWorkersLeaversDetails, getTotalWorkers, getFulfilmentAndLossCount, getActivityTotalSpendByAgencyHelper,
    getFirstTwoWeeksTimeAndAttendanceWorkers, getWorkersLeaversCountByDateRange,
    getStandardAndOvertimeHourAndPay, getWorkForcePoolUtilizationTotalWorkers, getWorkForcePoolUtilizationActiveWorkers,
    getInactivatedWorkersPerAgencyByStartDate, getTrendAgencyRating,
    getHeaderCumulativeClearVueSavings, getTrendCompanyRating,
    getPreviousWeekClearVueSavings, getTrendSiteRating, getSites,
    getWorkersTotalWorkingHours, getPoolUtilizationInactiveWorkers,
    getWorkersCountForAverageWorkingHours, getTADataAvailableWorkers, getLeaverAnalysis, getTotalSpendTrendsAnalytics,
    getTotalHoursTrendsAnalytics, getTotalHeadsTrendsAnalytics, getTotalLeaversTrendsAnalytics, getLastUploadedWorkingHours, getInactivatedWorkersByStartDate,
    getNewStarterRetentionData,
    getAgencyWiseNewStarterRetentionData
} from "../models";
import {
    getWeeksOfTwoDates, dayRangeAsPerDayCount, removeKeyFromObject, objectToMySQLConditionString, getWeekWiseWorkingDays, getWeeklabels,
    arrayToObject, objectToMySQLConditionStrings, objectToMySQLConditionStringForTAData
} from '../utils';
import { lengthOfServiceResponse, databaseSeparator, PayType } from '../common';
import { getAllSites } from '../services'
import moment from "moment";
const deepClone = require('lodash.clonedeep');
const _ = require("lodash");
import { config } from "../configurations";
const { EasyPromiseAll } = require('easy-promise-all');

/*
    WorkForce Top-Deck
*/

/**
 * Get worker nationality demographics data for the various filters like site, agency, client, shift & department
 * @param  {} requestArgs
 */
export const getWorkerDemographicsDataService = async (requestArgs) => {
    let { "is_active": isActive, "type": workerType, ...otherRequestArgs } = requestArgs;
    isActive = isActive === 'true' || isActive === undefined ? 1 : 0;
    let whereClauseString = getWorkerWhereClauseString(otherRequestArgs, isActive) + (workerType ? ` AND workers.type='${workerType}'` : "");
    let response = await getWorkerDemographicsDetails(requestArgs, whereClauseString);
    return {
        "ok": true,
        "result": {
            "rows": parseDemographicsValueToInteger(response)
        },
        "is_data_available": response.length ? true : false
    }
};


/**
 * Get length of service data response
 * @param  {} weekDifference
 * @param  {} locResponse
 */
const getLengthOfServiceWeeks = (weekDifference, locResponse) => {
    switch (true) {
        case (1 <= weekDifference && weekDifference <= 2): {
            locResponse[0].data[0] += 1;
            break;
        }
        case (3 <= weekDifference && weekDifference <= 4): {
            locResponse[1].data[0] += 1;
            break;
        }
        case (5 <= weekDifference && weekDifference <= 8): {
            locResponse[2].data[0] += 1;
            break;
        }
        case (9 <= weekDifference && weekDifference <= 12): {
            locResponse[3].data[0] += 1;
            break;
        }
        case (13 <= weekDifference && weekDifference <= 16): {
            locResponse[4].data[0] += 1;
            break;
        }
        case (17 <= weekDifference && weekDifference <= 26): {
            locResponse[5].data[0] += 1;
            break;
        }
        case (27 <= weekDifference && weekDifference <= 52): {
            locResponse[6].data[0] += 1;
            break;
        }
        case (52 <= weekDifference): {
            locResponse[7].data[0] += 1;
            break;
        }
    }
    return locResponse;
}


/**
 * Get day wise completed shift data for the workers from the T&A sheet (For active workers)
 * @param  {} requestArgs
 */
export const getWorkForceShiftUtilizationService = async (requestArgs) => {
    return getShiftUtilisationDetails(requestArgs, 1);
}


/**
 * Get length of service data.
 * - Consider start date of the workers and calculate length of service as per the week duration.
 * @param  {} requestArgs
 */
export const getWorkForceLOSService = async (requestArgs) => {
    let { "start_date": startDate, "end_date": endDate, ...otherRequestArgs } = requestArgs;

    let response = await getStartAndInactivatedDateForTheWorkers(deepClone(otherRequestArgs), getWorkerWhereClauseString(deepClone(otherRequestArgs), 2, 'workers', startDate, endDate));
    let weekDifference: number;
    let locResponse = deepClone(lengthOfServiceResponse);

    for (let element of response) {
        let workerEndDate = element.in_actived_at && element.in_actived_at > endDate ? element.in_actived_at : endDate;
        weekDifference = getWeeksOfTwoDates(element.start_date, workerEndDate);
        locResponse = getLengthOfServiceWeeks(weekDifference, locResponse);
    }

    return {
        "ok": true,
        "result": {
            "rows": locResponse
        },
        "is_data_available": locResponse.length ? true : false
    }
}


/**
 * Get pool utilization data as per calculating data of number of workers from the T&A sheet (For currently active workers)
 * @param  {} requestArgs
 */
export const getWorkForcePoolUtilizationService = async (requestArgs) => {

    let { start_date, end_date, ...otherRequestArgs } = requestArgs;
    let activeWorkersObject = _.cloneDeep(otherRequestArgs);
    const diff = moment(end_date).diff(moment(start_date), 'days') + 1;
    let isPastRangeValueRequired = getWeeksOfTwoDates(start_date, end_date) === 1 ? true : false;
    const lastStartDate = moment(start_date).subtract(diff, "days").format('YYYY-MM-DD');
    const lastEndDate = moment(end_date).subtract(diff, "days").format('YYYY-MM-DD');
    let { total_count } = await getWorkForcePoolUtilizationTotalWorkers(
        requestArgs,
        getWorkerWhereClauseStringForTotalWorkers(otherRequestArgs, "workers", 2, start_date, end_date),
        1,
        start_date,
        end_date
    );

    let { "total_count": past_total_count } = await getWorkForcePoolUtilizationTotalWorkers(
        requestArgs,
        getWorkerWhereClauseStringForTotalWorkers(otherRequestArgs, "workers", 2, start_date, end_date),
        1,
        lastStartDate,
        lastEndDate
    );

    if (parseInt(total_count) === 0) {
        return {
            "ok": true,
            "result": {
                current_range: {
                    "total_count": 0, "active_count": 0
                },
                last_range: {
                    "total_count": 0, "active_count": 0
                },
                "is_past_range_value_required": isPastRangeValueRequired
            },
            "is_data_available": true
        }
    }
    const { active_workers_current, active_workers_last } = await EasyPromiseAll({
        active_workers_current: getWorkForcePoolUtilizationActiveWorkers(getWorkerWhereClauseStringForActiveWorkers(activeWorkersObject), start_date, end_date),
        active_workers_last: isPastRangeValueRequired ? getWorkForcePoolUtilizationActiveWorkers(getWorkerWhereClauseStringForActiveWorkers(activeWorkersObject), lastStartDate, lastEndDate) : {}
    });
    return {
        "ok": true,
        "result": {
            current_range: {
                "total_count": parseInt(total_count), "active_count": parseInt(active_workers_current.active_workers) || 0
            },
            last_range: {
                "total_count": parseInt(past_total_count), "active_count": parseInt(active_workers_last.active_workers) || 0
            },
            "is_past_range_value_required": isPastRangeValueRequired
        },
        "is_data_available": true
    }
}


/**
 * Get pool utilization data as per calculating data of number of workers from the T&A sheet (For currently inactive workers)
 * @param  {} requestArgs
 */
export const getLeaverPoolUtilizationService = async (requestArgs) => {

    let { start_date, end_date, ...otherRequestArgs } = requestArgs;
    let inactiveWorkersObject = _.cloneDeep(otherRequestArgs);
    let { total_count } = await getWorkForcePoolUtilizationTotalWorkers(requestArgs, getWorkerWhereClauseStringForTotalWorkers(otherRequestArgs), 0);
    if (parseInt(total_count) === 0) {
        return {
            "ok": true,
            "result": {
                current_range: {
                    "total_count": 0, "inactive_count": 0
                }
            },
            "is_data_available": true
        }
    }
    const inactive_workers_current = await getPoolUtilizationInactiveWorkers(getWorkerWhereClauseStringForActiveWorkers(inactiveWorkersObject), start_date, end_date);
    return {
        "ok": true,
        "result": {
            current_range: {
                "total_count": parseInt(total_count), "inactive_count": parseInt(inactive_workers_current.inactive_workers) || 0
            }
        },
        "is_data_available": true
    }
}


/*
    Leavers: Top-Deck
*/


/**
 * Get length of service data.
 * - Consider start date and inactivate date of the workers and calculate length of service as per the week duration
 * @param  {} requestArgs
 */
export const getLeaversLengthOfServService = async (requestArgs) => {
    const { "start_date": startDate, "end_date": endDate, ...otherRequestArgs } = requestArgs;

    let response = await getStartAndInactivatedDateForTheWorkers(otherRequestArgs, getWorkerWhereClauseString(deepClone(otherRequestArgs), 0, 'workers', startDate, endDate, true));
    let weekDifference: number;
    let locResponse = deepClone(lengthOfServiceResponse);

    for (let element of response) {
        weekDifference = getWeeksOfTwoDates(element.start_date, element.in_actived_at);
        locResponse = getLengthOfServiceWeeks(weekDifference, locResponse);
    }

    return {
        "ok": true,
        "result": {
            "rows": locResponse
        },
        "is_data_available": locResponse.length ? true : false
    }
}


/**
 * Get worker counts who have marked inactivated in provided date range
 * @param  {} requestArgs
 */
export const getLeaversCountAndStarterRetentionService = async (requestArgs) => {
    const { "start_date": startDate, "end_date": endDate, ...otherRequestArgs } = requestArgs;
    let [inactiveWorkersCount, activatedWorkersCount] = await getNewStarterRetentionData(
        otherRequestArgs, getWorkerWhereClauseString(deepClone(otherRequestArgs), null, "workers"), startDate, endDate);

    let workersWhereClauseString = getWorkerWhereClauseString(deepClone(otherRequestArgs), 0, 'workers', startDate, endDate, false);
    let isPastRangeValueRequired = getWeeksOfTwoDates(startDate, endDate) === 1 ? true : false;

    return {
        "ok": true,
        "result": {
            "is_past_range_value_required": isPastRangeValueRequired,
            "leavers_count": {
                "current_value": parseInt(await getWorkersLeaversCountByDateRange(
                    deepClone(otherRequestArgs),
                    workersWhereClauseString,
                    startDate,
                    endDate
                )),
                "past_value": isPastRangeValueRequired ? parseInt(await getWorkersLeaversCountByDateRange(
                    deepClone(otherRequestArgs),
                    workersWhereClauseString,
                    moment(startDate, "YYYY-MM-DD").subtract(7, 'days').format("YYYY-MM-DD"),
                    moment(endDate, "YYYY-MM-DD").subtract(7, 'days').format("YYYY-MM-DD")
                )) : 0
            },
            "new_starter_retention": {
                "active": parseInt(activatedWorkersCount || 0) - parseInt(inactiveWorkersCount || 0),
                "inactive": parseInt(inactiveWorkersCount || 0)
            }
        },
        "is_data_available": true
    }
}


/**
 * Get day wise completed shift data for the workers from the T&A sheet (For active workers)
 * @param  {} requestArgs
 */
export const getLeaversShiftUtilizationService = async (requestArgs) => {
    return getShiftUtilisationDetails(requestArgs, 0);
}


/*
    Leavers: Bottom-Deck
*/


/**
 * Get agency wise length of service of the workers.
 * - Consider start date of the workers and calculate length of service as per the week duration
 * - Parse that data agency wise
 * @param  {} requestArgs
 */
export const getAgencyWiseLeaversLOSService = async (requestArgs) => {
    let { "start_date": startDate, "end_date": endDate, ...otherRequestArgs } = requestArgs;

    let dbResponse = await getStartAndInactivatedDateForTheAgencyWiseWorkers(
        deepClone(otherRequestArgs),
        getWorkerWhereClauseString(deepClone(otherRequestArgs), 0, 'workers', startDate, endDate, true)
    );

    let response = await processAgencyWiseLengthOfService(dbResponse, otherRequestArgs, true);

    return {
        "ok": true,
        "result": response,
        "is_data_available": response.agencies.length ? true : false
    }
}

/**
 * Get agency wise inactivated workers count as per provided date range
 * @param  {} requestArgs
 */
export const getAgencyWiseLeaversCountAndStarterRetentionService = async (requestArgs) => {

    const { "start_date": startDate, "end_date": endDate, ...otherRequestArgs } = requestArgs;

    let agencyList = await getAssociatedAgenciesList(
        otherRequestArgs,
        getWhereClauseString(deepClone(otherRequestArgs),
            'agency_client_association')
    );
    let [inactiveWorkersCount, activatedWorkersCount] = await getAgencyWiseNewStarterRetentionData(
        otherRequestArgs, getWorkerWhereClauseString(deepClone(otherRequestArgs), null, "workers"), startDate, endDate);


    let agencyWiseNewStarterRetention = {};
    let response = [];

    if (agencyList.length) {
        let inactivatedWorkersPerAgencyByStartDate = await getInactivatedWorkersPerAgencyByStartDate(otherRequestArgs, getWorkerWhereClauseString(deepClone(otherRequestArgs), null, "workers"), startDate, endDate);

        inactivatedWorkersPerAgencyByStartDate.forEach((element) => {
            agencyWiseNewStarterRetention[element.agency_id] = parseInt(element.inactive_workers_count)
        })

        agencyList.forEach((element) => {
            let active = activatedWorkersCount.find(x => x.agency_id == element.agency_detail_id);
            let inactive = inactiveWorkersCount.find(x => x.agency_id == element.agency_detail_id);
            response.push({
                label: element.agency_name,
                active: (parseInt(active?.active_workers_count) || 0) - (parseInt(inactive?.inactive_workers_count) || 0),
                in_active: parseInt(inactive?.inactive_workers_count) || 0,
                count: agencyWiseNewStarterRetention[element.agency_detail_id] || 0
            });
        });
    }

    return {
        "ok": true,
        "result": {
            "rows": response
        },
        "is_data_available": response.length ? true : false
    }
}


/**
 * Get calculate shift utilization for the workers from the T&A sheet (For inactive workers) and parse them agency wise
 *  @param  {} requestArgs
 */
export const getAgencyWiseLeaversShiftUtilizationService = async (requestArgs) => {

    let response = await getDayWiseShiftUtilisationDetails(requestArgs, 0)

    return {
        "ok": true,
        "result": {
            "rows": response
        },
        "is_data_available": response.length ? true : false
    }
}


/**
 * Get agency wise inactivated workers count for the provided date range
 * @param  {} requestArgs
 */
export const getLeaversService = async (requestArgs) => {
    const { "start_date": startDate, "end_date": endDate, ...otherRequestArgs } = requestArgs;
    let response = [];
    let total = 0;
    let agencyList = await getAssociatedAgenciesList(otherRequestArgs, getWhereClauseString(deepClone(otherRequestArgs), 'agency_client_association'));

    if (agencyList.length) {
        let leaversDetails = await getWorkersLeaversDetails(
            requestArgs,
            getWorkerWhereClauseString(deepClone(otherRequestArgs), 0, 'workers', startDate, endDate, false),
            startDate, endDate);
        let leaversDetailsObject = Object.assign({}, ...(leaversDetails.map(item => ({ [item.agency_id]: item.workers_count }))));

        agencyList.forEach((element) => {
            total += parseInt(leaversDetailsObject[element.agency_detail_id] || 0)
            response.push({
                "agency_name": element.agency_name,
                "inactive": parseInt(leaversDetailsObject[element.agency_detail_id] || 0)
            })
        });
    }


    return {
        "ok": true,
        total,
        "result": {
            "rows": response
        },
        "is_data_available": response.length ? true : false
    }
}


const processAgencyWiseLengthOfService = async (dbResponse: any, otherRequestArgs: any, requestForInactivatedWorkers = false, endDate: string = null) => {
    let agencyList = await getAssociatedAgenciesList(otherRequestArgs, getWhereClauseString(deepClone(otherRequestArgs), 'agency_client_association'));

    let response = {
        "agencies": [],
        "rows": []
    };

    let lengthOfServiceData = {
        '1-2': {},
        '3-4': {},
        '5-8': {},
        '9-12': {},
        '13-16': {},
        '17-26': {},
        '27-52': {},
        '52+': {}
    }

    for (let element of dbResponse) {
        let workerEndDate = endDate ? (element.in_actived_at && element.in_actived_at > endDate ? element.in_actived_at : endDate) : element.in_actived_at;
        let weekDifference = requestForInactivatedWorkers ? getWeeksOfTwoDates(element.start_date, element.in_actived_at) : getWeeksOfTwoDates(element.start_date, workerEndDate);

        if (!(weekDifference >= 0)) continue;  // Skip element if start-date of worker is after inactivated date

        let losKey = dayRangeAsPerDayCount(weekDifference);

        if (lengthOfServiceData[losKey].hasOwnProperty(element.worker_agency_id)) {
            lengthOfServiceData[losKey][element.worker_agency_id] += 1;
        } else {
            lengthOfServiceData[losKey][element.worker_agency_id] = 1;
        }
    }

    for (let key in lengthOfServiceData) {

        let data = [];
        for (let agency of agencyList) {

            data.push(
                lengthOfServiceData[key] && lengthOfServiceData[key][agency.agency_detail_id] ? lengthOfServiceData[key][agency.agency_detail_id] : 0
            )
        }
        response.rows.push({
            'name': key,
            'data': data
        });
    }

    agencyList.forEach((agency) => {
        response.agencies.push(agency.agency_name);
    })

    return response;
}

/*
    WorkForce: Bottom-Deck
*/

/**
 * Get agency wise length of service of the workers.
 * - Consider start date of the workers and calculate length of service as per the week duration
 * - Parse that data agency wise
 * @param  {} requestArgs
 */
export const getAgencyWiseWorkForceLengthOfServService = async (requestArgs) => {
    let { "start_date": startDate, "end_date": endDate, ...otherRequestArgs } = requestArgs;

    let dbResponse = await getStartAndInactivatedDateForTheAgencyWiseWorkers(deepClone(otherRequestArgs), getWorkerWhereClauseString(deepClone(otherRequestArgs), 2, 'workers', startDate, endDate));
    let response = await processAgencyWiseLengthOfService(dbResponse, otherRequestArgs, false, endDate);

    return {
        "ok": true,
        "result": response,
        "is_data_available": response.agencies.length ? true : false
    }
}


/**
 * Get agency wise nationality wise demographics data
 * @param  {} requestArgs
 */
export const getAgencyWiseWorkForceDemoGraphicsService = async (requestArgs) => {
    let dbResponse = await getAgencyWiseWorkerDemographicsDetails(requestArgs, getWorkerWhereClauseString(deepClone(requestArgs)));

    let data = {};
    let uniqueAgencies = [];
    let nationalities = [];

    dbResponse.forEach(element => {
        if (!data.hasOwnProperty(element.nationality)) {
            data[element.nationality] = {
                [element.agency_detail]: element.value
            }
        } else {
            data[element.nationality][element.agency_detail] = element.value;
        }

        if (!uniqueAgencies.includes(element.agency_detail)) {
            uniqueAgencies.push(element.agency_detail);
        }

        if (!nationalities.includes(element.nationality)) {
            nationalities.push(element.nationality);
        }
    });

    let responseData = [];
    uniqueAgencies = uniqueAgencies.sort();

    nationalities.forEach((nationality) => {
        let nationalityWiseData = [];
        uniqueAgencies.forEach((agency) => {
            nationalityWiseData.push({
                "name": agency.split(databaseSeparator)[1],
                "value": data[nationality][agency] ? parseInt(data[nationality][agency]) : 0
            })
        })

        responseData.push({
            "label": nationality,
            "value": nationalityWiseData
        })
    });

    return {
        "ok": true,
        "result": {
            "rows": responseData
        },
        "is_data_available": responseData.length ? true : false
    }
}

/**
 * Get agency wise shift utilization of the workers. Return number of workers who worked for 1-3 and 4+ days in a week.
 * @param  {} requestArgs
 */
export const getAgencyWiseWorkShiftUtilizationService = async (requestArgs) => {

    let response = await getDayWiseShiftUtilisationDetails(requestArgs)

    return {
        "ok": true,
        "result": {
            "rows": response
        },
        "is_data_available": response.length ? true : false
    }
}


/*
    Activity: Top-Deck
*/

/**
 * Get activity stats related data
 * - Shift fulfillment
 * - Shift lost
 * - Total spend
 * - Total hours
 * @param  {} requestArgs
 */
export const getActivityAllStatsService = async (requestArgs) => {
    const { "start_date": startDate, "end_date": endDate, "shift_id": shift_id, ...otherRequestArgs } = requestArgs;
    const diff = moment(endDate).diff(moment(startDate), 'days') + 1;
    const lastStartDate = moment(startDate).subtract(diff, "days").format('YYYY-MM-DD');
    const lastEndDate = moment(endDate).subtract(diff, "days").format('YYYY-MM-DD');
    const whereClause = objectToMySQLConditionString(otherRequestArgs);
    const whereClauseForTA = objectToMySQLConditionStringForTAData(otherRequestArgs);
    let whereClauseCurrentBK = `${whereClause} AND bk.startDate >= '${startDate}' AND bk.endDate <= '${endDate}' `;
    let whereClauselastBK = `${whereClause}  AND bk.startDate >= '${lastStartDate}' AND bk.endDate <= '${lastEndDate}' `;
    let whereClauseCurrentTAData = `${whereClauseForTA} AND tadata.startDate >= '${startDate}' AND tadata.endDate <= '${endDate}' `;
    let whereClauseLastTAData = `${whereClauseForTA} AND tadata.startDate >= '${lastStartDate}' AND tadata.endDate <= '${lastEndDate}' `;
    if (shift_id) {
        whereClauseCurrentBK += `AND shift_type_id = ${shift_id}`;
        whereClauselastBK += `AND shift_type_id = ${shift_id}`;
        whereClauseCurrentTAData += `AND shift_id = ${shift_id}`;
        whereClauseLastTAData += `AND shift_id = ${shift_id}`;
    }
    let isPastRangeValueRequired = getWeeksOfTwoDates(startDate, endDate) === 1 ? true : false;
    const { shiftFulfilledCurrent, shiftFulfilledLast, standardOvertimePayAndHourCurrent, standardOvertimePayAndHourLast } = await EasyPromiseAll({
        shiftFulfilledCurrent: getFulfilmentAndLossCount(whereClauseCurrentBK),
        shiftFulfilledLast: isPastRangeValueRequired ? getFulfilmentAndLossCount(whereClauselastBK) : {},
        standardOvertimePayAndHourCurrent: getStandardAndOvertimeHourAndPay(whereClauseCurrentTAData),
        standardOvertimePayAndHourLast: isPastRangeValueRequired ? getStandardAndOvertimeHourAndPay(whereClauseLastTAData) : []
    });
    let basicTotal = 0, otherTotal = 0, basicHour = 0, otherHour = 0
    let basicTotalLast = 0, otherTotalLast = 0, basicHourLast = 0, otherHourLast = 0
    _.map(standardOvertimePayAndHourCurrent, (s) => {
        if (s.pay_type === 'Standard') {
            basicTotal = s.total,
                basicHour = s.weekly_hours
        } else {
            otherTotal = otherTotal + s.total,
                otherHour = otherHour + s.weekly_hours
        }
    })
    _.map(standardOvertimePayAndHourLast, (s) => {
        if (s.pay_type === 'Standard') {
            basicTotalLast = s.total,
                basicHourLast = s.weekly_hours
        } else {
            otherTotalLast = otherTotalLast + s.total,
                otherHourLast = otherHourLast + s.weekly_hours
        }
    });

    return {
        "ok": true,
        "result": {
            "is_past_range_value_required": isPastRangeValueRequired,
            "shift_fullfilment": {
                "current_range": {
                    "fulfilled": parseInt(shiftFulfilledCurrent.fulfilled_total || 0),
                    "lost": parseInt(shiftFulfilledCurrent.requested_total || 0) - parseInt(shiftFulfilledCurrent.fulfilled_total || 0)
                },
                "past_range": {
                    "fulfilled": parseInt(shiftFulfilledLast.fulfilled_total || 0),
                    "lost": parseInt(shiftFulfilledLast.requested_total || 0) - parseInt(shiftFulfilledLast.fulfilled_total || 0)
                }
            },
            "shift_lost": {
                "current_range": {
                    "count": parseInt(shiftFulfilledCurrent.requested_total || 0) - parseInt(shiftFulfilledCurrent.fulfilled_total || 0)
                },
                "past_range": {
                    "count": parseInt(shiftFulfilledLast.requested_total || 0) - parseInt(shiftFulfilledLast.fulfilled_total || 0)
                }
            },
            "total_spent": {
                "current_range": {
                    "basic": basicTotal,
                    "other": otherTotal
                },
                "past_range": {
                    "basic": basicTotalLast,
                    "other": otherTotalLast
                }
            },
            "total_hours": {
                "current_range": {
                    "basic": basicHour,
                    "other": otherHour
                },
                "past_range": {
                    "basic": basicHourLast,
                    "other": otherHourLast
                }

            }
        },
        "is_data_available": true
    }
}

/**
 * Get agency wise shift completion details from the booking association table
 * @param  {} requestArgs
 */
export const getActivityShiftDetailsService = async (requestArgs) => {

    let { "start_date": startDate, "end_date": endDate, ...otherRequestArgs } = requestArgs;

    let agencyList = await getAssociatedAgenciesList(otherRequestArgs, getWhereClauseString(deepClone(otherRequestArgs), 'agency_client_association'));

    if (otherRequestArgs.shift_id) {
        otherRequestArgs = removeKeyFromObject("shift_id", "shift_type_id", otherRequestArgs);
    }

    let shiftFulfillmentDetails = await getShiftFulfillmentFromBookingAssociation(objectToMySQLConditionString(otherRequestArgs), startDate, endDate);

    let agencyDetails = {};
    let agencyIds = [];
    let agencyWiseFulfilledResponse = {};
    let agencyWiseTotalShifts = {};
    let response = [];

    agencyList.forEach((element) => {
        agencyDetails[element.agency_detail_id] = {
            name: element.agency_name
        }

        agencyIds.push(element.agency_detail_id);
    });

    shiftFulfillmentDetails.forEach(element => {
        agencyWiseFulfilledResponse[element.agency_id] = (agencyWiseFulfilledResponse[element.agency_id] || 0) + parseInt(element.fulfilled_total || 0);
        agencyWiseTotalShifts[element.agency_id] = (agencyWiseTotalShifts[element.agency_id] || 0) + parseInt(element.requested_total || 0);
    });

    agencyIds.forEach((agencyId) => {
        response.push({
            label: agencyDetails[agencyId].name,
            lost_count: (agencyWiseTotalShifts[agencyId] - agencyWiseFulfilledResponse[agencyId]) ? agencyWiseTotalShifts[agencyId] - agencyWiseFulfilledResponse[agencyId] : 0,
            fulfilled_count: agencyWiseFulfilledResponse[agencyId] ? agencyWiseFulfilledResponse[agencyId] : 0
        })
    })

    return {
        "ok": true,
        "result": {
            "rows": response
        },
        "is_data_available": response.length ? true : false
    }
}

/**
 * Get agency wise worked workers count for the selected date range
 * @param  {} requestArgs
 */
export const getActivityHeadCountService = async (requestArgs) => {
    const { start_date, end_date, ...otherArgs } = requestArgs;

    let agencyList = await getAssociatedAgenciesList(otherArgs, getWhereClauseString(deepClone(otherArgs), 'agency_client_association'));
    let response = [];

    if (agencyList) {

        let totalWorkerDetails = await getTotalWorkers(
            deepClone(requestArgs),
            getWorkerWhereClauseString(deepClone(otherArgs), 2, 'workers', start_date, end_date)
        );

        let totalWorkerDetailsObject = Object.assign({}, ...(totalWorkerDetails.map(item => ({ [item.agency_id]: parseInt(item.workers_count) }))));

        let agencyWiseActiveWorkers = await getTADataAvailableWorkers(
            getWorkerWhereClauseString(deepClone(otherArgs), null, "time_and_attendance_data"),
            start_date,
            end_date
        );
        let agencyWiseActiveWorkersObject = Object.assign({}, ...(agencyWiseActiveWorkers.map(item => ({ [item.agency_id]: parseInt(item.active_workers) }))));

        agencyList.forEach((item) => {
            response.push({
                "label": item.agency_name,
                "active": agencyWiseActiveWorkersObject[item.agency_detail_id] || 0,
                "inactive": ((totalWorkerDetailsObject[item.agency_detail_id] || 0) - (agencyWiseActiveWorkersObject[item.agency_detail_id] || 0)) <= 0 ? 0 : (totalWorkerDetailsObject[item.agency_detail_id] || 0) - (agencyWiseActiveWorkersObject[item.agency_detail_id] || 0),
                "total": totalWorkerDetailsObject[item.agency_detail_id] || 0
            })
        })
    }

    return {
        "ok": true,
        "result": {
            "rows": response
        },
        "is_data_available": response.length ? true : false
    }
}


/**
 * Get agency wise total spend for the selected date range from T&A data
 * @param  {} requestArgs
 */
export const getActivitySpendService = async (requestArgs) => {
    const { start_date, end_date, ...otherArgs } = requestArgs;

    let agencyList = await getAssociatedAgenciesList(otherArgs, getWhereClauseString(deepClone(otherArgs), 'agency_client_association'));
    let response = [];
    let isPastRangeValueRequired = getWeeksOfTwoDates(start_date, end_date) === 1 ? true : false;
    let currentTotal = 0, lastTotal = 0;

    if (agencyList.length > 0) {
        const diff = moment(end_date).diff(moment(start_date), 'days') + 1;
        const lastStartDate = moment(start_date).subtract(diff, "days").format('YYYY-MM-DD');
        const lastEndDate = moment(end_date).subtract(diff, "days").format('YYYY-MM-DD');
        let { activityTotalSpendDetails, activityTotalSpendDetailsLast } = await EasyPromiseAll({
            activityTotalSpendDetails: getActivityTotalSpendByAgencyHelper(start_date, end_date, getWhereClauseString(deepClone(otherArgs), "time_and_attendance_data", false)),
            activityTotalSpendDetailsLast: getActivityTotalSpendByAgencyHelper(lastStartDate, lastEndDate, getWhereClauseString(deepClone(otherArgs), "time_and_attendance_data", false)),
        });

        agencyList.forEach((element) => {
            let obj = {};
            obj["label"] = element.agency_name;
            let objForCount = activityTotalSpendDetails.find(o => o.label === element.agency_detail_id);
            if (objForCount) {
                obj["count"] = objForCount.count;
            }
            else {
                obj["count"] = 0;
            }
            response.push(obj);
        });
        currentTotal = _.sumBy(activityTotalSpendDetails, 'count');
        lastTotal = _.sumBy(activityTotalSpendDetailsLast, 'count');
    }
    else {
        response = [];
    }

    return {
        "ok": true,
        "result": {
            "is_past_range_value_required": isPastRangeValueRequired,
            current_value: currentTotal,
            past_value: lastTotal,
            rows: response
        },
        "is_data_available": response.length ? true : false
    }
}


/**
 * Get agency wise average hours for the selected date range from T&A data
 * @param  {} requestArgs
 */
export const getActivityAverageHoursService = async (requestArgs) => {

    const { start_date, end_date, ...otherArgs } = requestArgs;

    let agencyList = await getAssociatedAgenciesList(otherArgs, getWhereClauseString(deepClone(otherArgs), 'agency_client_association'));
    let response = [];
    let isPastRangeValueRequired = getWeeksOfTwoDates(start_date, end_date) === 1 ? true : false;
    let currentTotal = 0, lastTotal = 0;

    if (agencyList.length > 0) {
        const diff = moment(end_date).diff(moment(start_date), 'days') + 1;
        const lastStartDate = moment(start_date).subtract(diff, "days").format('YYYY-MM-DD');
        const lastEndDate = moment(end_date).subtract(diff, "days").format('YYYY-MM-DD');
        let { activityTotalHoursDetails, activityTotalHoursDetailsLast } = await EasyPromiseAll({
            activityTotalHoursDetails: getWorkersWorkingHours(start_date, end_date, getWhereClauseString(deepClone(otherArgs), "time_and_attendance_data", false)),
            activityTotalHoursDetailsLast: getWorkersWorkingHours(lastStartDate, lastEndDate, getWhereClauseString(deepClone(otherArgs), "time_and_attendance_data", false)),
        });

        agencyList.forEach((element) => {
            let obj = {};
            obj["label"] = element.agency_name;
            let objForCount = activityTotalHoursDetails.find(o => o.agency_id === element.agency_detail_id);

            if (objForCount) {
                obj["count"] = objForCount.weekly_hours;
            }

            else {
                obj["count"] = 0;
            }
            response.push(obj);
        });

        currentTotal = _.sumBy(activityTotalHoursDetails, 'weekly_hours');
        lastTotal = _.sumBy(activityTotalHoursDetailsLast, 'weekly_hours');
    }
    else {
        response = [];
    }

    return {
        "ok": true,
        "result": {
            "is_past_range_value_required": isPastRangeValueRequired,
            current_value: currentTotal,
            past_value: lastTotal,
            rows: response
        },
        "is_data_available": response.length ? true : false
    }
}


/*
    Headers
*/

/**
 * Get data to display that in dashboard header
 * - Cumulative savings
 * - Current saving week
 * - Last uploaded week average working hours
 * - Last 8 week average working hours
 * @param  {} requestArgs
 */
export const getHeaderStatsService = async (requestArgs) => {
    let { start_date, end_date, ...otherArgs } = requestArgs;

    // 8 week ago date range
    let eightWeekAgoStartDate = moment(start_date).subtract(8, 'weeks').startOf('week').format('YYYY-MM-DD'); // moment().subtract(8, 'weeks').startOf('week').format('YYYY-MM-DD');
    let eightWeekAgoEndDate = moment(start_date).subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD');

    // previous week date range
    let pastEightWeekStartDate = moment().subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD');
    let pastEightWeekEndDate = moment().subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD');

    // Selected date range last week average working hours
    let lastWeekCurrentStartDate = ((moment().isBetween(moment(start_date), moment(end_date)) || moment().isSame(moment(start_date))) && getWeeksOfTwoDates(start_date, end_date) <= 2
    ) ? (
        moment().subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD')
    ) : moment(start_date).startOf('week').format('YYYY-MM-DD');

    let lastWeekCurrentEndDate = ((moment().isBetween(moment(start_date), moment(end_date)) || moment().isSame(moment(start_date))) && getWeeksOfTwoDates(start_date, end_date) < 2
    ) ? (
        moment().subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD')
    ) : moment(end_date).endOf('week').format('YYYY-MM-DD');

    let lastWeekPastStartDate = (moment().isBetween(moment(start_date), moment(end_date)) && getWeeksOfTwoDates(start_date, end_date) <= 2) || (
        moment(start_date).isSame(moment().subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD')) && getWeeksOfTwoDates(start_date, end_date)
        < 2) ? (
        moment().subtract(2, 'weeks').startOf('week').format('YYYY-MM-DD')
    ) : pastEightWeekStartDate;

    let lastWeekPastEndDate = (moment().isBetween(moment(start_date), moment(end_date)) && getWeeksOfTwoDates(start_date, end_date) <= 2) || (
        moment(start_date).isSame(moment().subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD')) && getWeeksOfTwoDates(start_date, end_date)
        < 2) ? (
        moment().subtract(2, 'weeks').endOf('week').format('YYYY-MM-DD')
    ) : pastEightWeekEndDate;

    const whereClause = getWhereClauseString(deepClone(otherArgs), "time_and_attendance_data", false);

    let { eight_week_current_total_hours, eight_week_current_worker_count, eight_week_past_total_hours, eight_week_past_worker_count,
        last_week_current_total_hours, last_week_current_worker_count, last_week_past_total_hours, last_week_past_worker_count,
        cumulative_clearvue_savings, last_week_clearvue_savings } = await EasyPromiseAll({

            eight_week_current_total_hours: getWorkersTotalWorkingHours(whereClause, eightWeekAgoStartDate, eightWeekAgoEndDate),
            eight_week_current_worker_count: getWorkersCountForAverageWorkingHours(whereClause, eightWeekAgoStartDate, eightWeekAgoEndDate),

            eight_week_past_total_hours: getWorkersTotalWorkingHours(whereClause, pastEightWeekStartDate, pastEightWeekEndDate),
            eight_week_past_worker_count: getWorkersCountForAverageWorkingHours(whereClause, pastEightWeekStartDate, pastEightWeekEndDate),

            last_week_current_total_hours: getWorkersTotalWorkingHours(whereClause, lastWeekCurrentStartDate, lastWeekCurrentEndDate),
            last_week_current_worker_count: getWorkersCountForAverageWorkingHours(whereClause, lastWeekCurrentStartDate, lastWeekCurrentEndDate),

            last_week_past_total_hours: getWorkersTotalWorkingHours(whereClause, lastWeekPastStartDate, lastWeekPastEndDate),
            last_week_past_worker_count: getWorkersCountForAverageWorkingHours(whereClause, lastWeekPastStartDate, lastWeekPastEndDate),

            cumulative_clearvue_savings: getHeaderCumulativeClearVueSavings(requestArgs, getPayrollWhereClauseString(deepClone(otherArgs))),
            last_week_clearvue_savings: getPreviousWeekClearVueSavings(requestArgs, getPayrollWhereClauseString(deepClone(otherArgs)))
        });

    return {
        "ok": true,
        "result": {
            "clearvue_savings": {
                "last_week": "",
                "value": parseFloat(last_week_clearvue_savings.dbResponse.clearvue_savings) || 0
            },
            "cumulative_clearvue_savings": parseFloat(cumulative_clearvue_savings.cumulative_savings) || 0,
            "last_week_average_hours": {
                "average_hours_per_worker": Math.round((parseFloat(last_week_current_total_hours.working_hours) / parseFloat(last_week_current_worker_count)) * 100) / 100 || 0,
                "past_average_hours_per_worker": Math.round((parseFloat(last_week_past_total_hours.working_hours) / parseFloat(last_week_past_worker_count)) * 100) / 100 || 0,
                "last_week": ""
            },
            "eight_week_average_worker_working_hours": Math.round((parseFloat(eight_week_current_total_hours.working_hours) / eight_week_current_worker_count) * 100) / 100 || 0,
            "past_eight_week_average_worker_working_hours": Math.round((parseFloat(eight_week_past_total_hours.working_hours) / eight_week_past_worker_count) * 100) / 100 || 0

        },
        "is_data_available": parseFloat(cumulative_clearvue_savings.cumulative_savings) > 0 ? true : false
    }
}

export const getLeaversAnalysisService = async (requestArgs) => {
    let whereClause = `survey_result.surveyId = ${config.EXIT_SURVEY_ID} and survey_result.questionId = ${config.EXIT_SURVEY_QUESTION_ID}`;
    if (requestArgs.client_id) {
        whereClause = `${whereClause} and survey_result.clientId = ${requestArgs.client_id}`
    }
    if (requestArgs.agency_id) {
        whereClause = `${whereClause} and survey_result.agencyId = ${requestArgs.agency_id}`
    }
    if (requestArgs.site_id) {
        whereClause = `${whereClause} and survey_result.siteId = ${requestArgs.site_id}`
    }
    if (requestArgs.region_id) {
        const sites = await getSites(`site.region_id=${requestArgs.region_id}`);
        if (!_.size(sites)) {
            return {
                "ok": true,
                "result": {
                    "rows": []
                },
                "is_data_available": false
            }
        }
        whereClause = `${whereClause} and survey_result.siteId IN (${_.map(sites, 'id')})`;
    }
    let leaverAnalysis = await getLeaverAnalysis(whereClause);
    return {
        "ok": true,
        "result": {
            "rows": leaverAnalysis
        },
        "is_data_available": leaverAnalysis.length ? true : false
    }
}

export const getRatingsService = async (requestArgs) => {
    return {
        "ok": true,
        "result": {
            "agency": {
                "total_reviews": 0,
                "rating": 1,
                "breakdown": [
                    { key: "training", value: 0 },
                    { key: "leadership", value: 0 },
                    { key: "engagement", value: 0 },
                    { key: "recognition", value: 0 },
                    { key: "identification", value: 0 }
                ]
            },
            "site": {
                "total_reviews": 0,
                "rating": 1,
                "breakdown": [
                    { key: "training", value: 0 },
                    { key: "leadership", value: 0 },
                    { key: "engagement", value: 0 },
                    { key: "recognition", value: 0 },
                    { key: "identification", value: 0 }
                ]
            },
            "client": {
                "total_reviews": 0,
                "rating": 1,
                "breakdown": [
                    { key: "training", value: 0 },
                    { key: "leadership", value: 0 },
                    { key: "engagement", value: 0 },
                    { key: "recognition", value: 0 },
                    { key: "identification", value: 0 }
                ]
            }
        }
    }
}


/*
    Other
*/
export const getWorkerWhereClauseString = (requestArgs, isActiveWorkers = 1, mainEntity = "workers", start_date = "", end_date = "", shouldIncludeInactivateFilter = false) => {
    let whereClauseString = "";

    if (isActiveWorkers === 2) { // Consider active workers for provided date range
        whereClauseString = `(workers.in_actived_at is null OR workers.in_actived_at >= '${start_date}') AND workers.start_date <= '${end_date}' AND `
    }

    else if (isActiveWorkers === 0) {
        whereClauseString = `workers.is_active =  ${isActiveWorkers} AND `
        if (shouldIncludeInactivateFilter) {
            whereClauseString += `workers.in_actived_at >= '${start_date}' AND workers.in_actived_at <= '${end_date}' AND `;
        }
    }

    else if (isActiveWorkers !== null) {
        whereClauseString = `workers.is_active =  ${isActiveWorkers} AND `;
    }

    if (requestArgs.client_id) {
        requestArgs[`${mainEntity}.client_id`] = requestArgs.client_id;
        delete requestArgs.client_id;
    }

    if (requestArgs.agency_id) {
        requestArgs[`${mainEntity}.agency_id`] = requestArgs.agency_id;
        delete requestArgs.agency_id;
    }

    return objectToMySQLConditionString(requestArgs, whereClauseString);
}

const getPayrollWhereClauseString = (requestArgs, isActiveWorkers = 1, mainEntity = "payroll") => {
    let whereClauseString = ``;

    if (requestArgs.client_id) {
        requestArgs[`${mainEntity}.client_id`] = requestArgs.client_id;
        delete requestArgs.client_id;
    }

    if (requestArgs.agency_id) {
        requestArgs[`${mainEntity}.agency_id`] = requestArgs.agency_id;
        delete requestArgs.agency_id;
    }

    if (requestArgs.site_id) {
        requestArgs[`${mainEntity}.site_id`] = requestArgs.site_id;
        delete requestArgs.site_id;
    }

    if (requestArgs.region_id) {
        requestArgs[`site.region_id`] = requestArgs.region_id;
        delete requestArgs.region_id;
    }

    if (requestArgs.department_id) {
        requestArgs[`job_association.department_id`] = requestArgs.department_id;
        delete requestArgs.department_id;
    }

    if (requestArgs.shift_id) {
        requestArgs[`job.shift_id`] = requestArgs.shift_id;
        delete requestArgs.shift_id;
    }

    return objectToMySQLConditionString(requestArgs, whereClauseString);
}

const getWhereClauseString = (requestArgs: any, associatedTableName: string, renameOriginTables = true) => {

    let whereClauseString = "";

    if (requestArgs.client_id) {
        requestArgs = removeKeyFromObject("client_id", `${associatedTableName}.client_id`, requestArgs);
    }

    if (requestArgs.agency_id) {
        requestArgs = removeKeyFromObject("agency_id", `${associatedTableName}.agency_id`, requestArgs);
    }

    if (renameOriginTables) {
        if (requestArgs.site_id) {
            requestArgs = removeKeyFromObject("site_id", "site.id", requestArgs);
        }
        if (requestArgs.region_id) {
            requestArgs = removeKeyFromObject("region_id", "region.id", requestArgs);
        }
        if (requestArgs.shift_id) {
            requestArgs = removeKeyFromObject("shift_id", "shift.id", requestArgs);
        }
        if (requestArgs.department_id) {
            requestArgs = removeKeyFromObject("department_id", "departments.id", requestArgs);
        }
    }

    return objectToMySQLConditionString(requestArgs, whereClauseString);
};


/**
 * Get day wise completed shift details for a given date range for active and inactive workers as per passed argument
 * @param  {} requestArgs
 * @param  {} forActiveWorkers=1
 */
const getShiftUtilisationDetails = async (requestArgs, forActiveWorkers = 1) => {
    const { "start_date": startDate, "end_date": endDate, ...otherRequestArgs } = requestArgs;
    let result = [0, 0, 0, 0, 0, 0, 0];
    let response = await getShiftUtilisationDetailsModel(
        startDate,
        endDate,
        getWorkerWhereClauseString(otherRequestArgs, forActiveWorkers == 1 ? 2 : forActiveWorkers, "time_and_attendance_data", startDate, endDate)
    );

    if (response.length) {
        let dayWiseData = arrayToObject(response, "avg_days");
        result = [
            parseInt(dayWiseData['1'] && (dayWiseData['1'].worker_counts) || 0),
            parseInt(dayWiseData['2'] && (dayWiseData['2'].worker_counts) || 0),
            parseInt(dayWiseData['3'] && (dayWiseData['3'].worker_counts) || 0),
            parseInt(dayWiseData['4'] && (dayWiseData['4'].worker_counts) || 0),
            parseInt(dayWiseData['5'] && (dayWiseData['5'].worker_counts) || 0),
            parseInt(dayWiseData['6'] && (dayWiseData['6'].worker_counts) || 0),
            parseInt(dayWiseData['7'] && (dayWiseData['7'].worker_counts) || 0)
        ]
    }

    return {
        "ok": true,
        "result": result,
        "is_data_available": true
    }
};


const getDayWiseShiftUtilisationDetails = async (requestArgs, isForActiveWorkers = 1) => {
    let weekAndWorkerWiseDetails = {};
    let agencyWiseHours = {};
    let agencyDetails = {};
    let agencyIdsList = [];
    let apiResponse = [];

    const { "start_date": startDate, "end_date": endDate, ...otherRequestArgs } = requestArgs;

    let agencyList = await getAssociatedAgenciesList(otherRequestArgs, getWhereClauseString(deepClone(otherRequestArgs), 'agency_client_association'));

    if (agencyList) {

        let whereClauseString = getWhereClauseString(deepClone(otherRequestArgs), "time_and_attendance_data", false);

        whereClauseString += isForActiveWorkers ? ` AND workers.start_date <= '${endDate}' AND (workers.in_actived_at >= '${startDate}' OR workers.in_actived_at is null)` : ""

        let response = await getWorkersDayWiseShiftUtilisationDetails(
            startDate,
            endDate,
            whereClauseString
        );

        let totalWorkerDetails = await getTotalWorkers(
            deepClone(requestArgs),
            getWorkerWhereClauseString(deepClone(otherRequestArgs), null) + ` AND workers.start_date <= '${endDate}' AND (workers.in_actived_at >= '${startDate}' OR workers.in_actived_at is null)`
        );

        let totalWorkerDetailsObject = Object.assign({}, ...(totalWorkerDetails.map(item => ({ [item.agency_id]: parseInt(item.workers_count) }))));

        agencyList.forEach((element) => {
            agencyDetails[element.agency_detail_id] = {
                name: element.agency_name
            }

            if (!agencyIdsList.includes(element.agency_detail_id)) {
                agencyIdsList.push(element.agency_detail_id);
            }
        })

        let agencyWiseResponse = {};

        response.forEach((element) => {
            let key = element.avg_days < 4 ? '1-3' : '4+';

            if (agencyWiseResponse[element.agency_id]) {
                agencyWiseResponse[element.agency_id][key] = agencyWiseResponse[element.agency_id][key] + parseInt(element.worker_counts);
            } else {
                agencyWiseResponse[element.agency_id] = {
                    "1-3": key === "1-3" ? parseInt(element.worker_counts) : 0,
                    "4+": key === "4+" ? parseInt(element.worker_counts) : 0,
                    "total": parseInt(totalWorkerDetailsObject[element.agency_id] || 0)
                }
            }
        });

        agencyIdsList.forEach((agencyId) => {

            if (agencyWiseResponse[agencyId]) {
                apiResponse.push({
                    "label": agencyDetails[agencyId]['name'],
                    "1-3": agencyWiseResponse[agencyId]['1-3'],
                    "4+": agencyWiseResponse[agencyId]['4+'],
                    "total": agencyWiseResponse[agencyId]['total']
                })
            } else {
                apiResponse.push({
                    "label": agencyDetails[agencyId]['name'],
                    "1-3": 0,
                    "4+": 0,
                    "total": parseInt(totalWorkerDetailsObject[agencyId] || 0)
                })
            }
        })
    }

    return apiResponse;
}

const getWorkerWhereClauseStringForTotalWorkers = (requestArgs, mainEntity = "workers", isActiveWorkers = 1, start_date = "", end_date = "", shouldIncludeInactivateFilter = false) => {

    let whereClauseString = "";

    if (isActiveWorkers === 2) { // Consider active workers for provided date range
        whereClauseString = `(workers.in_actived_at is null OR workers.in_actived_at >= '${start_date}') AND workers.start_date <= '${end_date}' AND `
    }

    else if (isActiveWorkers === 0) {
        whereClauseString = `workers.is_active =  ${isActiveWorkers} AND `
        if (shouldIncludeInactivateFilter) {
            whereClauseString += `workers.in_actived_at >= '${start_date}' AND workers.in_actived_at <= '${end_date}' AND `;
        }
    }

    if (requestArgs.client_id) {
        requestArgs[`${mainEntity}.client_id`] = requestArgs.client_id;
        delete requestArgs.client_id;
    }

    if (requestArgs.agency_id) {
        requestArgs[`${mainEntity}.agency_id`] = requestArgs.agency_id;
        delete requestArgs.agency_id;
    }

    return objectToMySQLConditionString(requestArgs, whereClauseString);
}

const getWorkerWhereClauseStringForActiveWorkers = (requestArgs, mainEntity = "time_and_attendance_data") => {
    let whereClauseString = "";
    if (requestArgs.client_id) {
        requestArgs[`${mainEntity}.client_id`] = requestArgs.client_id;
        delete requestArgs.client_id;
    }

    if (requestArgs.agency_id) {
        requestArgs[`${mainEntity}.agency_id`] = requestArgs.agency_id;
        delete requestArgs.agency_id;
    }
    return objectToMySQLConditionString(requestArgs, whereClauseString);
}



/**
 * Demographis API service layer
 */


/**
 * Get gender details of the workers with support of various filters like agency, client & site
 * @param  {} requestArgs
 */
export const getGenderAnalyticsService = async (requestArgs) => {
    let { "is_active": isActive, "type": workerType, ...otherRequestArgs } = requestArgs;
    isActive = isActive === 'true' || isActive === undefined ? 1 : 0;
    let whereClauseString = getWorkerWhereClauseString(otherRequestArgs, isActive) + (workerType ? ` AND workers.type='${workerType}'` : "");

    let response = await getWorkerDemographicsDetails(
        requestArgs,
        whereClauseString,
        'workers.orientation'
    );
    return {
        "ok": true,
        "result": {
            "rows": parseDemographicsValueToInteger(response)
        },
        "is_data_available": response.length ? true : false
    };
}


/**
 * Get proximity details (post-code) of the workers with support of various filters like agency, client & site
 * @param  {} requestArgs
 */
export const getProximityAnalyticsService = async (requestArgs) => {

    let { "is_active": isActive, "type": workerType, ...otherRequestArgs } = requestArgs;
    isActive = isActive === 'true' || isActive === undefined ? 1 : 0;
    let whereClauseString = getWorkerWhereClauseString(otherRequestArgs, isActive) + (workerType ? ` AND workers.type='${workerType}'` : "");

    let response = await getWorkerDemographicsDetails(
        requestArgs,
        whereClauseString,
        'workers.post_code'
    );
    return {
        "ok": true,
        "result": {
            "rows": parseDemographicsValueToInteger(response)
        },
        "is_data_available": response.length ? true : false
    };
}


/**
 * Get age group details of the workers with support of various filters like agency, client & site
 * @param  {} requestArgs
 */
export const getAgeAnalyticsService = async (requestArgs) => {

    let { "is_active": isActive, "type": workerType, ...otherRequestArgs } = requestArgs;
    isActive = isActive === 'true' || isActive === undefined ? 1 : 0;
    let whereClauseString = getWorkerWhereClauseString(otherRequestArgs, isActive) + (workerType ? ` AND workers.type='${workerType}'` : "");

    let response = await getWorkerDemographicsDetails(
        requestArgs,
        whereClauseString,
        `CASE
            WHEN IFNULL(TIMESTAMPDIFF(YEAR, workers.date_of_birth, CURDATE()), 0) < 24 THEN "< 23"
            WHEN IFNULL(TIMESTAMPDIFF(YEAR, workers.date_of_birth, CURDATE()), 0) < 41 THEN "24-40"
            WHEN IFNULL(TIMESTAMPDIFF(YEAR, workers.date_of_birth, CURDATE()), 0) < 51 THEN "41-50"
            WHEN IFNULL(TIMESTAMPDIFF(YEAR, workers.date_of_birth, CURDATE()), 0) < 61 THEN "51-60"
            else "60+"
        END`
    );
    return {
        "ok": true,
        "result": {
            "rows": parseDemographicsValueToInteger(response)
        },
        "is_data_available": response.length ? true : false
    };
}

const parseDemographicsValueToInteger = (data) => {
    return data.map(({ value, label }) => ({ label: label, value: parseInt(value) }));
};

/**
 * Get standard and overtime group by start date
 * @param  {} requestArgs
 */
export const getSpendTrendsAnalysticsService = async (requestArgs) => {

    const { start_date, end_date, type, ...otherRequestArgs } = requestArgs;
    const { startDate, endDate, standard, workerData, numberOfWeeks } = getStartDateEndDateWeekNumber(start_date, end_date);

    let whereClause = getWorkerWhereClauseString(deepClone(otherRequestArgs), null, 'time_and_attendance_data') + (type ? ` AND worker.type = '${type}' ` : '');

    let totalSpendTrends = await getTotalSpendTrendsAnalytics(startDate, endDate, whereClause, otherRequestArgs.region_id, otherRequestArgs.client_id);

    totalSpendTrends.forEach(key => {
        let endDate = moment(key.start_date).endOf('week').format('YYYY-MM-DD')
        let weekNumber = getWeeksOfTwoDates(startDate, endDate);
        standard[weekNumber - 1] = key.standard;
        workerData[weekNumber - 1] = key.overtime;
    });

    return {
        "ok": true,
        "result": {
            labels: getWeeklabels(numberOfWeeks),
            standard,
            overtime: workerData
        }
    };
}

/**
 * Get standard and overtime group by pay type 
 * @param  {} requestArgs
 */
export const getHoursTrendsAnalysticsService = async (requestArgs) => {
    const { start_date, end_date, type, ...otherRequestArgs } = requestArgs;
    const { startDate, endDate, standard, workerData, numberOfWeeks } = getStartDateEndDateWeekNumber(start_date, end_date);

    let whereClause = getWorkerWhereClauseString(deepClone(otherRequestArgs), null, 'time_and_attendance_data') + (type ? ` AND worker.type = '${type}' ` : '');
    let totalHoursTrends = await getTotalHoursTrendsAnalytics(startDate, endDate, whereClause, otherRequestArgs.region_id, otherRequestArgs.client_id);

    totalHoursTrends.forEach(key => {
        let endDate = moment(key.start_date).endOf('week').format('YYYY-MM-DD')
        let weekNumber = getWeeksOfTwoDates(startDate, endDate);
        if (key.pay_type == 'Standard') {
            standard[weekNumber - 1] = key.hours;
        }
        if (key.pay_type == 'Overtime') {
            workerData[weekNumber - 1] = key.hours;
        }
    });

    return {
        "ok": true,
        "result": {
            labels: getWeeklabels(numberOfWeeks),
            standard,
            overtime: workerData
        }
    };
}

/**
 * Get total workers with group by start date  
 * @param  {} requestArgs
 */

export const getTotalHeadsTrendsAnalysticsService = async (requestArgs) => {
    const { start_date, end_date, type, ...otherRequestArgs } = requestArgs;
    const { startDate, endDate, workerData, numberOfWeeks } = getStartDateEndDateWeekNumber(start_date, end_date);

    if (type == config.PERMANENT_WORKER) {
        return {
            "ok": true,
            "result": {
                labels: getWeeklabels(numberOfWeeks),
                total_workers: workerData
            }
        }
    }

    let totalHeadsTrends = await getTotalHeadsTrendsAnalytics(startDate, endDate, objectToMySQLConditionString(otherRequestArgs), otherRequestArgs.region_id, otherRequestArgs.client_id);

    totalHeadsTrends.forEach(key => {
        let endDate = moment(key.start_date).endOf('week').format('YYYY-MM-DD')
        let weekNumber = getWeeksOfTwoDates(startDate, endDate);
        if (key.heads) {
            workerData[weekNumber - 1] = parseInt(key.heads);
        }
    });
    return {
        "ok": true,
        "result": {
            labels: getWeeklabels(numberOfWeeks),
            total_workers: workerData
        }
    }
}

/**
 * Get total leaver workers with group by in actived date  
 * @param  {} requestArgs
 */
export const getLeaversTrendsAnalysticsService = async (requestArgs) => {

    const { start_date, end_date, type, ...otherRequestArgs } = requestArgs;
    const { startDate, endDate, workerData, numberOfWeeks } = getStartDateEndDateWeekNumber(start_date, end_date);

    let whereClause = getWorkerWhereClauseString(deepClone(otherRequestArgs), null, 'workers') + (type ? ` AND workers.type = '${type}' ` : '');

    let totalLeaversTrends = await getTotalLeaversTrendsAnalytics(startDate, endDate, whereClause, otherRequestArgs.region_id, otherRequestArgs.client_id);

    totalLeaversTrends.forEach(key => {
        let endDate = moment(key.in_actived_at).endOf('week').format('YYYY-MM-DD')
        let weekNumber = getWeeksOfTwoDates(startDate, endDate);
        workerData[weekNumber - 1] += parseInt(key.total);
    });
    return {
        "ok": true,
        "result": {
            labels: getWeeklabels(numberOfWeeks),
            total_hours: workerData
        }
    }
}

export const getSiteRatingsTrendsAnalysticService = async (requestArgs) => {
    let { client_id, site_id, agency_id, region_id, start_date, end_date, type } = requestArgs;
    let whereClause: string = `survey_result.rating is not null AND survey_question.belongs_to='SITE' AND survey_result.created_at >= '${start_date}' AND survey_result.created_at<='${end_date}' `;

    whereClause += agency_id ? `AND survey_result.agency_id = ${agency_id} ` : "";
    whereClause += type ? `AND worker.type = '${type}' ` : '';

    if (client_id && !site_id) {

        let siteDetails: any = await getAllSites(client_id, region_id);
        let site = siteDetails[1].sites;
        let site_id_list = site.map(object => parseInt(object.id));
        if (_.size(site_id_list)) {
            whereClause += `AND survey_result.site_id IN (${site_id_list}) AND survey_result.client_id = ${client_id} `;
        } else {
            whereClause = ``;
        }
    }
    else {
        whereClause += `AND survey_result.site_id = ${site_id} AND survey_result.client_id = ${client_id} `;
    }
    return {
        "ok": true,
        "result": formatTrendsResponse(whereClause ? await getTrendSiteRating(whereClause) : [])
    }
}

export const getAgencyRatingsTrendsAnalysticService = async (requestArgs) => {
    let { start_date, end_date, type, ...otherArgs } = requestArgs;
    let whereClause = getWorkerWhereClauseString(deepClone(otherArgs), null, 'survey_result') + (type ? ` AND worker.type = '${type}' ` : '');

    return {
        "ok": true,
        "result": formatTrendsResponse(await getTrendAgencyRating(whereClause, start_date, end_date, otherArgs.region_id, otherArgs.client_id))
    }
}

export const getCompanyRatingsTrendsAnalysticService = async (requestArgs) => {
    let { start_date, end_date, type, ...otherArgs } = requestArgs;
    let { client_id } = requestArgs;
    let whereClause = getWorkerWhereClauseString(otherArgs, null, 'survey_result') + (type ? ` AND worker.type = '${type}' ` : '');

    return {
        "ok": true,
        "result": formatTrendsResponse(await getTrendCompanyRating(whereClause, start_date, end_date, requestArgs.region_id, client_id))
    }
}

const getStartDateEndDateWeekNumber = (start_date, end_date) => {
    let startDate = moment(start_date).startOf('week').format('YYYY-MM-DD')
    let endDate = moment(end_date).endOf('week').format('YYYY-MM-DD')
    let numberOfWeeks = getWeeksOfTwoDates(startDate, endDate);

    // Initialize zero standard and overtime pay for all weeks
    let standard = new Array(numberOfWeeks).fill(0);
    let workerData = new Array(numberOfWeeks).fill(0);

    return { startDate, endDate, standard, numberOfWeeks, workerData };
}

const formatTrendsResponse = (ratingsArray) => {
    let avg_score = [];

    let labels = Array.from({ length: 52 }, (_, i) => {
        i += 1
        let obj = ratingsArray.find(x => x.week_number === i)
        avg_score.push(obj ? parseInt(obj.ratings) : 0)
        return "Week " + i;
    });

    return { labels, avg_score }

}

exports.getPayrollWhereClauseString = getPayrollWhereClauseString;
