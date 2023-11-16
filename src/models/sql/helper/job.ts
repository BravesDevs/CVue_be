import { getRepository } from 'typeorm';
import { Job } from '../';

/**
 * create job
 */
export const createJob: any = async (body) => {
    const jobRepository = getRepository(Job);
    return await jobRepository.save(body);
};

/**
 * update job
 */
export const updateJob: any = async (id, body) => {
    const jobRepository = getRepository(Job);
    body.updatedAt = new Date();
    return await jobRepository.update({id}, body);
};

/**
 * get job list
 */
export const getJobList: any = async (page, limit, siteId) => {
    const jobRepository = getRepository(Job);
    return await jobRepository.createQueryBuilder("job")
    .skip((page -1) * limit)
    .take(limit)
    .select(['id', 'name', 'client_id', 'rate_card_id', 'type', 'shift', 'hours_per_week'])
    .getRawMany();
};


/**
 * get job By Id
 */
export const getJobById: any = async (id) => {
    const jobRepository = getRepository(Job);
    return await jobRepository.createQueryBuilder("job")
    .where("job.id = :id", { id })
        .select(['id'])
        .getRawOne();
};

/**
 * get job names
 */
 export const getJobNames: any = async (jobIds) => {
    return await getRepository(Job).find(
        {
            where: `id IN (${jobIds.join(",")})`,
            select: ['id', 'name']
        }
    );
};