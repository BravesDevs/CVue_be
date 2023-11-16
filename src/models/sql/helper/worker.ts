import { getManager, getRepository, In, getConnection } from 'typeorm';
import { JobAssociation } from '../';
import { AddWorkerDTO, WorkerTypes, UserType } from '../../../common';
import { User } from '../entities/User';
import { Workers } from '../entities/Workers';
import { WorkerTraining } from '../entities/WorkerTraining';
import { config } from '../../../configurations';


/**
 * Method to add new worker
 * @param  {AddWorkerDTO} data
 * @param {number} userId
 */
export const addNewWorker: any = async (data: AddWorkerDTO, userId, loggedInUserId) => {
    const workersRepository = getRepository(Workers);

    let payload = {
        firstName: data.first_name,
        lastName: data.last_name,
        userId: userId,
        postCode: data.post_code,
        payrollRef: data.payroll_ref,
        employeeId: data.employee_id,
        dateOfBirth: data.date_of_birth,
        jobId: data.job_id,
        mobile: data.mobile,
        countryCode: data.country_code,
        nationalInsuranceNumber: data.national_insurance_number,
        nationality: data.nationality,
        orientation: data.orientation,
        startDate: data.start_date,
        clientId: data.client_id || null,
        agencyId: data.agency_id || null,
        createdBy: String(loggedInUserId),
        updatedBy: String(loggedInUserId),
        isActive: data.is_active,
        type: data.type || WorkerTypes.TEMPORARY
    };

    let response = await workersRepository.insert(payload);
    return response.generatedMaps[0];
};

export const addNewWorkers: any = async (data) => {
    const workersRepository = getRepository(Workers);
    let response = await workersRepository.insert(data);
    return response.identifiers;
};


export const updateWorkers: any = async (data) => {
    if (data.client_id) {
        const workersRepository = getRepository(Workers);
        return await workersRepository.update(data.workers, { clientId: data.client_id });
    } else if (data.agency_id) {
        const workersRepository = getRepository(Workers);
        return await workersRepository.update(data.workers, { agencyId: data.agency_id });
    } else if (data.job_id) {
        const workersRepository = getRepository(Workers);
        return await workersRepository.update(data.workers, { jobId: data.job_id });
    } else if (data.hasOwnProperty('is_active') && data.is_active !== null) {
        let dataToUpdate = {}
        if (data.is_active === 0 || data.is_active === false) {
            dataToUpdate = { isActive: data.is_active, inActivedAt: new Date() }
        } else {
            dataToUpdate = { isActive: data.is_active, inActivedAt: null }
        }
        const workersRepository = getRepository(Workers);
        return await workersRepository.update(data.workers, dataToUpdate);
    }
}

export const updateWorkerDetail: any = async (id, data) => {
    const workersRepository = getRepository(Workers);
    return await workersRepository.update(id, data);
}

export const getWorkers: any = async (whereClause, page, limit, sortBy, sortType) => {
    const workersRepository = getRepository(Workers);

    let response = await workersRepository.createQueryBuilder('workers')
        .innerJoin('workers.job', 'job')
        .leftJoin('workers.agency', 'agency')
        .leftJoin('workers.client', 'client')
        .innerJoin('workers.user', 'user')
        .leftJoin('job.jobAssociations', 'job_association')
        .select([
            'DISTINCT workers.id as id',
            'workers.first_name as first_name',
            'workers.last_name as last_name',
            'user.email as email',
            // 'workers.country_code as country_code',
            // 'workers.mobile as mobile',
            'workers.type as type',
            'workers.national_insurance_number as national_insurance_number',
            'workers.payroll_ref as payroll_ref',
            'workers.employee_id as employee_id',
            "date_format(workers.date_of_birth,'%Y-%m-%d') as date_of_birth",
            'workers.post_code as post_code',
            "date_format(workers.start_date,'%Y-%m-%d') as start_date",
            'workers.nationality as nationality',
            'workers.orientation as orientation',
            'workers.agency_id as agency_id',
            `IFNULL(agency.name, '') as agency_name`,
            'workers.client_id as client_id',
            `IFNULL(client.name, '') as client_name`,
            'workers.job_id as job_id',
            'IF(workers.device_token IS NOT NULL, 1, 0) is_app_downloaded',
            'workers.is_active as is_active',
            "date_format(workers.in_actived_at,'%Y-%m-%d') as in_actived_at",
            "date_format(workers.created_at,'%Y-%m-%d') as created_at"
        ])
        .where(whereClause)
        .orderBy(sortBy, sortType)
        .addOrderBy('workers.id', sortType.toUpperCase())
        .offset((page - 1) * limit)
        .limit(limit)
        .execute()

    let responseCount = await workersRepository.createQueryBuilder('workers')
        .innerJoin('workers.job', 'job')
        .innerJoin('workers.user', 'user')
        .leftJoin('job.jobAssociations', 'job_association').select(['DISTINCT workers.id as id']).where(whereClause).execute()
    response["count"] = responseCount.length;

    return response;
}
export const getWorkersWithoutPagination: any = async (whereClause) => {
    const workersRepository = getRepository(Workers);

    let response = await workersRepository.createQueryBuilder('workers')
        .innerJoin('workers.job', 'job')
        .leftJoin('job.jobAssociations', 'job_association')
        .select([
            'DISTINCT workers.id as id',
            'CONCAT(workers.first_name, " ", workers.last_name, " - ", IFNULL(workers.employee_id, "")) as display_name'
        ])
        .where(whereClause)
        .orderBy("first_name", "ASC")
        .execute()

    let responseCount = await workersRepository.createQueryBuilder('workers')
        .innerJoin('workers.job', 'job')
        .leftJoin('job.jobAssociations', 'job_association').select(['DISTINCT workers.id as id']).where(whereClause).execute()
    response["count"] = responseCount.length;

    return response;
}

export const getWorkerByNationalInsuranceNumber: any = async (nationalInsuranceNumber) => {
    const workersRepository = getRepository(Workers);
    return await workersRepository.find(
        {
            where: { nationalInsuranceNumber: In(nationalInsuranceNumber) },
            select: ['id', 'nationalInsuranceNumber']
        }
    );
}

export const getWorkerByEmployeeIdAndAgencyId: any = async (employeeIds, agencyId, payrollRefs) => {

    let employeeIdArray = [];
    let payrollRefArray = [];

    employeeIds.forEach((element) => {
        employeeIdArray.push(JSON.stringify(element))
    });

    payrollRefs.forEach((element) => {
        payrollRefArray.push(JSON.stringify(element))
    });

    let whereClauseString = employeeIds.length || payrollRefs.length ? (
        employeeIds.length && payrollRefs.length ? `(workers.employeeId IN (${employeeIdArray}) OR workers.payrollRef IN (${payrollRefArray})) ` : employeeIds.length ? `workers.employeeId IN (${employeeIds})` : `workers.payrollRef IN (${payrollRefArray})`) : "";
    const workersRepository = getRepository(Workers);

    return await workersRepository.createQueryBuilder('workers')
        .innerJoin('workers.job', 'job')
        .leftJoin('job.jobAssociations', 'job_association')
        .select([
            'workers.id as id',
            'workers.employeeId as employee_id',
            'workers.payrollRef as payroll_ref',
            'workers.agencyId as agency_id',
            'workers.first_name as first_name',
            'workers.last_name as last_name',
            'workers.start_date as start_date',
            'workers.date_of_birth as dob',
            'job.shiftId as shift_id',
            'job_association.departmentId as department_id'
        ])
        .where(`workers.agencyId = (${agencyId}) ${whereClauseString ? " AND " + whereClauseString : ""}`)
        .execute()
}


export const getWorkerByWorkerId: any = async (id) => {
    const workersRepository = getRepository(Workers);
    return await workersRepository.findOne(
        {
            where: { id: id }
        }
    );
}


export const getWorkerDetailsHelper: any = async (whereClause) => {
    return await getRepository(Workers).createQueryBuilder('workers')
        .leftJoin('workers.agency', 'agency_details')
        .innerJoin('workers.client', 'client_details')
        .innerJoin('workers.user', 'user')
        .leftJoin('workers.job', 'job')
        .innerJoin('job.shift', 'shift')
        .innerJoin('job.jobAssociations', 'job_assoc')
        .innerJoin('job_assoc.site', 'site')
        .innerJoin('job_assoc.department', 'department')
        .select([
            'workers.id as id',
            'workers.first_name as first_name',
            'workers.last_name as last_name',
            'user.id as user_id',
            'user.email as email',
            'user.documents as documents',
            // 'workers.country_code as country_code',
            // 'workers.mobile as mobile',
            'workers.type as type',
            'workers.national_insurance_number as national_insurance_number',
            'workers.payroll_ref as payroll_ref',
            'workers.employee_id as employee_id',
            "date_format(workers.date_of_birth,'%Y-%m-%d') as date_of_birth",
            'workers.post_code as post_code',
            "date_format(workers.start_date,'%Y-%m-%d') as start_date",
            'workers.nationality as nationality',
            'workers.orientation as orientation',
            'workers.agency_id as agency_id',
            'agency_details.name as agency_name',
            'workers.client_id as client_id',
            'client_details.name as client_name',
            'workers.job_id as job_id',
            'job.name as job_name',
            'job.type as job_type',
            'department.name as department_name',
            'shift.name as shift_name',
            "job_assoc.site_id as site_id",
            "site.name as site_name",
            'workers.is_active as is_active',
            "IFNULL(date_format(workers.in_actived_at,'%Y-%m-%d'),'') as in_actived_at",
            "IFNULL(date_format(workers.created_at,'%Y-%m-%d'),'') as created_at"
        ])
        .where(whereClause)
        .getRawOne()
}

export const getWorkerHelper: any = async (whereClause) => {
    let workersRepository = getRepository(Workers);
    return await workersRepository.createQueryBuilder('workers')
        .innerJoin('workers.user', 'user')
        .select([
            'workers.id as id',
            'workers.first_name as first_name',
            'workers.last_name as last_name',
            'workers.type as worker_type',
            'user.id as user_id',
            'user.email as email',
            'user.password as password',
            'workers.country_code as country_code',
            'workers.mobile as mobile',
            'user.national_insurance_number as national_insurance_number',
            'workers.payroll_ref as payroll_ref',
            'workers.employee_id as employee_id',
            "date_format(workers.date_of_birth,'%Y-%m-%d') as date_of_birth",
            'workers.post_code as post_code',
            "date_format(workers.start_date,'%Y-%m-%d') as start_date",
            'workers.nationality as nationality',
            'workers.orientation as orientation',
            'workers.agency_id as agency_id',
            'workers.client_id as client_id',
            'workers.job_id as job_id',
            'workers.is_active as is_active',
            "date_format(workers.in_actived_at,'%Y-%m-%d') as in_actived_at",
            "date_format(workers.created_at,'%Y-%m-%d') as created_at"
        ])
        .where(whereClause)
        .getRawOne()

}

export const updateWorkerHelper: any = async (user_id, details) => {
    let workers = await getRepository(Workers).find({
        select: ['id'], where: { userId: user_id }
    })
    let workerId = workers.map(element => {
        return element.id
    })
    return await getRepository(Workers).update(workerId, details)
}

export const bulkUpdateUserId: any = async (whereClause, nationalInsuranceNumber) => {
    return await getRepository(Workers).query(`
    UPDATE workers set user_id = CASE ${whereClause} END where national_insurance_number in (${nationalInsuranceNumber})
    `)
}

export const getWorkerByFirstNameAndInsuranceNumber: any = async (data) => {
    return await getRepository(Workers).createQueryBuilder('workers')
        .leftJoin('workers.user', 'user')
        .select(['user.password as password', 'workers.user_id as id'])
        .where(`workers.first_name = '${data.first_name}'`)
        .andWhere(`workers.national_insurance_number = '${data.national_insurance_number}'`)
        .getRawOne()
}

export const getWorkersAsPerSelectedGroups = async (
    siteId: number, clientId: number, agencyId: number, shiftIds = [], jobIds = [], departmentIds = [], nationalityList = [], workerType = null
) => {

    let whereCondition = "workers.is_active = 1";
    whereCondition += workerType ? ` AND workers.type = '${workerType}'` : "";
    whereCondition += shiftIds.length ? ` AND job.shift_id IN (${shiftIds.join(",")}) ` : "";
    whereCondition += jobIds.length ? ` AND job.id IN (${jobIds.join(",")})` : "";
    whereCondition += ` AND job_association.site_id = ${siteId}`;
    whereCondition += ` AND workers.clientId = ${clientId}`;
    whereCondition += agencyId ? ` AND workers.agency_id = ${agencyId}` : "";
    whereCondition += departmentIds.length ? ` AND department_id IN (${departmentIds.join(",")})` : "";

    if (nationalityList.length) {
        let str = []
        nationalityList.forEach((element) => {
            str.push(JSON.stringify(element))
        })
        whereCondition += nationalityList.length ? ` AND workers.nationality IN (${str}) ` : "";
    }

    return getRepository(Workers).createQueryBuilder('workers')
        .innerJoin('workers.job', 'job')
        .innerJoin("job.jobAssociations", "job_association")
        .select('DISTINCT workers.id as worker_id')
        .where(whereCondition)
        .getRawMany();
}

export const getWorkerIdfromUserId: any = async (where) => {
    return await getRepository(Workers).find({ select: ['id'], where });
}

export const getWorkerLengthOfServiceByWorkerId: any = async (id) => {
    return await getRepository(Workers).createQueryBuilder("worker")
        .select(["worker.start_date as start_date", "IFNULL(worker.in_actived_at, CURRENT_TIMESTAMP()) as end_date"])
        .where({ id })
        .getRawOne()
}

export const getWorkerStartDateById: any = async (id) => {
    return await getRepository(Workers).createQueryBuilder('workers')
        .select(['start_date', 'is_active', 'type'])
        .where(`workers.id = '${id}'`)
        .getRawOne()
}


/**
 * update worker profile by userID
 */
export const updateWorkerProfile: any = async (id, data) => {
    data.updatedAt = new Date();
    return await getRepository(User).update({ id }, data)
};

export const getWorkerTrainingData: any = async (whereClause) => {
    return await getRepository(WorkerTraining).createQueryBuilder("training")
        .innerJoin("training.message", "message")
        .select([
            'training.id as training_id',
            'training.message_id as message_id',
            'message.name as message_name',
            `IFNULL(training.training_completed_at,'') as training_completed_at`
        ])
        .where(whereClause)
        .getRawMany()
}

/**
 * get list of worker groups by clientId and siteId
 */
export const getAllWorkerGroup: any = async (data) => {
    return await getRepository(JobAssociation).createQueryBuilder('job_association')
        .innerJoin('job_association.job', 'job')
        .leftJoin('job.shift', 'shift')
        .innerJoin('job_association.department', 'department')
        .select(['job.id AS job_id', 'job.name AS job_name',
            'shift.id AS shift_id', 'shift.name AS shift_name',
            'department.id AS department_id', 'department.name AS department_name'])
        .where(`job_association.clientId = '${data.client_id}'`)
        .andWhere(`job_association.siteId = '${data.site_id}'`)
        .getRawMany();
}


/**
 * @param  {} userId
 */
export const getWorkerAppreciationDataFromUserIdHelper: any = async (userId, agencyId) => {
    return getRepository(Workers).find({ select: ['appreciation'], where: agencyId ? { userId, agencyId } : { userId } })
}

export const getWorkerIdFromUserIdAndAgencyId: any = async (userId, agencyId) => {
    return await getRepository(Workers).find({ select: ['id'], where: { userId, agencyId } });
}


export const getWorkerDeviceTokens: any = async (workerIds: Array<number>) => {
    return getRepository(Workers).find({
        select: ['id', 'deviceToken'],
        where: { id: In(workerIds) }
    })
}

export const trackWorkerTrainingHelper: any = async (updateClause, messageId, loggedInUser) => {
    const entityManager = getManager();

    return await entityManager.query(`
    UPDATE worker_training as wt inner join 
    workers as wk on wt.worker_id = wk.id  
    ${updateClause}
    where wt.message_id =${messageId} AND wk.user_id = ${loggedInUser.user_id};
    `)
}

export const getWorkerByUserIdAndMessageId: any = async (user_id, message_id) => {
    return await getRepository(WorkerTraining).createQueryBuilder('worker_training')
        .innerJoin('worker_training.worker', 'worker')
        .select(['worker.id as worker_id', 'worker.first_name as first_name', 'worker.last_name as last_name', `IFNULL(worker.agency_id,'') as agency_id`,
            `IFNULL(worker.client_id,'') as client_id`, `IFNULL(worker.job_id,'') as job_id`])
        .where(`worker.user_id =${user_id} AND worker_training.message_id =${message_id}`)
        .getRawOne()
}

export const getWorkerDetailsByMessageIdAndUserId: any = async (message_id, user_id) => {
    return await getRepository(WorkerTraining).createQueryBuilder('worker_training')
        .innerJoin('worker_training.message', 'message')
        .innerJoin('worker_training.worker', 'worker')
        .select(['message.name as training_name', 'worker.agency_id as agency_id', 'worker.id as worker_id', 'worker.first_name as first_name', 'worker.last_name as last_name'])
        .where(`worker_training.message_id=${message_id} and worker.user_id =${user_id}`)
        .getRawOne()
}


export const getDetailsWorkerId: any = async (workerId) => {
    return await getRepository(Workers).createQueryBuilder('worker')
        .leftJoin('worker.job', 'job')
        .leftJoin('job.jobAssociations', 'job_association')
        .select([`IFNULL(worker.client_id,'') as client_id`,
            `IFNULL(worker.agency_id,'') as agency_id`, `IFNULL(job_association.site_id,'') as site_id`])
        .where(`worker.id=${workerId}`)
        .getRawOne()
}


/**
 * Inactivate workers
 * @param  {Array<number>} workerIds
 */
export const inactivateWorkers: any = async (workerIds: Array<number>) => {
    return getConnection().createQueryBuilder()
        .update('workers')
        .set({
            isActive: 0,
            inActivedAt: new Date(),
            updatedBy: config.DEFAULT_SYSTEM_USER_ID,
            updatedAt: new Date()
        })
        .where({ id: In(workerIds) })
        .execute();
}

export const getWorkersByNationalInsuranceNumber: any = async (nationalInsuranceNumber) => {
    return await getRepository(Workers).find({
        select: ['id'], where: {
            nationalInsuranceNumber
        }
    })
}

export const updateWorkerNationalInsuranceNumber: any = async (id, nationalInsuranceNumber) => {
    return await getRepository(Workers).update(id, { nationalInsuranceNumber })
}

export const getExistingNationalInsuranceWithAgency: any = async (nationalInsuranceNumber, agencyId) => {
    return await getRepository(Workers).find(
        {
            select: ['nationalInsuranceNumber'],
            where: {
                nationalInsuranceNumber: In(nationalInsuranceNumber),
                agencyId
            }
        })
}

export const getExistingEmployeeIdWithAgency: any = async (employeeIds, agencyId) => {
    return await getRepository(Workers).find(
        {
            select: ['employeeId'],
            where: {
                employeeId: In(employeeIds),
                agencyId
            }
        })
}

/**
 * Get nationality of workers
 * @param  {string} whereClause
 */
export const getNationalityOfWorkers: any = async (whereClause: string, workerType) => {
    whereClause += workerType ? ` AND workers.type = ${workerType}` : "";

    return getRepository(Workers).createQueryBuilder("workers")
        .innerJoin('workers.job', 'job')
        .leftJoin('job.jobAssociations', 'job_association')
        .select('DISTINCT(nationality) AS nationality')
        .orderBy('nationality')
        .where(whereClause)
        .getRawMany();
}


export const getCompletedTrainingCount: any = async (workerIds: Array<number>) => {

    return getRepository(WorkerTraining).count({
        where: {
            workerId: In(workerIds),
            isTrainingCompleted: 1
        }
    });
}

export const getWorkerIdfromUserIdWithLimit: any = async (userId) => {
    return await getRepository(Workers).createQueryBuilder("workers")
        .select(['id', 'type'])
        .orderBy("id", "DESC")
        .where(`workers.user_id = '${userId}'`)
        .limit(1)
        .getRawOne();
}

export const getClientUserIdFromWorkerUserIdWithLimit: any = async (userId) => {
    return await getRepository(User).createQueryBuilder("user")
        .innerJoin('user.client', 'clientDetails')
        .innerJoin('clientDetails.workers', 'workers')
        .select('user.id')
        .orderBy("workers.client_id", "DESC")
        .where(`workers.user_id = '${userId}' AND user.user_type_id = '${UserType.CLIENT_ADMIN}'`)
        .limit(1)
        .getRawOne();
};

export const getAgencyUserIdFromWorkerUserIdWithLimit: any = async (userId) => {
    return await getRepository(User).createQueryBuilder("user")
        .innerJoin('user.agency', 'agencyDetails')
        .innerJoin('agencyDetails.workers', 'workers')
        .select('user.id')
        .orderBy("workers.agency_id", "DESC")
        .where(`workers.user_id = '${userId}' AND user.user_type_id = '${UserType.AGENCY_ADMIN}'`)
        .limit(1)
        .getRawOne();
};

/**
 * Get worker name as per worker ids
 * @param  {} workerIds
 */
export const getWorkerNamesByIds: any = async (workerIds) => {
    return getRepository(Workers).createQueryBuilder("worker")
        .innerJoin('worker.user', 'user')
        .select(['user.name', 'worker.id AS id'])
        .where(`worker.id IN (${workerIds.join(",")})`)
        .getRawMany();
}
