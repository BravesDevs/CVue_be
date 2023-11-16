import moment from "moment";
import { snakeCaseToPascalCase } from "../utils";
import {
    getDashboardClientsList, getDashboardAgencyList, getDashboardSectorsList,
    getDashboardAnalyticsData,
    getDashboardCount,
    getDashboardPayrollDataHelper
} from "./../models";


/**
 * Get the client list for the dashboard.
 */
export const getDashboardClientsListService = async (page = 1, limit = 5, sortBy = "total_spend", sortType = "DESC") => {
    const offset = (page - 1) * limit;
    let dbResponse = await getDashboardClientsList(offset, limit, sortBy, sortType);
    return {
        "ok": true,
        "count": await getDashboardCount(snakeCaseToPascalCase('client_details')),
        "records": dbResponse.map((record) => {
            return {
                id: parseInt(record.id),
                name: record.name,
                used: parseInt(record.used),
                total_active_workers: parseInt(record.total_active_workers),
                cumulative_clearvue_saving: record.cumulative_clearvue_saving,
                total_spend: record.total_spend,
                last_week_active_workers: parseInt(record.last_week_active_workers)
            }
        })
    }
};



/**
 * Get the agency list for the dashboard.
 */
export const getDashboardAgencyListService = async (page = 1, limit = 5, sortBy = "total_spend", sortType = "DESC") => {
    const offset = (page - 1) * limit;
    let dbResponse = await getDashboardAgencyList(offset, limit, sortBy, sortType);

    return {
        "ok": true,
        "count": await getDashboardCount(snakeCaseToPascalCase('agency_details')),
        "records": dbResponse.map((record) => {
            return {
                id: parseInt(record.id),
                name: record.name,
                used: parseInt(record.used),
                total_active_workers: parseInt(record.total_active_workers),
                cumulative_clearvue_saving: record.cumulative_clearvue_saving,
                total_spend: record.total_spend
            }
        })
    }
};


/**
 * Get the sectors list for the dashboard.
 */
export const getDashboardSectorsListService = async (page = 1, limit = 5, sortBy = "total_spend", sortType = "DESC") => {
    const offset = (page - 1) * limit;
    let dbResponse = await getDashboardSectorsList(offset, limit, sortBy, sortType);

    return {
        "ok": true,
        "count": await getDashboardCount('Sector'),
        "records": dbResponse.map((record) => {
            return {
                id: parseInt(record.id),
                name: record.name,
                used: parseInt(record.used),
                total_active_workers: parseInt(record.total_active_workers),
                cumulative_clearvue_saving: record.cumulative_clearvue_saving,
                total_spend: record.total_spend
            }
        })
    }
};


/**
 * Get dashboard analytics data.
 */
export const getDashboardAnalyticsDataService = async () => {
    let dbResponse = await getDashboardAnalyticsData();

    return {
        "ok": true,
        "records": {
            agency_count: parseInt(dbResponse[0].agency_count),
            client_count: parseInt(dbResponse[0].client_count),
            worker_count: parseInt(dbResponse[0].worker_count),
            total_spends: dbResponse[0].total_spends,
            cumulative_savings: dbResponse[0].cumulative_savings
        }
    }
};

/**
 * Get dashboard payroll data.
 */
export const getDashboardPayrollDataService = async (data) => {
    const offset = (data.page - 1) * data.limit;
    let response_data = await getDashboardPayrollDataHelper(offset, data.limit, data.sort_by, data.sort_type);
    response_data.paginated_data.map(object => {
        object.workers = parseInt(object.workers)
        object.start_date = moment(object.start_date).format("YYYY-MM-DD")
    })
    return {
        "ok": true,
        "count": response_data.all_data.length,
        "records": response_data.paginated_data
    }
};
