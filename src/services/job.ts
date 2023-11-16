/**
 * All the service layer methods for the Department.
 */
const _ = require('lodash');
import { CreateAndUpdateJobDTO, ErrorResponse, RoleType, MessageActions } from "./../common";
import { createJob, updateJob, getJobById, createJobAssociation, deleteJobAssociation, getJobAssociation, jobDropDownListingHelper, 
    jobNameDropDownListingHelper } from "./../models";
import { notifyBugsnag } from '../utils'
import moment from "moment";
const deepClone = require('lodash.clonedeep');
const dashboard = require('../services/dashboard');

/**
 * create job.
 * @param  {CreateAndUpdateJobDTO} payload
 */
export const createJobService = async (payload: CreateAndUpdateJobDTO, loggedInUser) => {
    const jobPayload = {
        name: payload.name,
        type: payload.type,
        shiftId: payload.shiftId,
        hoursPerWeek: payload.hoursPerWeek,
        createdBy: loggedInUser.user_id,
        updatedBy: loggedInUser.user_id,
    }
    let job = await createJob(jobPayload);
    const jobAssociationData = [];
    const createJobAssociationPayload = {
        jobId: job.id,
        clientId: payload.clientId,
        siteId: payload.siteId,
        createdBy: loggedInUser.user_id,
        updatedBy: loggedInUser.user_id,
        createdAt: moment().utc().format(),
        updatedAt: moment().utc().format()
    }
    if (_.size(payload.departmentId)) {
        for (let i = 0; i < payload.departmentId.length; i++) {
            jobAssociationData.push(_.cloneDeep(_.extend(createJobAssociationPayload, { departmentId: payload.departmentId[i] })))
        }
    } else {
        jobAssociationData.push(createJobAssociationPayload);
    }
    await createJobAssociation(jobAssociationData);
    return [201, {
        ok: true,
        message: MessageActions.CREATE_JOB,
        job_id: job.id,
    }];
};

/**
 * update job.
 * @param  {id}
 * @param  {CreateAndUpdateJobDTO} payload
 */
export const updateJobService = async (id: string, payload: CreateAndUpdateJobDTO, loggedInUser) => {
    try {
        let jobToUpdate = await getJobById(id);

        if (!jobToUpdate) {
            return [404, ErrorResponse.ResourceNotFound];
        }
        const jobPayload = {
            name: payload.name,
            type: payload.type,
            shiftId: payload.shiftId,
            hoursPerWeek: payload.hoursPerWeek,
            updatedBy: loggedInUser.user_id,
        }
        let job = await updateJob(id, jobPayload);
        if (payload.departmentId || payload.siteId || payload.clientId) {
            const jobAssociationData = [];
            const createJobAssociationPayload = {
                jobId: id,
                clientId: payload.clientId,
                siteId: payload.siteId,
                createdBy: loggedInUser.user_id,
                updatedBy: loggedInUser.user_id,
                createdAt: moment().utc().format(),
                updatedAt: moment().utc().format()
            }
            if (_.size(payload.departmentId)) {
                for (let i = 0; i < payload.departmentId.length; i++) {
                    jobAssociationData.push(_.cloneDeep(_.extend(createJobAssociationPayload, { departmentId: payload.departmentId[i] })))
                }
            } else {
                jobAssociationData.push(createJobAssociationPayload);
            }
            const del = await deleteJobAssociation({ jobId: id })
            await createJobAssociation(jobAssociationData);
        }
        return [200, {
            ok: true,
            message: MessageActions.UPDATE_JOB,
            job_id: job.id
        }];
    } catch (error) {
        notifyBugsnag(error);
        return [500, error.message]
    }
};

/**
 * get job list.
 */
export const getJobListService = async (data) => {
    let { page, limit, sort_by, sort_type, ...otherArgs } = data;
    let whereClause: string;
    whereClause = dashboard.getPayrollWhereClauseString(deepClone(otherArgs), 1, 'job_association')
    let jobAssociationList = await getJobAssociation(page, limit, whereClause)
    jobAssociationList = _.groupBy(jobAssociationList, 'job_id')
    let resultantArray = [];
    for (let i in Object.keys(jobAssociationList)) {
        let groupedJob = jobAssociationList[Object.keys(jobAssociationList)[i]];
        const jobObject = _.cloneDeep(_.omit(jobAssociationList[Object.keys(jobAssociationList)[i]][0], ['department_id', 'department_name']));
        const department = [];
        for (let j of groupedJob) {
            department.push({ value: j.department_id, label: j.department_name });
        }
        let job_type_id = jobObject.job_type;
        jobObject.job_type = RoleType[jobObject.job_type];
        jobObject['job_type_id'] = job_type_id
        jobObject.department = department;
        resultantArray.push(jobObject);
    }
    return [200, {
        ok: true,
        job_list: resultantArray
    }];
};

/**
 * Service to GET job listing for drop-down.
 */
export const getJobListingForDropDownService = async (site_id) => {
    try {
        let whereClause = `job_association.siteId = ${site_id}`;
        const job_list = await jobDropDownListingHelper(whereClause);
        let jobs = []
        if (job_list) {
            _.map(job_list, (job) => {
                let exisitingObj = _.find(jobs, { id: job.job_id })
                if (exisitingObj) {
                    if (!exisitingObj.name.includes('...')) {
                        exisitingObj.name += `...`
                    }
                } else {
                    jobs.push({ id: job.job_id, name: `${job.job_name} - ${job.shift_name} - ${RoleType[job.job_type]} - ${job.department_name}` })
                }
            })
        }
        return [200, { ok: true, job_list: jobs }]
    } catch (err) {
        notifyBugsnag(err);
        return [500, err.message]
    }
}

/**
 * Service to GET the job names for drop-down.
 */
export const getJobNameListingForDropDownService = async (site_id) => {
    try {
        let whereClause = `job_association.siteId = ${site_id}`;
        let job_list = await jobNameDropDownListingHelper(whereClause) || [];

        //Remove duplicate jobs
        job_list = Object.values(job_list.reduce((acc, cur) => Object.assign(acc, { [cur.name]: cur }), {}))
        return [200, { ok: true, job_list }]
    } catch (err) {
        notifyBugsnag(err);
        return [500, err.message]
    }
}