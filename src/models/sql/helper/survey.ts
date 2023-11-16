import { getRepository } from 'typeorm';
import { Survey } from '..';

export const getSurveyCategories: any = async (selectKeys, whereClause) => {
    const surveyRepository = getRepository(Survey);
    return await surveyRepository.createQueryBuilder('survey')
        .select(selectKeys)
        .where(whereClause)
        .execute()
}