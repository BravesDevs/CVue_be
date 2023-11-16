/**
 * All the service layer methods for the Workers.
 */
import {
    ErrorCodes,
    ErrorResponse,
    GetWorkersDTO,
    UpdateWorkerDTO,
    AddWorkerDTO,
    BadRequestError,
    bcryptSaltRound,
    UserType, MessageActions, AutomatedMessagesLabels, RoleType, WorkerTypes
} from "../common";

const uuid = require('uuid');
import {
    addNewWorker,
    addNewWorkers,
    updateWorkers,
    getRequestedUserEmailCounts,
    getWorkers,
    getWorkerDetailsHelper,
    getJobsByClientID,
    updateWorkerHelper,
    getWorkerHelper,
    getWorkersWithoutPagination,
    nationalInsuranceNumberExistsHelper,
    getUserByNationalInsuranceNumber,
    createWorkerUser,
    addWorkerUserInBulk,
    getUserIdByNationalInsuranceNumber,
    bulkUpdateUserId,
    getWorkerByFirstNameAndInsuranceNumber,
    updateUser,
    getUserById,
    getWorkerIdfromUserId,
    updateWorkerDetail,
    getWorkerByWorkerId,
    updateUserHelper, createDepartment, createJobAssociation,
    getWorkerUserDetails, getWorkerLengthOfServiceByWorkerId, getWorkerShiftsCompleted, updateWorkerProfile,
    getWorkerTrainingData, getAllWorkerGroup, getWorkerAppreciationDataFromUserIdHelper,
    getWorkerIdFromUserIdAndAgencyId, getMessageDetailsModel, trackWorkerTrainingHelper,
    getWorkerDetailsByMessageIdAndUserId, getAdminEmailsFromSiteId, getAgencyAdminEmailByAgencyId, getDetailsWorkerId,
    getWorkersByNationalInsuranceNumber, updateWorkerNationalInsuranceNumber,
    getExistingNationalInsuranceWithAgency, getExistingEmployeeIdWithAgency, getNationalityOfWorkers, getCompletedTrainingCount,
    getMessageDetailsByLabel, revokeUserProfileAccessHelper
} from "../models";
const path = require('path');
let _ = require("lodash");
import { notifyBugsnag, sendTemplateEmail, uploadFileOnS3 } from "../utils";
import { sendUnassignedWorkerMessages } from "."
const jwt = require("jsonwebtoken");
import { config } from "../configurations";
import moment from "moment";
import { getWorkerWhereClauseString } from './dashboard';
const bcrypt = require('bcryptjs');
import { sendAutomatedEventMessages } from './automatedMessages';


/**
 * Add new worker service
 * @param  {AddWorkerDTO} requestPayload
 * @param {string} loggedInUserId
 */
export const addNewWorkerService = async (requestPayload: AddWorkerDTO, loggedInUserId: string) => {

    try {
        if (await validateWorkerEmailWithExistingUsers([requestPayload.email])) {
            return [409, ErrorResponse.WorkerEmailAlreadyExists];
        }
        let userId;

        // Check national insurance number exists or not
        if (await validateNationalInsuranceNumber(requestPayload.national_insurance_number)) {
            ({ id: userId } = await getUserByNationalInsuranceNumber(requestPayload.national_insurance_number))
        }

        // get the ID of the newly added user and then insert the record into the worker table.
        else {
            ({ id: userId } = await createWorkerUser(requestPayload, loggedInUserId));
        }

        let response = await addNewWorker(requestPayload, userId, loggedInUserId);
        return [201, {
            'ok': true,
            message: MessageActions.CREATE_WORKER,
            'worker_id': parseInt(response.id)
        }]
    } catch (err) {
        if (err.code === ErrorCodes.duplicateKeyError) {
            return [409, ErrorResponse.WorkerAlreadyExists]    // Return 409 if worker already exists
        } else if (err.code === ErrorCodes.dbReferenceError) {
            return [404, ErrorResponse.ResourceNotFound]    // Return 404 if any foreign key contraint is not available in DB
        } else {
            notifyBugsnag(err);
            return [500, err.message]
        }
    }

};

/**
 * Service to add bulk workers data.
 * @param  {} data
 */
export const addBulkWorkers = async (data, userId, clientId, agencyId, siteId, workerType) => {
    try {

        // Checking the existing national insurance number exists with agency id
        let nationalInsuranceNumberArray = data.map(worker => worker.nationalInsuranceNumber);
        let availableNI = await getExistingNationalInsuranceWithAgency(nationalInsuranceNumberArray, agencyId);

        if (_.size(availableNI)) {
            let availableNIList = _.map(availableNI, 'nationalInsuranceNumber');
            return [422, {
                'ok': false,
                'message': `National Insurance number ${availableNIList} already exists`,
            }]
        }
        let availableEmpId = await getExistingEmployeeIdWithAgency(nationalInsuranceNumberArray, agencyId);

        if (_.size(availableNI)) {
            let availableEmpIdList = _.map(availableEmpId, 'employeeId');
            return [422, {
                'ok': false,
                'message': `Employee Id ${availableEmpIdList} already exists`,
            }]
        }

        let dataLength = data.length;
        let associatedClientJobs = await getJobsByClientID(clientId, siteId);
        const jobNotFound = [];
        data = await Promise.all(_.map(data, async (worker) => {
            let jobDetails = _.find(associatedClientJobs, {
                'job_name': worker.jobName.toLowerCase(), 'job_type': String(worker.roleType),
                'department_name': worker.departmentName.toLowerCase(), 'shift_name': worker.shiftName.toLowerCase()
            });
            if (jobDetails) {
                worker.jobId = jobDetails.job_id;
                delete worker.jobName;
                return worker;
            } else {

                let existingJob = _.find(associatedClientJobs, {
                    'job_name': worker.jobName.toLowerCase(), 'job_type': String(worker.roleType),
                    'shift_name': worker.shiftName.toLowerCase()
                });
                if (existingJob) {
                    const department = {
                        name: worker.departmentName.replace(/[^aA-zZ]+/ig, "_"),
                        clientId: clientId,
                        createdBy: userId,
                        updatedBy: userId,
                    }
                    const newDepartment = await createDepartment(department);
                    const createJobAssociationPayload = {
                        jobId: existingJob.job_id,
                        departmentId: newDepartment.id,
                        clientId: clientId,
                        siteId: siteId,
                        createdBy: userId,
                        updatedBy: userId,
                        createdAt: moment().utc().format(),
                        updatedAt: moment().utc().format()
                    }
                    await createJobAssociation(createJobAssociationPayload);
                } else {
                    jobNotFound.push(worker.jobName);
                }
            }
            return worker
        })
        );
        if (_.size(jobNotFound)) {
            return [400, {
                ok: false,
                message: `Job does not exist with name(s): ${_.uniq(jobNotFound)} `
            }]
        }
        let emailList: string[] = [];
        for (let workerDetail of data) {
            emailList.push(workerDetail['email']);
            workerDetail['createdBy'] = userId;
            workerDetail['updatedBy'] = userId;
            workerDetail['clientId'] = clientId;
            workerDetail['agencyId'] = agencyId;
            workerDetail['isActive'] = "isActive" in workerDetail ? (workerDetail.isActive.toString().toLowerCase() === "no" ? false : true) : true;
            workerDetail['type'] = workerType || WorkerTypes.TEMPORARY;
        }
        if (await validateWorkerEmailWithExistingUsers(emailList)) {
            return [409, ErrorResponse.WorkerEmailAlreadyExists];
        }
        await addNewWorkers(data);

        updateWorkerUserService(data, userId)

        return [201, {
            'ok': true,
            message: dataLength + " " + MessageActions.CREATE_WORKERS,
        }]

    } catch (err) {
        if (err.code === ErrorCodes.duplicateKeyError) {
            return [409, ErrorResponse.WorkerAlreadyExists]    // Return 409 if worker already exists
        } else if (err.code === ErrorCodes.dbReferenceError) {
            return [404, ErrorResponse.ResourceNotFound]    // Return 404 if any foreign key contraint is not available in DB
        } else {
            notifyBugsnag(err);
            return [422, ErrorResponse.UnprocessableEntity]
        }
    }
};

/**
 * Service to update the workers data.
 * @param  {UpdateWorkerDTO} requestPayload
 */
export const updateWorkerService = async (requestPayload: UpdateWorkerDTO) => {
    try {
        await updateWorkers(requestPayload);

        if (requestPayload.is_active === false) {
            await sendUnassignedWorkerMessages(requestPayload.workers);
        }

        return [200, {
            'ok': true,
            message: MessageActions.UPDATE_WORKERS
        }]
    } catch (err) {
        if (err.code === ErrorCodes.duplicateKeyError) {
            return [409, ErrorResponse.WorkerAlreadyExists]    // Return 409 if worker already exists
        } else if (err.code === ErrorCodes.dbReferenceError) {
            return [404, ErrorResponse.ResourceNotFound]    // Return 404 if any foreign key contraint is not available in DB
        } else {
            notifyBugsnag(err);
            return [500, err.message]
        }
    }
}

/**
 * Service to update worker.
 */
export const updateWorkerDetailService = async (id, requestPayload) => {
    try {
        let workerDetails = await getWorkerByWorkerId(id)
        if (!workerDetails) {
            return [404, ErrorResponse.WorkerNotFound]
        }
        if (requestPayload.documents) {
            await updateUserHelper(workerDetails.userId, { documents: requestPayload.documents })
            delete requestPayload.documents;
        }
        if (Object.keys(requestPayload).length > 0) {
            let updateWorkerData = {
                firstName: requestPayload.first_name,
                lastName: requestPayload.last_name,
                dateOfBirth: requestPayload.date_of_birth,
                postCode: requestPayload.post_code,
                nationality: requestPayload.nationality,
                orientation: requestPayload.orientation,
                countryCode: requestPayload.country_code,
                mobile: requestPayload.mobile,
                payrollRef: requestPayload.payroll_ref,
                employeeId: requestPayload.employee_id,
                jobId: requestPayload.job_id,
                nationalInsuranceNumber: requestPayload.national_insurance_number,
                clientId: requestPayload.client_id,
                startDate: requestPayload.start_date,
                agencyId: requestPayload.agency_id,
                isActive: requestPayload.is_active,
            }
            let oldWorkerDetails = await getWorkerByWorkerId(id);
            await updateWorkerDetail(id, updateWorkerData);
            const worker = await getWorkerByWorkerId(id);
            let workerDetails = await getWorkersByNationalInsuranceNumber(oldWorkerDetails.nationalInsuranceNumber)
            let workerIds = workerDetails.map(object => parseInt(object.id))
            if (_.size(workerIds)) {
                await updateWorkerNationalInsuranceNumber(workerIds, requestPayload.national_insurance_number)
            }
            const dataToUpdate = {
                name: worker.firstName + ' ' + worker.lastName,
                countryCode: worker.countryCode,
                mobile: worker.mobile,
                clientId: worker.clientId,
                agencyId: worker.agencyId,
                nationalInsuranceNumber: worker.nationalInsuranceNumber
            }
            await updateUserHelper(worker.userId, dataToUpdate);
        }
        return [200, {
            'ok': true,
            message: MessageActions.UPDATE_SINGLE_WORKERS
        }]
    } catch (err) {
        if (err.code === ErrorCodes.duplicateKeyError) {
            return [409, ErrorResponse.WorkerAlreadyExists]    // Return 409 if worker already exists
        } else {
            notifyBugsnag(err);
            return [500, err.message]
        }
    }
}

/**
 * Service to get worker listing.
 */
export const getWorkersListService = async (data: GetWorkersDTO) => {
    try {

        let response = []
        let whereClause: string;

        if (data.client_id && !data.agency_id && !data.site_id) {
            whereClause = `workers.client_id = ${data.client_id} `;
        } else if (data.client_id && data.agency_id && !data.site_id) {
            whereClause = `workers.client_id = ${data.client_id} AND workers.agency_id = ${data.agency_id} `;
        } else if (data.client_id && data.site_id && !data.agency_id) {
            whereClause = `workers.client_id = ${data.client_id} AND job_association.site_id = ${data.site_id} `;
        } else {
            whereClause = `workers.client_id = ${data.client_id} AND workers.agency_id = ${data.agency_id} AND job_association.site_id = ${data.site_id} `;
        }
        whereClause += data.type ? ` AND workers.type = '${data.type}'` : '';
        data.sort_type = data.sort_by === "is_active" ? data.sort_type === "ASC" ? "DESC" : "ASC" : data.sort_type;

        response = await getWorkers(whereClause, data.page || 1, data.limit || 10, data.sort_by || "id", data.sort_type || "ASC") || [];

        return [200, {
            ok: true,
            count: parseInt(response["count"]) || 0,
            workers: response,
        }]

    } catch (err) {
        if (err.code === ErrorCodes.duplicateKeyError) {
            return [409, ErrorResponse.WorkerAlreadyExists];    // Return 409 if worker already exists
        } else if (err.code === ErrorCodes.dbReferenceError) {
            return [404, ErrorResponse.ResourceNotFound];    // Return 404 if any foreign key contraint is not available in DB
        } else {
            notifyBugsnag(err);
            return [500, err.message];
        }
    }
}


/**
 * Validate worker email with user table
 * @param  {string[]} emailList
 */
const validateWorkerEmailWithExistingUsers = async (emailList: string[]) => {
    return await getRequestedUserEmailCounts(emailList) ? true : false;
}

const validateNationalInsuranceNumber = async (nationalInsuranceNumber: string) => {
    return await nationalInsuranceNumberExistsHelper(nationalInsuranceNumber) ? true : false;
}

/**
 * Service to GET worker details by worker ID..
 */
export const getWorkerDetailsByWorkerIdService = async (workerId, loggedInUser) => {
    try {
        let whereClause = `workers.id = ${workerId} `;
        let response = await getWorkerDetailsHelper(whereClause);

        if (!response) {
            return [404, ErrorResponse.ResourceNotFound]
        }
        response.documents = JSON.parse(response.documents);
        let { user_id, agency_id } = response;

        //TODO: GET worker length of service data.
        let workerIds = _.map(await getWorkerIdFromUserIdAndAgencyId(user_id, agency_id), 'id')

        response.length_of_service = await getWorkerLengthOfServiceFromWorkerId(workerIds);

        //TODO: GET worker Shifts completed data.
        response.shift_completed = await getWorkerShiftsCompleted(workerIds);

        let appreciationData = await getWorkerAppreciationDataFromUserIdHelper(user_id, agency_id);

        let workerAppreciation = {
            "awards": appreciationData.map(object => object.appreciation.award).reduce((a, b) => a + b, 0),
            "badge": appreciationData.map(object => object.appreciation.badge).reduce((a, b) => a + b, 0) + await getCompletedTrainingCount(workerIds),
            "kudos": appreciationData.map(object => object.appreciation.kudos).reduce((a, b) => a + b, 0)
        }

        response.appreciation = workerAppreciation;

        response.job_name = `${response.job_name} - ${response.shift_name} - ${RoleType[response.job_type]} - ${response.department_name}`;
        return [200, { ok: true, data: response }]
    } catch (error) {
        notifyBugsnag(error);
        return [500, error.message]
    }
}

/**
 * Service for updating the worker account password.
 * @param  {} requestArgs
 * @param  {} password
 * @param  {} loggedInUser
 */
export const workerRegistationService = async (data, loggedInUser) => {
    try {
        //Confirming whether worker exists.
        let whereClause = `user.email = '${data.email}'`;
        if (data.national_insurance_number) {
            whereClause += ` AND user.national_insurance_number = '${data.national_insurance_number}'`;
        }
        let workerDetails = await getWorkerHelper(whereClause);
        if (!workerDetails) {
            return [404, ErrorResponse.WorkerIsNotRegistered]
        }

        //Fetching the worker id from the response object of the helper. 
        let { user_id } = workerDetails;

        await sendAutomatedEventMessages(
            [workerDetails.id],
            await getMessageDetailsByLabel(AutomatedMessagesLabels.FIRST_DAY_WELCOME_MESSAGE),
            []
        );

        //Generating the hash of the plain password
        let salt = bcrypt.genSaltSync(bcryptSaltRound);
        let encodedPassword = bcrypt.hashSync(data.password, salt);

        //Updating the worker password.
        await updateUser(user_id, { password: encodedPassword, email: data.email });
        return [200, { ok: true, message: MessageActions.REGISTRATION_SUCCESS }]

    } catch (error) {
        notifyBugsnag(error);
        return [500, error.message]
    }
}

/**
 * Service for worker login.
 * @param  {} workerData
 */
export const workerLoginService = async (workerData) => {
    try {
        //Confirming the user existence.
        let whereClause = `user.email = '${workerData.email}'`
        let workerDetails = await getWorkerHelper(whereClause)
        if (!workerDetails) {
            return [404, ErrorResponse.WorkerIsNotRegistered];
        }
        // Confirming the Password
        if (workerDetails.password && bcrypt.compareSync(workerData.password, workerDetails.password)) {

            //Updating the device token of the worker.
            await updateWorkerHelper(workerDetails.user_id, { deviceToken: workerData.device_token || null })

            let jwtWorkerData = {
                user_id: workerDetails.user_id,
                user_name: workerDetails.first_name + ' ' + workerDetails.last_name,
                user_type_id: UserType.AGENCY_WORKER,
            }

            return [200, {
                ok: true,
                user_id: workerDetails.user_id,
                user_type: "worker",


                access_token: await jwt.sign(
                    jwtWorkerData,
                    config.JWT_TOKEN_KEY,
                    {
                        expiresIn: config.WORKER_ACCESS_TOKEN_EXPIRE_TIME,
                    }
                ),

                refresh_token: await jwt.sign(
                    jwtWorkerData,
                    config.JWT_TOKEN_KEY,
                    {
                        expiresIn: config.USER_REFRESH_TOKEN_EXPIRE_TIME,
                    }
                )
            }];

        }
        return [401, ErrorResponse.WorkerInvalidCredentials];
        //Generating the JWT authentication token and resend in login api.
    } catch (error) {
        notifyBugsnag(error);
        return [500, error.message]
    }
}

/**
 * Service for worker to upload the documents.
 * @param  {} workerData
 */
export const documentsUploadService = async (documents) => {
    try {
        let documentKeys = Object.keys(documents)
        let uploadedDocuments = {}
        let uuidList = []

        //Uploading the documents in the folder
        for (const key of documentKeys) {
            let uuidKey = uuid.v1() + path.extname(documents[key].name)
            uuidList.push(uuidKey)
            await uploadFileOnS3(config.BUCKET_NAME, config.DOCUMENTS_FOLDER, uuidKey, documents[key].mimetype, documents[key].data);
        }

        //Getting the url of the object uploaded.
        for (const key of documentKeys) {
            const iterator = documentKeys.indexOf(key);
            let url = config.BUCKET_URL + "/" + config.DOCUMENTS_FOLDER + "/" + uuidList[iterator];
            uploadedDocuments[key] = { name: documents[key].name, url, uuid: uuidList[iterator] };
        }

        return [200, { ok: true, documents: uploadedDocuments }]

    } catch (error) {
        notifyBugsnag(error);
        return [500, error.message]
    }
}

/**
 * Service to get the worker list without pagination support.
 * @param data
 */
export const getWorkersListWithoutPaginationService = async (data: GetWorkersDTO) => {
    try {
        let response = []
        let whereClause = {}
        if (data.client_id && !data.agency_id && !data.site_id) {
            whereClause = `workers.client_id = ${data.client_id} `;
        } else if (data.client_id && data.agency_id && !data.site_id) {
            whereClause = `workers.client_id = ${data.client_id} AND workers.agency_id = ${data.agency_id} `;
        } else if (data.client_id && data.site_id && !data.agency_id) {
            whereClause = `workers.client_id = ${data.client_id} AND job_association.site_id = ${data.site_id} `;
        } else {
            whereClause = `workers.client_id = ${data.client_id} AND workers.agency_id = ${data.agency_id} AND job_association.site_id = ${data.site_id} `;
        }
        whereClause += data.type ? ` AND workers.type = '${data.type}'` : '';
        response = await getWorkersWithoutPagination(whereClause) || [];
        return [200, {
            ok: true,
            count: parseInt(response["count"]) || 0,
            workers: response,
        }]
    } catch (err) {
        if (err.code === ErrorCodes.duplicateKeyError) {
            return [409, ErrorResponse.WorkerAlreadyExists];    // Return 409 if worker already exists
        } else if (err.code === ErrorCodes.dbReferenceError) {
            return [404, ErrorResponse.ResourceNotFound];    // Return 404 if any foreign key contraint is not available in DB
        } else {
            notifyBugsnag(err);
            return [400, ErrorResponse.BadRequestError];
        }
    }
}

/**
 * Service for check worker availability.
 * @param data
 */
export const checkWorkerAvailableService = async (data) => {
    let response = await getWorkerByFirstNameAndInsuranceNumber(data);
    if (!response) {
        return [404, ErrorResponse.WorkerIsNotRegistered]     // Return 404 if any foreign key contraint is not available in DB 
    } else if (response.password) {
        return [409, ErrorResponse.WorkerPasswordAlreadyExists]     // Return 409 if worker password already exists
    }
    return [200, { ok: true }]
}

export const getWorkerIdFromUserIdService = async (userId) => {
    //Get the list of worker-id(s) from the user id.

    let workerIds = await getWorkerIdfromUserId({ userId, isActive: true });
    let workerIdList = _.map(workerIds, 'id');

    if (!_.size(workerIdList)) {
        let workerId = await getWorkerIdfromUserId({ userId });
        workerIdList = _.map(workerId, 'id');
    }
    return [Math.max(...workerIdList), workerIdList];
}


/**
 * Service for fetching the worker profile from user-id.
 * @param userId
 */
export const workerProfileService = async (userId) => {
    /* Check whether the user is worker or not. if not then throw not worker not found. */
    let userDetails = await getUserById(userId)

    if (!userDetails || !userDetails.national_insurance_number) {
        return [404, ErrorResponse.UserNotFound]
    }

    let url = userDetails.resource ? userDetails.resource : config.BUCKET_URL + "/" + config.PROFILE_BUCKET_FOLDER + "/" + config.DEFAULT_IMAGE;
    let [lastAddedWorkerId, workerIdList] = await getWorkerIdFromUserIdService(userId);
    //Fetch the basic worker information like worker name, post-code and save in the response object and training information and right to work documents.
    //TODO: Fetching of the documents from user is remaining.
    let response = await getWorkerUserDetails(userId, lastAddedWorkerId)
    response.url = url;

    response.documents = response.documents ? JSON.parse(response.documents) : {}
    // Worker length of service from worker ID.
    response.length_of_service = await getWorkerLengthOfServiceFromWorkerId(workerIdList);

    //Derive Shifts completed from time and attendance data.
    response.shift_completed = await getWorkerShiftsCompleted(workerIdList);

    let whereClauseString = `training.is_training_completed = 1 and training.worker_id IN(${workerIdList})`
    //TODO: Add worker training data.
    response.training = await getWorkerTrainingData(whereClauseString);

    let workerDetails = await getDetailsWorkerId(lastAddedWorkerId);
    let appreciationData = await getWorkerAppreciationDataFromUserIdHelper(userId);

    let workerAppreciation = {
        "awards": appreciationData.map(object => object.appreciation.award).reduce((a, b) => a + b, 0),
        "badge": appreciationData.map(object => object.appreciation.badge).reduce((a, b) => a + b, 0) + await getCompletedTrainingCount(workerIdList),
        "kudos": appreciationData.map(object => object.appreciation.kudos).reduce((a, b) => a + b, 0)
    }
    response.appreciation = workerAppreciation;
    response = { ...response, ...workerDetails }

    return [200, { ok: true, data: response }]
}

/**
 * Service to update worker user.
 */
export const updateWorkerUserService = async (data, userId) => {
    // List of national insurance numbers.
    let nationalInsuranceNumberList = []

    //Generating list of object with worker_id and national insurance number.
    data.map((dataElement) => {
        nationalInsuranceNumberList.push(dataElement.nationalInsuranceNumber)
    })

    let userNationalInsuranceNumberList = await getUserIdByNationalInsuranceNumber(nationalInsuranceNumberList);

    let userExistNationalInsuranceNumberList = userNationalInsuranceNumberList.map(iterator => {
        return iterator.nationalInsuranceNumber
    })
    data = data.filter((dataElement) => {
        return !userExistNationalInsuranceNumberList.includes(dataElement.nationalInsuranceNumber);
    });

    let usersInsert = []
    usersInsert = data.map(dataElement => {
        return {
            userTypeId: UserType.AGENCY_WORKER.toString(),
            nationalInsuranceNumber: dataElement.nationalInsuranceNumber,
            name: dataElement.firstName + ' ' + dataElement.lastName,
            email: dataElement.email,
            countryCode: dataElement.countryCode || '',
            mobile: dataElement.mobile || '',
            createdBy: userId,
            createdAt: new Date()
        }
    })
    await addWorkerUserInBulk(usersInsert);

    let userNationalInsuranceNumberListAfterInserted = await getUserIdByNationalInsuranceNumber(nationalInsuranceNumberList);

    let str = []
    nationalInsuranceNumberList.forEach((element) => {
        str.push(JSON.stringify(element))
    })
    let updateWhereClauseString = ``;
    userNationalInsuranceNumberListAfterInserted.forEach(iterator => {
        updateWhereClauseString += ` WHEN national_insurance_number = "${iterator.nationalInsuranceNumber}" THEN ${iterator.id} `
    })
    await bulkUpdateUserId(updateWhereClauseString, str)
}

/**
 * Service to update worker user profile.
 */
export const updateWorkerProfileService = async (userId: string, payload) => {

    let object = payload;
    let userDetails = await getUserById(userId);
    if (payload.documents && Object.keys(payload.documents).length > 0) {
        if (userDetails.documents !== null) {
            Object.keys(payload.documents).forEach(key => {
                if (JSON.parse(userDetails.documents)[key] !== undefined) {
                    throw new BadRequestError("BAD_REQUEST", "File already uploaded");
                }
            })
            object = { documents: { ...payload.documents, ...JSON.parse(userDetails.documents) } }
        } else {
            object = { documents: { ...payload.documents } }
        }
    }
    if (payload.resource) {
        object.resource = payload.resource
    }

    let updateResponce = await updateWorkerProfile(userId, object);
    if (!updateResponce.affected) {
        return [404, ErrorResponse.WorkerNotFound]        // Return 404 if any foreign key contraint is not available in DB
    }
    return [200, {
        ok: true,
        message: MessageActions.UPDATE_WORKER_PROFILE,
    }];
};


/**
 * Service to GET worker group.
 */
export const getWorkerGroupListService = async (data) => {
    let workerGroupDetails = await getAllWorkerGroup(data);

    let shifts = [];              //List of shifts
    let jobs = [];                //List of jobs
    let departments = [];         //List of dipartments

    workerGroupDetails.forEach((data) => {
        shifts.push({
            "id": data.shift_id,
            "name": data.shift_name
        })
        jobs.push({
            "id": data.job_id,
            "name": data.job_name
        })
        departments.push({
            "id": data.department_id,
            "name": data.department_name
        })
    });

    // Remove duplicate elements
    shifts = Object.values(shifts.reduce((acc, cur) => Object.assign(acc, { [cur.id]: cur }), {}))
    jobs = Object.values(jobs.reduce((acc, cur) => Object.assign(acc, { [cur.id]: cur }), {}))
    departments = Object.values(departments.reduce((acc, cur) => Object.assign(acc, { [cur.id]: cur }), {}))

    return [200, {
        ok: true,
        data: {
            shifts,
            jobs,
            departments
        }
    }];
}

/**
 * Service to GET worker LOS from worker id.
 */
export const getWorkerLengthOfServiceFromWorkerId = async (workerIds) => {

    let maxWorkerId = Math.max(...workerIds);

    let lengthOfServiceData = await getWorkerLengthOfServiceByWorkerId(maxWorkerId)

    let workerStartDate = moment(lengthOfServiceData.start_date)

    let workerEndDate = moment(lengthOfServiceData.end_date)

    let duration = moment.duration(moment.max(workerEndDate).diff(moment.min(workerStartDate)))

    return {
        "years": duration.years() || 0,
        "months": duration.months() || 0,
        "weeks": duration.weeks() || 0
    };

}

/**
 * Service to GET worker training details.
 */
export const trackWorkerTrainingService = async (messageId, data, loggedInUser) => {
    let message = await getMessageDetailsModel(messageId);
    if (!message) return [404, ErrorResponse.ResourceNotFound]
    if (data.is_training_completed == null && data.require_more_training == null) {
        return [400, ErrorResponse.BadRequestError]
    }
    let updateClause = ``;
    if (data.is_training_completed) {
        updateClause = `SET wt.is_training_completed = ${data.is_training_completed}, wt.training_completed_at = '${new Date().toISOString().slice(0, 19).replace('T', ' ')}',
                wt.updated_by = ${loggedInUser.user_id}, wt.updated_at = '${new Date().toISOString().slice(0, 19).replace('T', ' ')}'`
        await trackWorkerTrainingHelper(updateClause, messageId, loggedInUser)
    }
    else {

        updateClause = `SET wt.require_more_training = ${data.require_more_training}, wt.require_training_updated_at = '${new Date().toISOString().slice(0, 19).replace('T', ' ')}',
                wt.updated_by = ${loggedInUser.user_id}, wt.updated_at = '${new Date().toISOString().slice(0, 19).replace('T', ' ')}'`

        await trackWorkerTrainingHelper(updateClause, messageId, loggedInUser)

        //Fetching the site ID from the message ID.
        let { site_id } = await getMessageDetailsModel(messageId);

        //Fetching the agency ID from the message ID and user ID.
        let { agency_id, worker_id, first_name, last_name, training_name } = await getWorkerDetailsByMessageIdAndUserId(messageId, loggedInUser.user_id);


        //Fetching the site admins email list.
        let siteAdminEmails = await getAdminEmailsFromSiteId(site_id);

        //Mapping the emails of the site admin from array of objects to array.
        let adminEmailList = siteAdminEmails.map(obj => obj.email)

        //Fetching the agency admin email from the agency ID.
        let { email: agency_admin_email } = await getAgencyAdminEmailByAgencyId(agency_id);

        //Preparing the list of email ID to send the email.
        adminEmailList.push(agency_admin_email)

        adminEmailList.forEach(async email => {
            let message = {
                toEmailId: email,
                templateId: config.Sendgrid.BOOKING_NOTIFICATION_EMAIL_TEMPLATE,
                dynamicTemplateData: {
                    subject_line: `Needs more Training`,
                    booking_message: `Worker ${first_name} + ' ' ${last_name} | ${worker_id} has identified that they need more training with ${training_name}.`
                },
            };
            sendTemplateEmail(message);
        })

    }
    return [200, { ok: true }]
}


/**
 * Get nationality of the workers
 * @param  {any} requestArgs
 */
export const getWorkersNationalityService = async (requestArgs: any) => {

    const { workerType, ...otherArgs } = requestArgs;
    let nationalities = await getNationalityOfWorkers(getWorkerWhereClauseString(otherArgs), workerType);

    return [200, {
        ok: true,
        nationalities: nationalities.map((obj) => {
            return obj.nationality;
        })
    }];

}


/**
 * Delete worker account
 * - Reset password to null so worker can't directly login to the system
 * - Worker can again signup to the system to use the mobile application
 * @param  {any} requestArgs
 */
 export const deleteWorkerAccountService = async (loggedInUser) => {

    let result = await revokeUserProfileAccessHelper(loggedInUser.user_id, loggedInUser);
    await updateWorkerHelper(loggedInUser.user_id, { deviceToken: null })

    return result.affected ? [200, {
        ok: true
    }] : [404, ErrorResponse.WorkerNotFound];
}
