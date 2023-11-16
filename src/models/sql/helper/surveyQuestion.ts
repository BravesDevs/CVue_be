import { getRepository } from 'typeorm';
import { SurveyQuestions } from '..';
import { getClientUserIdFromWorkerUserIdWithLimit, getAgencyUserIdFromWorkerUserIdWithLimit } from '../../../models';
import { config } from '../../../configurations';
import { UserType, WorkerTypes } from '../../../common';
import { getWorkerHelper } from '.';
import { getWorkerIdFromUserIdService } from '../../../services';
import { getUsers } from '../../../models';
const _ = require('lodash');

/**
 * Get survey questions by surveyId
 */
export const getSurveyQuestions: any = async (surveyId, dataToSelect, is_default = 0, userType = null, userId = null) => {
    let selectQuery = getRepository(SurveyQuestions).createQueryBuilder('survey_questions')
        .select(dataToSelect)
        .where(`survey_questions.survey_id='${surveyId}'`)
        .andWhere(`survey_questions.is_default='${is_default}'`)

    if (surveyId == config.GENERAL_SURVEY_ID && is_default == 1) {
        selectQuery = selectQuery.andWhere(`survey_questions.belongsTo = '${userType}'`)
    }

    if (surveyId == config.GENERAL_SURVEY_ID && is_default == 0) {
        if (userType == UserType.CLIENT_ADMIN || userType == UserType.AGENCY_ADMIN) {
            selectQuery = selectQuery.andWhere(`survey_questions.createdBy = '${userId}'`)
        } else {
            let clientUser = await getClientUserIdFromWorkerUserIdWithLimit(userId);
            let agencyUser = await getAgencyUserIdFromWorkerUserIdWithLimit(userId);
            selectQuery = selectQuery.andWhere(`survey_questions.createdBy IN ('${clientUser.user_id}' ${agencyUser ? ", " + agencyUser.user_id : ""} )`)
        }
    }

    if (userType == UserType.AGENCY_WORKER) {
        let workerId = await getWorkerIdFromUserIdService(userId);
        let workerDetails = await getWorkerHelper({ id: workerId[0] });

        if (workerDetails['worker_type'] === WorkerTypes.PERMANENT) {
            selectQuery.andWhere(`survey_questions.belongs_to != 'AGENCY'`)
        }
    }

    return await selectQuery.execute();
}

export const getSurveyQuestionsForDownload: any = async (surveyId, dataToSelect, clientId = null, agencyId = null) => {
    let userDetails = await getUsers(`(user.client_id = ${clientId} || user.agency_id = ${agencyId}) && (user.user_type_id = ${UserType.AGENCY_ADMIN} || user.user_type_id = ${UserType.CLIENT_ADMIN})`);

    let selectQuery = getRepository(SurveyQuestions).createQueryBuilder('survey_questions')
        .select(dataToSelect)
        .where(`survey_questions.survey_id='${surveyId}'`)
        .andWhere(`survey_questions.is_default='0'`)

    if (surveyId == config.GENERAL_SURVEY_ID) {
        selectQuery = selectQuery.andWhere(`survey_questions.createdBy IN (${_.map(userDetails, 'user_id')})`)
    }
    return await selectQuery.execute();
}

/**
 * Add survey questions
 */
export const createSurveyQuestions: any = async (questions) => {
    return (await getRepository(SurveyQuestions).save(questions));
};

/**
 * Update survey questions
 */
export const updateSurveyQuestionHelper: any = async (data) => {
    return await getRepository(SurveyQuestions).save(data);
};
