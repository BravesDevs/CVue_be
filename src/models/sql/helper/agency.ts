import { getRepository, getConnection } from 'typeorm';
import { AgencyClientAssociation, AgencyDetails, SurveyQuestions, SurveyResult, User, UserSiteAssociation, Region } from '../';
import { UserType, databaseSeparator, clientDetails } from '../../../common';
import { config } from '../../../configurations';

/**
 * create agency
 */
export const createAgency: any = async (body) => {
    const agencyRepository = getRepository(AgencyDetails);
    return await agencyRepository.save(body);
};

/**
 * update agency
 */
export const updateAgency: any = async (id, body) => {
    const agencyRepository = getRepository(AgencyDetails);
    body.updatedAt = new Date();
    return await agencyRepository.update({ id }, body);
};

/**
 * get agency list
 */
export const getAgencyList: any = async (loggedInUser, page, limit, sortBy, sortType) => {
    let response: any;
    //Get all the client details associated with the agency.
    if ((parseInt(loggedInUser.user_type_id) === UserType.CLIENT_ADMIN) ||
        (parseInt(loggedInUser.user_type_id) === UserType.CLIENT_SITE) ||
        (parseInt(loggedInUser.user_type_id) === UserType.CLIENT_REGIONAL)) {

        let userRepository = getRepository(User);
        let data = await userRepository.createQueryBuilder("user").select(["user.client_id as client_id"]).where({ id: parseInt(loggedInUser.user_id) }).getRawOne();
        const clientid = parseInt(data.client_id);
        const agencyclientAssocRepository = getRepository(AgencyClientAssociation);
        response = await agencyclientAssocRepository.createQueryBuilder("agency_client_association")
            .leftJoin("agency_client_association.agency", "agency_details")
            .select([
                "agency_client_association.id as association_id",
                "agency_details.id as agency_id",
                "agency_details.name as agency_name",
                "agency_details.address as address",
                "agency_details.post_code as post_code",
                "agency_details.city as city",
                "agency_details.country as country",
                "agency_details.created_at as created_at",
            ]).where({ clientId: clientid })
            .orderBy(sortBy, sortType)
            .addOrderBy('agency_client_association.id', sortType.toUpperCase())
            .offset((page - 1) * limit)
            .limit(limit)
            .execute()
        response["count"] = await agencyclientAssocRepository.count({ where: { clientId: clientid } })
        return response;

    }
    // //Get all the agencies.
    else {
        const agencyDetailsRepository = getRepository(AgencyDetails);
        response = await agencyDetailsRepository.createQueryBuilder("agency_details")
            .select([
                "agency_details.id as agency_id",
                "agency_details.name as agency_name",
                "agency_details.address as address",
                "agency_details.post_code as post_code",
                "agency_details.city as city",
                "agency_details.country as country",
                "agency_details.created_at as created_at"
            ])
            .orderBy(sortBy, sortType)
            .addOrderBy('agency_details.id', sortType.toUpperCase())
            .offset((page - 1) * limit)
            .limit(limit)
            .execute();
        response["count"] = await agencyDetailsRepository.count()
        return response;
    }
};

/**
 * get agency By Id
 */
export const getAgencyById: any = async (id, isCountRequired = true) => {
    const agencyRepository = getRepository(AgencyDetails);
    let response = await agencyRepository.createQueryBuilder("agency_details")
        .where("agency_details.id = :id", { id })
        .select(['id', 'name', 'address', 'country', 'city', 'post_code', 'resource'])
        .getRawOne();

    response["count"] = isCountRequired ? agencyRepository.count() : null;

    return response;
};


/**
 * Get associated agencies (name + id)
 */
export const getAssociatedAgenciesList: any = async (requestArgs: object, whereClauseString: string) => {

    let innerJoinString: string = "INNER JOIN agency_details ON agency_client_association.agency_id = agency_details.id ";

    if (requestArgs.hasOwnProperty('site_id')) {
        innerJoinString += " INNER JOIN site ON agency_client_association.client_id = site.client_id ";
    }
    if (requestArgs.hasOwnProperty('region_id')) {
        innerJoinString += " INNER JOIN region ON agency_client_association.client_id = region.client_id ";
    }
    if (requestArgs.hasOwnProperty('department_id')) {
        innerJoinString += " INNER JOIN departments ON agency_client_association.client_id = departments.client_id ";
    }
    if (requestArgs.hasOwnProperty('shift_id')) {
        innerJoinString += " INNER JOIN shift ON agency_client_association.client_id = shift.client_id ";
    }

    let response = await getConnection().query(`
        SELECT DISTINCT agency_details.id AS agency_detail_id, agency_details.name AS agency_name, CONCAT(agency_details.id , '${databaseSeparator}' , agency_details.name) 
            AS agency_detail
        FROM agency_client_association
            ${innerJoinString}
        WHERE ${whereClauseString}
        ORDER BY agency_detail_id
    `);

    return response;
};


export const getDashboardAgencyRatingsHelper: any = async (whereClause1: string, whereClause2: string) => {
    let response: any = {};
    response.average_rating = await getRepository(SurveyResult).createQueryBuilder('survey_result')
        .innerJoin('survey_result.question', 'survey_question')
        .innerJoin('survey_result.worker', 'worker')
        .select(['IFNULL(FORMAT(avg(survey_result.rating),1),0.0) as ratings'])
        .where(whereClause1 + " AND " + whereClause2)
        .andWhere(`worker.type = '${config.TEMPORARY_WORKER}'`)
        .getRawOne();

    response.reviews_count = await getRepository(SurveyResult).createQueryBuilder('survey_result')
        .innerJoin('survey_result.question', 'survey_question')
        .innerJoin('survey_result.worker', 'worker')
        .select(['count(distinct(survey_result.survey_id)) as reviews_count'])
        .where(whereClause1 + " AND " + whereClause2)
        .andWhere(`worker.type = '${config.TEMPORARY_WORKER}'`)
        .groupBy(`CONCAT(survey_result.worker_id, '|||', survey_result.survey_id, '|||', survey_result.created_at)`)
        .getRawMany();

    // whereClause1 += ` GROUP BY survey_question.label`;

    response.label_wise_ratings = await getRepository(SurveyQuestions).createQueryBuilder('survey_question')
        .leftJoin('survey_question.surveyResults', 'survey_result', whereClause2)
        .innerJoin('survey_result.worker', 'worker')
        .select(['survey_question.label as label, IFNULL(FORMAT(avg(survey_result.rating),1),0.0) as ratings'])
        .where(`worker.type = '${config.TEMPORARY_WORKER}'`)
        .andWhere(whereClause1)
        .groupBy(`survey_question.label`)
        .getRawMany();

    return response;
};


/**
 * Individual site ratings with labels.
 */
export const getAgencyRatingsWithLabelHelper: any = async (whereClause: string) => {
    return await getRepository(SurveyResult).createQueryBuilder('survey_result')
        .innerJoin('survey_result.question', 'survey_question')
        .innerJoin('survey_result.agency', 'agency')
        .select(['DISTINCT(agency.id) as agency_id', 'agency.name as agency_name',
            'count(distinct(survey_result.survey_id)) as reviews_count',
            'survey_question.label as label', 'IFNULL(FORMAT(avg(survey_result.rating),1),0.0) as ratings'])
        .where(whereClause)
        .groupBy('agency.name, survey_question.label')
        .getRawMany()
};


/**
 * Individual site ratings with labels.
 */
export const getAverageAgencyRatings: any = async (whereClause: string) => {
    return await getRepository(SurveyResult).createQueryBuilder('survey_result')
        .innerJoin('survey_result.question', 'survey_question')
        .innerJoin('survey_result.agency', 'agency')
        .select(['DISTINCT(agency.id) as agency_id', 'agency.name as agency_name',
            'IFNULL(FORMAT(avg(survey_result.rating),1),0.0) as ratings'])
        .where(whereClause)
        .groupBy('agency.name')
        .getRawMany()
};

/**
 * Individual agency ratings with labels.
 */
export const getAgencyWiseReviewsCount: any = async (whereClause: string) => {
    return await getRepository(SurveyResult).createQueryBuilder('survey_result')
        .innerJoin('survey_result.question', 'survey_question')
        .select([`survey_result.agency_id as agency_id, count(distinct(CONCAT(survey_result.worker_id, '|||', survey_result.survey_id, '|||', survey_result.created_at))) as reviews_count`])
        .where(whereClause)
        .groupBy('survey_result.agency_id')
        .getRawMany();
};

/**
 * Add agency site admin
 * @param  {} payload
 * @param  {} loggedInUser
 */
export const addAgencySiteUser: any = async (payload, loggedInUser) => {
    const userRepository = await getRepository(User).findOne({ select: ['agencyId'], where: { id: loggedInUser.user_id } });
    const agencyRepository = await getRepository(AgencyDetails).findOne({ select: ['name'], where: { id: userRepository.agencyId } });
    const agencyId = userRepository.agencyId;
    let obj = {
        "userTypeId": payload.client_role,
        "agencyId": agencyId,
        "clientId": payload.client_id,
        "name": payload.name,
        "email": payload.email,
        "mobile": payload.phone,
        "countryCode": payload.country_code
    }
    let response = await getRepository(User).insert(obj);
    response.generatedMaps[0]['company_name'] = agencyRepository.name;
    let agency_user_id = response.generatedMaps[0].id;
    await getRepository(UserSiteAssociation).insert({ userId: agency_user_id, siteId: payload.id, createdBy: loggedInUser.user_id, updatedBy: loggedInUser.user_id })
    return response.generatedMaps[0]
}


/**
 * Add agency regional admin
 * @param  {} payload
 * @param  {} loggedInUser
 */
export const addAgencyRegionUser: any = async (payload, loggedInUser) => {
    const userRepository = await getRepository(User).findOne({ select: ['agencyId'], where: { id: loggedInUser.user_id } });
    const agencyRepository = await getRepository(AgencyDetails).findOne({ select: ['name'], where: { id: userRepository.agencyId } });
    const agencyId = userRepository.agencyId;
    let obj = {
        "userTypeId": payload.client_role,
        "agencyId": agencyId,
        "name": payload.name,
        "clientId": payload.client_id,
        "email": payload.email,
        "mobile": payload.phone,
        "countryCode": payload.country_code
    }
    let response = await getRepository(User).insert(obj);
    response.generatedMaps[0]['company_name'] = agencyRepository.name;
    let agency_user_id = response.generatedMaps[0].id;
    await getRepository(Region).update(payload.id, { agencyRegionAdminId: agency_user_id })
    return response.generatedMaps[0]
}

export const updateAgencyUserHelper: any = async (agency_user_id, payload) => {
    return await getRepository(User).update(agency_user_id, payload);
}

export const getAgencyUsersByIDHelper: any = async (whereClause) => {
    const userRepository1 = getRepository(User);
    let response = await userRepository1.createQueryBuilder('user')
        .innerJoin('user.userType_2', 'user_type')
        .innerJoin('user.agency', 'agency_details')
        .leftJoin('user.region2', 'region')
        .leftJoin('user.userSiteAssociations', 'user_site_association')
        .leftJoin('user_site_association.site', 'site')
        .select(['user.id as id',
            'user.name as user_name',
            'user.user_type_id as user_type_id',
            'user_type.type as user_type',
            'user_type.name as user_type_name',
            'user.name as name',
            'user.email as email',
            'agency_details.name as agency_name',
            'CASE WHEN user.password is null THEN 0 ELSE 1 END as is_able_access',
            'user.country_code as country_code',
            "IFNULL(user.mobile,'') as mobile",
            'site.id as site_id',
            'site.name as site_name',
            'region.id as region_id',
            'region.name as region_name'
        ])
        .where(whereClause)
        .getRawOne();
    return response;
}
