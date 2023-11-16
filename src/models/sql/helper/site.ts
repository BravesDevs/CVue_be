import { getRepository, In } from 'typeorm';
import { Region, Site, SurveyQuestions } from '../';
import { SurveyResult } from '../entities/SurveyResult';
import { config } from '../../../configurations';
import { UserType } from '../../../common';
import { Job } from '../entities/Job';

/**
 * create site
 */

export const addSite: any = async (data) => {
    const siteRepository = getRepository(Site);
    return await siteRepository.save(data);
};

export const getSites: any = async (whereClause) => {
    const siteRepository = getRepository(Site);
    let response = await siteRepository.createQueryBuilder('site')
        .innerJoin('site.region', 'region')
        .leftJoin('site.userSiteAssociations', 'user_site_association')
        .select(['DISTINCT(site.id) AS id', 'site.name AS name', 'site.region_id AS region_id',
            'site.address AS address', 'site.post_code AS post_code', 'site.city AS city',
            'site.country AS country', 'region.name AS region_name',
            'site.created_at AS created_at', 'site.created_by AS created_by',
            'site.updated_at AS updated_at', 'site.updated_by AS updated_by'])
        .where(whereClause)
        .orderBy('site.name', 'ASC')
        .getRawMany();
    return response;
};

export const getSitesForDropdown: any = async (whereClause) => {
    const siteRepository = getRepository(Site);
    let response = await siteRepository.createQueryBuilder('site')
        .select(['site.id AS id', 'site.name AS name'])
        .where(whereClause)
        .orderBy('site.name', 'ASC')
        .getRawMany();
    return response;
};

export const getRegionIdFromSite: any = async (adminId) => {
    const siteRepository = getRepository(Site);
    let response = await siteRepository.createQueryBuilder('site')
        .innerJoin('site.userSiteAssociations', 'user_site_association')
        .select(['site.region_id AS regionId'])
        .where('user_site_association.userId = :adminId', { adminId })
        .getRawMany();
    return response;
};
export const getSitesByNames: any = async (names) => {
    const siteRepository = getRepository(Site);
    return await siteRepository.find(
        {
            where: { name: In(names) },
            select: ['id', 'name']
        }
    );
};
/**
 * get site By Id
 */
export const getSiteById: any = async (id) => {
    const siteRepository = getRepository(Site);
    return await siteRepository.createQueryBuilder("site")
        .innerJoin('site.userSiteAssociations', 'user_site_association')
        .where("site.id = :id", { id })
        .select(['name', 'region_id', 'client_id', 'GROUP_CONCAT(user_site_association.user_id) as site_admins'])
        .getRawOne();
};

/**
 * update site
 */
export const updateSite: any = async (id, body) => {
    const siteRepository = getRepository(Site);
    body.updatedAt = new Date();
    return await siteRepository.update({ id }, body);
};

/**
 * Average Ratings for dashboard.
 */
export const getDashboardRatingsHelper: any = async (whereClause1: string, whereClause2: string, loggedInUser) => {
    let response: any = {};
    let query;

    let averageRatingQuery = await getRepository(SurveyResult).createQueryBuilder('survey_result')
        .innerJoin('survey_result.question', 'survey_question')
        .innerJoin('survey_result.site', 'site')
        .select(['IFNULL(FORMAT(avg(survey_result.rating),1),0.0) as ratings'])
        .where(whereClause1 + " AND " + whereClause2);

    let reviewsCountQuery = await getRepository(SurveyResult).createQueryBuilder('survey_result')
        .innerJoin('survey_result.question', 'survey_question')
        .innerJoin('survey_result.site', 'site')
        .select(['count(distinct(survey_result.survey_id)) as reviews_count'])
        .where(whereClause1 + " AND " + whereClause2)
        .groupBy(`CONCAT(survey_result.worker_id, '|||', survey_result.survey_id, '|||', survey_result.created_at)`);

    // whereClause1 += ` GROUP BY survey_question.label`;

    let labelWiseRatingsQuery = await getRepository(SurveyQuestions).createQueryBuilder('survey_question')
        .leftJoin('survey_question.surveyResults', 'survey_result', whereClause2)
        .leftJoin('survey_result.site', 'site')
        .select(['survey_question.label as label, IFNULL(FORMAT(avg(survey_result.rating),1),0.0) as ratings'])
        .where(whereClause1)
        .groupBy('survey_question.label');

    if (![UserType.CLIENT_ADMIN, UserType.CLIENT_SITE, UserType.CLIENT_REGIONAL].includes(parseInt(loggedInUser.user_type_id))) {
        averageRatingQuery = averageRatingQuery.innerJoin('survey_result.worker', 'worker').andWhere(`worker.type = '${config.TEMPORARY_WORKER}'`);
        reviewsCountQuery = reviewsCountQuery.innerJoin('survey_result.worker', 'worker').andWhere(`worker.type = '${config.TEMPORARY_WORKER}'`);
        labelWiseRatingsQuery = labelWiseRatingsQuery.innerJoin('survey_result.worker', 'worker').andWhere(`worker.type = '${config.TEMPORARY_WORKER}'`)
    }

    response.average_rating = await averageRatingQuery.getRawOne();
    response.reviews_count = await reviewsCountQuery.getRawMany();
    response.label_wise_ratings = await labelWiseRatingsQuery.getRawMany();
    return response;
};

/**
 * Individual site ratings with labels.
 */
export const getSiteRatingsWithLabelHelper: any = async (whereClause: string, type = 'TEMPORARY') => {
    return await getRepository(SurveyResult).createQueryBuilder('survey_result')
        .innerJoin('survey_result.question', 'survey_question')
        .innerJoin('survey_result.site', 'site')
        .innerJoin('survey_result.worker', 'worker')
        .select(['DISTINCT(site.id) as site_id', 'site.name as site_name',
            'COUNT(survey_result.id) as reviews_count',
            'survey_question.label as label', 'IFNULL(FORMAT(avg(survey_result.rating),1),0.0) as ratings'])
        .where(whereClause)
        .andWhere(`worker.type = '${type}'`)
        .groupBy('site.name, survey_question.label')
        .getRawMany()
};

/**
 * Individual site ratings with labels.
 */
export const getAverageSiteRatings: any = async (whereClause: string, type = 'TEMPORARY') => {
    return await getRepository(SurveyResult).createQueryBuilder('survey_result')
        .innerJoin('survey_result.question', 'survey_question')
        .innerJoin('survey_result.site', 'site')
        .innerJoin('survey_result.worker', 'worker')
        .select(['DISTINCT(site.id) as site_id', 'site.name as site_name',
            'IFNULL(FORMAT(avg(survey_result.rating),1),0.0) as ratings'])
        .where(whereClause)
        .andWhere(`worker.type = '${type}'`)
        .groupBy('site.name')
        .getRawMany()
};


/**
 * Individual site reviews count.
 */
export const getSiteWiseReviewsCount: any = async (whereClause: string, type = 'TEMPORARY') => {
    return await getRepository(SurveyResult).createQueryBuilder('survey_result')
        .innerJoin('survey_result.question', 'survey_question')
        .innerJoin('survey_result.worker', 'worker')
        .select([`survey_result.site_id as site_id, count(distinct(CONCAT(survey_result.worker_id, '|||', survey_result.survey_id, '|||', survey_result.created_at))) as reviews_count`])
        .where(whereClause)
        .andWhere(`worker.type = '${type}'`)
        .groupBy(`survey_result.site_id`)
        .getRawMany();
};

/**
 * Average Ratings for dashboard with worker type wise filter.
 */
export const getWorkerTypeWiseDashboardRatingsHelper: any = async (whereClause1: string, whereClause2: string) => {
    let response: any = {};
    response.average_rating = await getRepository(SurveyResult).createQueryBuilder('survey_result')
        .innerJoin('survey_result.question', 'survey_question')
        .innerJoin('survey_result.worker', 'worker')
        .innerJoin('survey_result.site', 'site')
        .select(['IFNULL(FORMAT(avg(survey_result.rating),1),0.0) as ratings', 'worker.type as type'])
        .where(whereClause1 + " AND " + whereClause2)
        .groupBy('worker.type')
        .getRawMany();

    response.reviews_count = await getRepository(SurveyResult).createQueryBuilder('survey_result')
        .innerJoin('survey_result.question', 'survey_question')
        .innerJoin('survey_result.worker', 'worker')
        .innerJoin('survey_result.site', 'site')
        .select(['count(distinct(survey_result.survey_id)) as reviews_count', 'worker.type as type'])
        .where(whereClause1 + " AND " + whereClause2)
        .groupBy(`CONCAT(survey_result.worker_id, '|||', survey_result.survey_id, '|||', survey_result.created_at)`)
        .addGroupBy('worker.type')
        .getRawMany();

    // whereClause1 += ` GROUP BY survey_question.label`;

    response.label_wise_rating = await getRepository(SurveyQuestions).createQueryBuilder('survey_question')
        .leftJoin('survey_question.surveyResults', 'survey_result', whereClause2)
        .innerJoin('survey_result.worker', 'worker')
        .leftJoin('survey_result.site', 'site')
        .select(['survey_question.label as label, IFNULL(FORMAT(avg(survey_result.rating),1),0.0) as ratings', 'worker.type as type'])
        .where(whereClause1)
        .groupBy(`survey_question.label`)
        .addGroupBy('worker.type')
        .getRawMany();
    return response;
};

/**
 * get site names by id
 */
export const getSiteNamesById: any = async (siteIds) => {
    return await getRepository(Site).find(
        {
            where:  `id IN (${siteIds.join(",")})`,
            select: ['id', 'name']
        }
    );
}