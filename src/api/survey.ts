import { validateRequestData, notifyBugsnag } from './../utils';
import { QueryParamsSchemaWithIdOnly, CreateSurveySchema, QueryParamsForSurveyAnalysis, UpdateSurveyQuestionSchema } from './../common';
import { getSurveyCategoryService, getSurveyQuestionsService, addSurveyService, getSurveyAnalysisService, downloadSurveyAnalysisService, updateSurveyQuestionService } from '../services'
import { UserType } from '../common';

/**
 * API to GET the survey category.
 * @param req
 * @param res
 * @param next
 */
export const getSurveyCategory = async (req, res, next) => {
    try {
        const workerId = req.user.user_type_id == UserType.AGENCY_WORKER ? req.user.user_id : null
        let response = await getSurveyCategoryService(workerId);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to GET the survey Analysis.
 * @param req
 * @param res
 * @param next
 */
export const getSurveyAnalysis = async (req, res, next) => {
    try {
        await validateRequestData(QueryParamsSchemaWithIdOnly, req.params);
        await validateRequestData(QueryParamsForSurveyAnalysis, req.query);
        let response = await getSurveyAnalysisService(req.params.id, req.query);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to download the Survey Analysis.
 * @param req
 * @param res
 * @param next
 */
export const downloadSurveyAnalysis = async (req, res, next) => {
    try {
        await validateRequestData(QueryParamsSchemaWithIdOnly, req.params);
        await validateRequestData(QueryParamsForSurveyAnalysis, req.query);
        let response = await downloadSurveyAnalysisService(req.params.id, req.query, req.user);
        res.setHeader('Content-Type', 'text/csv');
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to GET the survey Questions.
 * @param req
 * @param res
 * @param next
 */
export const getSurveyQuestions = async (req, res, next) => {
    try {
        await validateRequestData(QueryParamsSchemaWithIdOnly, req.params);
        let response = await getSurveyQuestionsService(req.params.id, req.user.user_id, req.user.user_type_id);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to add the Survey.
 * @param req
 * @param res
 * @param next
 */
export const addSurvey = async (req, res, next) => {
    try {
        await validateRequestData(CreateSurveySchema, req.body);
        let response = await addSurveyService(req.body.result, req.user.user_id);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to update the general survey questions.
 * @param req
 * @param res
 * @param next
 */
export const updateSurveyQuestions = async (req, res, next) => {
    try {
        // Validate query params
        await validateRequestData(QueryParamsSchemaWithIdOnly, req.params);
        // Validate request body
        await validateRequestData(UpdateSurveyQuestionSchema, req.body);
        let response = await updateSurveyQuestionService(req.params.id, req.body, req.user.user_id);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}
