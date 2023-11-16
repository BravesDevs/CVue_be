import { getSignedUrlForGetObject, validateRequestData, notifyBugsnag } from '../utils';
const mime = require('mime-types');
const moment = require('moment');
import { dateTimeFormates } from "../common/constants";
import { RoleTypeForCSV } from "../common";
import {
    AddWorkerSchema,
    ErrorResponse,
    UpdateWorkerSchema,
    bulkUploadWorkerCsvSchema,
    GetWorkersListSchema,
    GetWorkerDetailsByWorkerIdSchema,
    WorkerLoginSchema,
    CheckWorkerAvailabilitySchema,
    workerRegistrationSchema,
    GetWorkersListSchemaWithoutPagination,
    workerProfileSchema,
    UpdateWorkerProfileSchema,
    SendMessageRequestParamsSchema,
    updateSingleWorkerSchema,
    MimeType,
    BadRequestError, GetNationalityQueryParamsSchema
} from '../common';
import {
    addBulkWorkers,
    addNewWorkerService,
    getWorkersListService,
    updateWorkerService,
    getWorkerDetailsByWorkerIdService,
    workerLoginService,
    documentsUploadService,
    workerRegistationService,
    getWorkersListWithoutPaginationService,
    checkWorkerAvailableService,
    workerProfileService,
    updateWorkerProfileService,
    getWorkerGroupListService,
    updateWorkerDetailService,
    trackWorkerTrainingService, getWorkersNationalityService, deleteWorkerAccountService
} from '../services';
import { config } from '../configurations';
import { QueryParamsSchemaWithIdOnly, TrackWorkerTrainingSchema } from '../common/schema';
const path = require('path');
const csvParser = require('csvtojson');
const deepClone = require('lodash.clonedeep');

/**
 * Add new worker to the system
 * @param req Request
 * @param res Response
 * @param next
 */
export const addNewWorker = async (req, res, next) => {
    try {
        // Validate request body
        let payload = await validateRequestData(AddWorkerSchema, req.body);
        if (!payload.agency_id && !payload.client_id) {
            let errorResponse = ErrorResponse.BadRequestError;
            errorResponse.message = "'agent_id' or 'client_id' should be required."
            return res.status(400).json();
        }
        let response = await addNewWorkerService(payload, req.user.user_id);
        return res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

/**
 * API to upload bulk workers data from CSV
 * @param  req Request
 * @param  res Response
 * @param  next Next
 */
export const bulkUploadWorkers = async (req, res, next) => {
    try {
        if (!req.files || (!req.query.agency_id && !req.query.client_id)) {
            return res.status(400).json({
                "status": 400,
                "ok": false,
                "message": "Missing data for required fields.",
                "error": "BAD_REQUEST"
            });
        }
        let extension = path.extname(req.files.workers.name);
        if (extension !== ".csv") {
            return res.status(400).json({
                "status": 400,
                "ok": false,
                "message": "Invalid file type.",
                "error": "BAD_REQUEST"
            })
        }

        let csvData = await csvParser().fromString(req.files.workers.data.toString('utf8'));
        let payload = await validateRequestData(bulkUploadWorkerCsvSchema, csvData, true);

        if (payload.length > config.MAX_BULK_WORKER_UPLOAD_LIMIT || payload.length < 1) {
            return res.status(400).json({
                "status": 400,
                "ok": false,
                "message": "No. of workers must be atleast 1 and less than or equals to " + config.MAX_BULK_WORKER_UPLOAD_LIMIT.toString() + ".",
                "error": "BAD_REQUEST"
            });
        }

        const bulk_worker_data_list = payload.map(({
            payroll_ref,
            employee_id,
            national_insurance_number,
            first_name,
            last_name,
            dob,
            nationality,
            sex,
            email,
            country_code,
            mobile,
            job_name,
            department_name,
            shift_name,
            role_type,
            start_date,
            is_active,
            post_code,
        }) => ({
            payrollRef: payroll_ref,
            employeeId: employee_id,
            nationalInsuranceNumber: national_insurance_number,
            firstName: first_name,
            lastName: last_name,
            dateOfBirth: moment(dob, "DD-MM-YYYY").format(dateTimeFormates.YYYYMMDD),
            nationality: nationality,
            orientation: sex,
            email: email,
            countryCode: country_code,
            mobile: mobile,
            jobName: job_name,
            departmentName: department_name,
            shiftName: shift_name,
            roleType: RoleTypeForCSV[role_type.trim().toUpperCase().replace(/-|_|\s/g, "")],
            startDate: moment(start_date, "DD-MM-YYYY").format(dateTimeFormates.YYYYMMDD),
            isActive: is_active,
            postCode: post_code,
        }));

        let response = await addBulkWorkers(
            bulk_worker_data_list,
            parseInt(req.user.user_id),
            parseInt(req.query.client_id) || null,
            parseInt(req.query.agency_id) || null,
            parseInt(req.query.site_id) || null,
            req.query.type
        );
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to update bulk workers data.
 * @param  req Request
 * @param  res Response
 * @param  next Next
 */
export const bulkUpdateWorkers = async (req, res, next) => {
    try {
        await validateRequestData(UpdateWorkerSchema, req.body);
        let response = await updateWorkerService(req.body);
        return res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

/**
 * API to download sample file to upload the Bulk workers.
 * @param req
 * @param res
 * @param next
 */
export const downloadSampleFile = async (req, res, next) => {
    try {
        let link = await getSignedUrlForGetObject(config.BUCKET_NAME, config.WORKER_BUCKET_FOLDER, config.WORKER_SAMPLE_DOWNLOAD_BUCKET_KEY);
        res.status(200).json({
            ok: true,
            "resource_url": link.url,
        })
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to GET workers list.
 * @param req
 * @param res
 * @param next
 */
export const getWorkersList = async (req, res, next) => {
    try {
        await validateRequestData(GetWorkersListSchema, req.query);
        let response = await getWorkersListService(req.query);
        return res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}
/**
 * API to get the worker details by worker ID.
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const getWorkerDetailsByWorkerId = async (req, res, next) => {
    try {
        await validateRequestData(GetWorkerDetailsByWorkerIdSchema, req.params);
        let response = await getWorkerDetailsByWorkerIdService(req.params.id, req.user);
        return res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to update the worker password by natioal insurance number and email.
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const workerRegistrationAPI = async (req, res, next) => {
    try {
        await validateRequestData(workerRegistrationSchema, req.body);
        let response = await workerRegistationService(req.body, req.user);
        return res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to GET the workers list without pagination.
 * @param req
 * @param res
 * @param next
 */
export const getWorkersListWithoutPagination = async (req, res, next) => {
    try {
        await validateRequestData(GetWorkersListSchemaWithoutPagination, req.query);
        let response = await getWorkersListWithoutPaginationService(req.query);
        return res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API for worker login.
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const workerLogin = async (req, res, next) => {
    try {
        await validateRequestData(WorkerLoginSchema, req.body);
        let response = await workerLoginService(req.body);
        return res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API for worker login.
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const workerDocumentsUpload = async (req, res, next) => {
    try {

        let mimeTypes = Object.values(MimeType);
        let files = Object.keys(JSON.parse(JSON.stringify(deepClone(req.files))));

        files.forEach(key => {
            if (!mimeTypes.includes(JSON.parse(JSON.stringify(deepClone(req.files[key].mimetype))))) {
                throw new BadRequestError("BAD_REQUEST", `Invalid file type ${mime.extension(req.files[key].mimetype)}`)
            }
        })

        let response = await documentsUploadService(req.files);
        return res.status(response[0]).json(response[1]);

    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}


/**
 * API to check worker availability by first name and national insurance number
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const checkWorkerAvailability = async (req, res, next) => {
    try {
        await validateRequestData(CheckWorkerAvailabilitySchema, req.body);
        let response = await checkWorkerAvailableService(req.body);
        return res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to get the worker profile details including worker training data, shifts completed and length of service.
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const workerProfileAPI = async (req, res, next) => {
    try {
        await validateRequestData(workerProfileSchema, req.params);
        let response = await workerProfileService(req.params.id);
        return res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to update worker profile by user id
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const updateWorkerProfileByUserId = async (req, res, next) => {
    try {
        // Validate query params
        await validateRequestData(QueryParamsSchemaWithIdOnly, req.params);
        // Validate request body
        let validateData = await validateRequestData(UpdateWorkerProfileSchema, req.body);
        let response = await updateWorkerProfileService(req.params.id, validateData);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

export const updateWorkerDetailByWorkerId = async (req, res, next) => {
    try {
        // Validate query params
        await validateRequestData(QueryParamsSchemaWithIdOnly, req.params);
        // Validate request body
        await validateRequestData(updateSingleWorkerSchema, req.body);
        let response = await updateWorkerDetailService(req.params.id, req.body);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to get list of worker groups
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const getWorkerGroupDetails = async (req, res, next) => {
    try {
        await validateRequestData(SendMessageRequestParamsSchema, req.query);
        let response = await getWorkerGroupListService(req.query);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to track the worker training status.
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const trackWorkerTrainingAPI = async (req, res, next) => {
    try {
        await validateRequestData(QueryParamsSchemaWithIdOnly, req.params)
        await validateRequestData(TrackWorkerTrainingSchema, req.body);
        let response = await trackWorkerTrainingService(req.params.id, req.body, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}


/**
 * Get list of nationalities for the workers as per provided site
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
 export const getWorkersNationality = async (req, res, next) => {
    try {
        await validateRequestData(GetNationalityQueryParamsSchema, req.query);
        let response = await getWorkersNationalityService(req.query);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

/**
 * API to delete the worker account by user id
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
 export const deleteWorkerAccount = async (req, res, next) => {
    try {
        let response = await deleteWorkerAccountService(req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}