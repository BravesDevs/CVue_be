import { getRepository } from 'typeorm';
import { SurveyAnswer } from '..';

export const addNewAnswer: any = async (data) => {
    const surveyRepository = getRepository(SurveyAnswer);
    let response = await surveyRepository.insert(data);
    return response.identifiers;
}