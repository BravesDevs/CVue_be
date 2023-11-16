import { getRepository } from 'typeorm';
import { RateCard } from '../';

/**
 * create Rate Card
 */
export const createRateCard: any = async (body) => {
    const rateCardRepository = getRepository(RateCard);
    const response = await rateCardRepository.insert(body);
    return response.identifiers;
};

/**
 * update Rate Card
 */
export const updateRateCard: any = async (id, body) => {
    const rateCardRepository = getRepository(RateCard);
    body.updatedAt = new Date();
    return await rateCardRepository.update({id}, body);
};

/**
 * get Rate Card list
 */
export const getRateCardList: any = async (page, limit, clientId) => {
    const rateCardRepository = getRepository(RateCard);
    return await rateCardRepository.createQueryBuilder("rate_card")
    .skip((page -1) * limit)
    .take(limit)
    .select(['id', 'name', 'currency', 'pay_per_hour', 'insurance_rate', 'holiday_pay_rate', 'apprenticeship_rate', 'full_time_hours', 'pension_rate', 'overtime_pay_dynamic', 'overtime_pay', 'pay_per_hour_dynamic', 'insurance_rate_dynamic', 'holiday_pay_rate_dynamic', 'apprenticeship_rate_dynamic', 'full_time_hours_dynamic', 'pension_rate_dynamic'])
    .where('rate_card.clientId = :clientId', {clientId})
    .getRawMany();
};

export const getRateCardForDropDown: any = async (clientId) => {
    const rateCardRepository = getRepository(RateCard);
    return await rateCardRepository.createQueryBuilder("rate_card")
    .select(['id', 'name'])
    .where('rate_card.clientId = :clientId', {clientId})
    .orderBy('name', 'ASC')
    .getRawMany();
};


/**
 * get Rate Card By Id
 */
export const getRateCardById: any = async (id) => {
    const rateCardRepository = getRepository(RateCard);
    return await rateCardRepository.createQueryBuilder("rate_card")
    .where("rate_card.id = :id", { id })
        .select(['id'])
        .getRawOne();
};

/**
 * get Rate Card count
 */
export const getRateCardCount: any = async (clientId) => {
    const rateCardRepository = getRepository(RateCard);
    return await rateCardRepository.count({ clientId })
};