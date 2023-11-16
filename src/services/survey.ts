const _ = require('lodash');
const moment = require('moment');
import { MessageActions, ErrorResponse, WorkerTypes, agency } from "./../common";
import {
    getSurveyCategories, getWorkerStartDateById, getSurveyQuestions, addNewSurvey, addNewAnswer, getSurveyQuestionsForDownload,
    getSurveyAnalysis, downloadSurveyAnalysis, createSurveyQuestions, updateSurveyQuestionHelper, getSurveySubmittedDate,
    getWorkerIdfromUserIdWithLimit, getClientUserIdById, getSubmittedSurveyCount
} from "./../models";
import { config } from '../configurations';
import { UserType } from '../common';

/**
 * Service to GET Survey Category.
 */
export const getSurveyCategoryService = async (userId = null) => {
    const selectKeys = userId ? ['id', 'name', 'triggered_week', 'submission_limit'] : ['id', 'name']
    const whereClause = userId ? 'is_visible = 1' : ''
    let surveyCategories = await getSurveyCategories(selectKeys, whereClause);

    if (userId) {
        let workerDetail = await getWorkerIdfromUserIdWithLimit(userId);
        let surveySubmittedDate = await getSurveySubmittedDate(workerDetail.id, null);
        let categoryObj: Object = {};
        let submittedDateObj: Object = {};

        surveyCategories.forEach((element) => {
            categoryObj[element.id] = element.submission_limit;
        });
        surveySubmittedDate.forEach((element) => {
            submittedDateObj[element.survey_id] = element.created_at;
        });

        const worker = await getWorkerStartDateById(workerDetail.id);
        const currentWeek = moment().diff(worker.start_date, 'weeks');
        surveyCategories = _.map(surveyCategories, (category) => {
            category.isVisible = true;
            if (category.triggered_week === 1) {
                category.isVisible = currentWeek > 1 ? false : isAbleToSubmitSurvey(categoryObj[category.id], submittedDateObj[category.id]) && isSurveyAllowedToWorker(category.id, workerDetail.type);
            } else if (category.triggered_week === 2) {
                category.isVisible = (currentWeek < 1 || currentWeek > 2) ? false : isAbleToSubmitSurvey(categoryObj[category.id], submittedDateObj[category.id]) && isSurveyAllowedToWorker(category.id, workerDetail.type);
            } else if (category.triggered_week === 4) {
                category.isVisible = (currentWeek < 2 || currentWeek > 4) ? false : isAbleToSubmitSurvey(categoryObj[category.id], submittedDateObj[category.id]) && isSurveyAllowedToWorker(category.id, workerDetail.type);
            } else if (category.triggered_week === 8) {
                category.isVisible = (currentWeek < 4 || currentWeek > 8) ? false : isAbleToSubmitSurvey(categoryObj[category.id], submittedDateObj[category.id]) && isSurveyAllowedToWorker(category.id, workerDetail.type);
            } else if (category.triggered_week === 12) {
                category.isVisible = (currentWeek < 8 || currentWeek > 12) ? false : isAbleToSubmitSurvey(categoryObj[category.id], submittedDateObj[category.id]) && isSurveyAllowedToWorker(category.id, workerDetail.type);
            } else if (category.name === "Exit Survey") {
                category.isVisible = worker.is_active === 1 ? false : isAbleToSubmitSurvey(categoryObj[category.id], submittedDateObj[category.id]) && isSurveyAllowedToWorker(category.id, workerDetail.type);
            } else {
                category.isVisible = isAbleToSubmitSurvey(categoryObj[category.id], submittedDateObj[category.id]) && isSurveyAllowedToWorker(category.id, workerDetail.type);
            }
            delete category.triggered_week;
            delete category.submission_limit;
            return category;
        })
    }
    return [200, {
        ok: true,
        surveys: surveyCategories,
    }];
}

export const isAbleToSubmitSurvey = (surveyLimit, lastSubmitDate = null) => {
    let isVisible = true;
    if (surveyLimit == 'ONCE_A_MONTH') {
        isVisible = !moment(lastSubmitDate).isSame(new Date(), 'month');
    } else if (surveyLimit == 'ONCE_A_WEEK') {
        isVisible = !moment(lastSubmitDate).isSame(new Date(), 'week');
    } else if (surveyLimit == 'ONLY_ONCE') {
        isVisible = lastSubmitDate ? false : true;
    }
    return isVisible
}

export const isSurveyAllowedToWorker = (surveyId, workerType) => {
    return workerType == WorkerTypes.PERMANENT && !JSON.parse(config.PERMANENT_WORKER_ALLOWED_SURVEYS).includes(parseInt(surveyId)) ? false : true;
}

/**
 * Service to GET Survey Analysis.
 */
export const getSurveyAnalysisService = async (surveyId, query) => {
    let whereClause = `survey_result.surveyId = ${surveyId}`;
    if (query.client_id) {
        whereClause = `${whereClause} and survey_result.clientId = ${query.client_id}`
    }
    if (query.agency_id) {
        whereClause = `${whereClause} and survey_result.agencyId = ${query.agency_id}`
    }
    if (query.site_id) {
        whereClause = `${whereClause} and survey_result.siteId = ${query.site_id}`
    }
    if (query.region_id) {
        whereClause = `${whereClause} and site.regionId = ${query.region_id}`
    }
    if (query.start_date && query.end_date) {
        whereClause = `${whereClause} and survey_result.created_at >= '${moment(query.start_date).format('YYYY-MM-DD 00:00:01')}' and survey_result.created_at <= '${moment(query.end_date).format('YYYY-MM-DD 23:59:59')}'`
    }

    whereClause += query.type ? ` and worker.type = '${query.type}'` : '';

    let surveyAnalysis = await getSurveyAnalysis(whereClause);
    let response = []
    _.map(surveyAnalysis, (survey) => {
        let formattedSurvey = _.find(response, { id: survey.question_id });
        if (survey.value != 0) {
            if (formattedSurvey) {
                formattedSurvey.options.push({
                    name: survey.option_type == 'Rating' ? `${survey.name} Stars` : survey.name,
                    count: survey.value
                })
            } else {
                let analysis = {
                    id: survey.question_id,
                    question_text: survey.question_text,
                    label: survey.label,
                    options: [{
                        name: survey.option_type == 'Rating' ? `${survey.name} Stars` : survey.name,
                        count: survey.value
                    }]
                };
                response.push(analysis)
            }
        }
    })
    return [200, {
        ok: true,
        questions: response,
    }];
}

/**
 * Service to downbload Survey Analysis.
 */
export const downloadSurveyAnalysisService = async (surveyId, query, loggedInUser) => {
    let whereClause = `survey_result.surveyId = ${surveyId}`;
    if (query.client_id) {
        whereClause = `${whereClause} and survey_result.clientId = ${query.client_id}`
    }
    if (query.agency_id) {
        whereClause = `${whereClause} and survey_result.agencyId = ${query.agency_id}`
    }
    if (query.site_id) {
        whereClause = `${whereClause} and survey_result.siteId = ${query.site_id}`
    }
    if (query.start_date && query.end_date) {
        whereClause = `${whereClause} and survey_result.created_at >= '${moment(query.start_date).format('YYYY-MM-DD 00:00:01')}' and survey_result.created_at <= '${moment(query.end_date).format('YYYY-MM-DD 23:59:59')}'`
    }

    whereClause += query.type ? ` and worker.type = '${query.type}'` : '';
    let userId = loggedInUser.user_id;
    if (loggedInUser.user_type_id != UserType.CLIENT_ADMIN) {
        userId = (await getClientUserIdById(query.client_id)).user_id;
    }

    let questions = await getSurveyQuestionsForDownload(surveyId, ['id', 'question_text', 'label'], query.client_id, query.agency_id);
    questions = _.map(questions, (question) => {
        question.question_text = question.question_text.replace(/,/g, "")
        return question
    });

    let surveyAnalysis = await downloadSurveyAnalysis(whereClause);
    let response = []
    _.map(surveyAnalysis, (survey) => {
        const question_id = survey.question_id;
        let formattedSurvey = _.find(response, { created_at: survey.created_at });
        if (formattedSurvey) {
            // let formattedQuestions = _.find(formattedSurvey.questions, {question_id: survey.question_id});
            let formattedQuestions = formattedSurvey.questions[question_id];
            if (formattedQuestions && survey.answer) {
                formattedQuestions.answer.push(survey.answer)
            } else {
                formattedSurvey.questions[question_id] = {
                    "rating": survey.rating,
                    "answer": survey.answer ? [survey.answer] : [],
                }
            }
        } else {
            let analysis = {
                id: survey.id,
                worker_id: survey.worker_id,
                worker_first_name: survey.worker_first_name,
                worker_last_name: survey.worker_last_name,
                shift_name: survey.shift_name,
                site_name: survey.site_name,
                department_name: survey.department_name,
                worker_employee_id: survey.worker_employee_id,
                worker_role: survey.worker_role,
                questions: {},
                worker_type: survey.worker_type,
                created_at: survey.created_at
            };
            analysis.questions[question_id] = {
                "rating": survey.rating,
                "answer": survey.answer ? [survey.answer] : [],
            }
            response.push(analysis)
        }
    })
    return [200, {
        ok: true,
        questions: questions,
        surveys: response,
    }];
}

/**
 * Service to GET Survey Questions.
 */
export const getSurveyQuestionsService = async (surveyId, userId, userType) => {
    let surveyQuestions = await getSurveyQuestions(surveyId, ['id', 'question_text', 'label', 'sequence', 'option_type', 'options'], 0, userType, userId);
    surveyQuestions = _.map(surveyQuestions, (question) => {
        question.options = question.options ? JSON.parse(question.options) : question.options;
        return question;
    })
    return [200, {
        ok: true,
        questions: surveyQuestions,
    }];
}

/**
 * Service to add Survey.
 */
export const addSurveyService = async (result, loggedInUserId) => {

    result.forEach((question) => {
        !question.agencyId && delete question.agencyId;
    })

    let selectKeys = ['id', 'name', 'submission_limit'];
    let whereClause = `is_visible = 1 AND id = '${result[0].surveyId}'`;
    let surveyCategory = await getSurveyCategories(selectKeys, whereClause);
    let surveySubmittedDate = await getSurveySubmittedDate(result[0].workerId, result[0].surveyId);
    let submissionFlag = isAbleToSubmitSurvey(
        surveyCategory[0].submission_limit,
        surveySubmittedDate.length ? surveySubmittedDate[0].created_at : null
    );

    if (!submissionFlag) {
        return [409, ErrorResponse.SurveyAlreadyFilled]
    }

    const responseWithNoMcq = [];
    const answerData = [];
    for (let response of result) {
        response.createdBy = loggedInUserId;
        if (response.hasOwnProperty('rating') && response.rating != null) {
            responseWithNoMcq.push(response);
        } else {
            const { "answer": answer, ...resultObj } = response;
            const surveyResult = await addNewSurvey(resultObj);
            for (let ans of answer) {
                answerData.push({
                    answer: ans,
                    createdBy: loggedInUserId,
                    resultId: surveyResult[0]
                })
            }
        }
    }
    if (_.size(responseWithNoMcq)) {
        await addNewSurvey(responseWithNoMcq);
    }
    if (_.size(answerData)) {
        await addNewAnswer(answerData);
    }
    return [200, {
        ok: true,
        message: MessageActions.SURVEY_RESPONSE
    }];
}

/**
 * Service to add default general survey questions for client admin
 */
export const addDefaultGeneralQuestions = async (id: number, userType: number) => {
    let questions = await getSurveyQuestions(config.GENERAL_SURVEY_ID, ['id', 'survey_id', 'question_text', 'label', 'belongs_to', 'sequence', 'option_type'], 1, userType == UserType.AGENCY_ADMIN ? 'AGENCY' : 'SITE');

    let questionsToInsert = []
    questionsToInsert = questions.map(payload => {
        return {
            questionText: payload.question_text,
            surveyId: payload.survey_id,
            label: payload.label,
            belongsTo: payload.belongs_to,
            sequence: payload.sequence,
            optionType: payload.option_type,
            createdBy: id.toString(),
            updatedBy: id.toString()
        }
    })
    await createSurveyQuestions(questionsToInsert);
}

/**
 * update general survey questions
 * @param  {number} surveyId
 * @param  {any} payload
 * @param  {number} loggedInUser
 */
export const updateSurveyQuestionService = async (surveyId: number, payload: any, loggedInUser: number) => {
    const dataUpdate = _.map(payload.questions, (object) => {
        object["id"] = object.id.toString();
        object["questionText"] = object.question_text;
        object["updatedAt"] = new Date();
        object["updatedBy"] = loggedInUser;
        delete object.question_text;
        return object;
    })
    await updateSurveyQuestionHelper(dataUpdate);
    return [200, {
        ok: true,
        message: MessageActions.UPDATE_QUESTION,
    }];
};
