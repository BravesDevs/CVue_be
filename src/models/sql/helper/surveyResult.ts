import { getRepository } from 'typeorm';
import { SurveyResult } from '..';
import { addTrendsAnalysisRegion } from '../../../utils';
import { config } from '../../../configurations';

export const addNewSurvey: any = async (data) => {
    const surveyRepository = getRepository(SurveyResult);
    let response = await surveyRepository.insert(data);
    return response.identifiers;
}

export const getSurveyAnalysis: any = async (whereClause) => {
    return getRepository(SurveyResult).createQueryBuilder("survey_result")
        .innerJoin("survey_result.question", "question")
        .innerJoin("survey_result.worker", "worker")
        .innerJoin("survey_result.site", "site")
        .leftJoin("survey_result.surveyAnswers", "answer")
        .select(`question.id AS question_id`)
        .addSelect(`question.questionText AS question_text`)
        .addSelect(`question.optionType AS option_type`)
        .addSelect(`question.label AS label`)
        .addSelect("IFNULL(survey_result.rating, answer.answer) AS name")
        .addSelect(`COUNT(IFNULL(survey_result.rating, answer.answer)) AS value`)
        .groupBy(`question_text`)
        .addGroupBy(`question_id`)
        .addGroupBy(`name`)
        .where(whereClause)
        .getRawMany();
}

export const downloadSurveyAnalysis: any = async (whereClause) => {
    const surveyRepository = getRepository(SurveyResult);
    let response = await surveyRepository.createQueryBuilder("survey_result")
        .innerJoin("survey_result.worker", "worker")
        .leftJoin("survey_result.surveyAnswers", "answer")
        .leftJoin('worker.job', 'job')
        .leftJoin('job.shift', 'shift')
        .leftJoin('job.jobAssociations', 'job_association')
        .leftJoin('job_association.site', 'site')
        .leftJoin('job_association.department', 'department')
        .select([
            'survey_result.id as id',
            'department.name as department_name',
            'site.name as site_name',
            'shift.name as shift_name',
            'worker.id as worker_id',
            'worker.firstName as worker_first_name',
            'worker.lastName as worker_last_name',
            'worker.employee_id as worker_employee_id',
            'job.name as worker_role',
            'survey_result.question_id as question_id',
            'survey_result.rating as rating',
            'answer.answer as answer',
            'survey_result.created_at as created_at',
            'CONCAT(UCASE(MID(worker.type, 1, 1)), MID(worker.type,2)) as worker_type'
        ])
        .where(whereClause)
        .getRawMany();
    return response;
}

export const getLeaverAnalysis: any = async (whereClause) => {
    const surveyRepository = getRepository(SurveyResult);
    let response = await surveyRepository.createQueryBuilder("survey_result")
        .innerJoin("survey_result.surveyAnswers", "answer")
        .innerJoin('survey_result.worker', 'worker')
        .select(`answer.answer AS label`)
        .addSelect(`COUNT(IFNULL(survey_result.rating, answer.answer)) AS value`)
        .groupBy(`label`)
        .where(whereClause)
        .andWhere(`worker.type = '${config.TEMPORARY_WORKER}'`)
        .getRawMany();
    return response;
}

export const getTrendSiteRating: any = async (whereClause) => {
    const surveyRepository = getRepository(SurveyResult);
    let response = await surveyRepository.createQueryBuilder('survey_result')
        .innerJoin('survey_result.question', 'survey_question')
        .innerJoin("survey_result.worker", "worker")
        .select(['IFNULL(FORMAT(avg(survey_result.rating),0),0.0) as ratings'])
        .addSelect(`WEEK(survey_result.created_at) - 12 as week_number`)
        .where(whereClause)
        .andWhere(`survey_question.belongs_to = 'SITE'`)
        .groupBy('week_number')
        .getRawMany();
    return response;
}

export const getTrendAgencyRating: any = async (whereClause, start_date, end_date, region_id = null, client_id) => {
    whereClause += ` AND survey_result.created_at >= '${start_date}' AND survey_result.created_at<='${end_date}'`;

    let selectQuery = await getRepository(SurveyResult).createQueryBuilder('survey_result')
        .innerJoin('survey_result.question', 'survey_question')
        .innerJoin("survey_result.worker", "worker")
        .select(['IFNULL(FORMAT(avg(survey_result.rating),0),0.0) as ratings'])
        .addSelect(`WEEK(survey_result.created_at) - 12 as week_number`)
        .where(whereClause)
        .andWhere(`survey_question.belongs_to = 'AGENCY'`)
        .groupBy('week_number');
    selectQuery = await addTrendsAnalysisRegion(selectQuery, region_id, client_id);
    if (region_id) {
        selectQuery = selectQuery.innerJoin('survey_result.site', 'site');
    }
    return await selectQuery.getRawMany()
}

export const getTrendCompanyRating: any = async (whereClause, start_date, end_date, region_id = null, client_id) => {
    whereClause += ` AND survey_result.created_at >= '${start_date}' AND survey_result.created_at<='${end_date}'`;

    let selectQuery = await getRepository(SurveyResult).createQueryBuilder('survey_result')
        .innerJoin('survey_result.question', 'survey_question')
        .innerJoin("survey_result.worker", "worker")
        .select(['IFNULL(FORMAT(avg(survey_result.rating),0),0.0) as ratings'])
        .addSelect(`WEEK(survey_result.created_at) - 12 as week_number`)
        .where(whereClause)
        .andWhere(`survey_question.belongs_to = 'SITE'`)
        .groupBy('week_number')
    selectQuery = await addTrendsAnalysisRegion(selectQuery, region_id, client_id);
    if (region_id) {
        selectQuery = selectQuery.innerJoin('survey_result.site', 'site');
    }
    return await selectQuery.getRawMany()
}

export const getSubmittedSurveyCount: any = async (options) => {
    const surveyRepository = getRepository(SurveyResult);
    let response = await surveyRepository.count({ where: options });
    return response;
}

export const getSurveySubmittedDate: any = async (workerId, surveyId) => {
    let selectQuery = getRepository(SurveyResult).createQueryBuilder('survey_result')
        .select(['survey_id'])
        .addSelect("MAX(created_at)", "created_at")
        .where(`survey_result.worker_id = ${workerId}`)
        .groupBy('survey_id')
    if (surveyId) {
        selectQuery = selectQuery.andWhere(`survey_result.survey_id = ${surveyId}`)
    }
    return await selectQuery.getRawMany();
}
