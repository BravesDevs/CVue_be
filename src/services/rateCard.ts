/**
 * All the service layer methods for the Rate Card.
 */
const _ = require('lodash');
const { EasyPromiseAll } = require('easy-promise-all');
import { UpdateRateCardDTO, ErrorResponse } from "./../common";
import { createRateCard, updateRateCard, getRateCardList, getRateCardById, getRateCardCount, getRateCardForDropDown } from "./../models";
import { MessageActions } from "./../common";

/**
 * create rateCard.
 * @param  {UpdateRateCardDTO} payload
 */
export const createRateCardService = async (payload, loggedInUser) => {
    let rateCardPayload = {
        name: payload.name,
        currency: payload.currency,
        payPerHour: payload.pay_per_hour,
        insuranceRate: payload.insurance_rate,
        holidayPayRate: payload.holiday_pay_rate,
        apprenticeshipRate: payload.apprenticeship_rate,
        pensionRate: payload.pension_rate,
        fullTimeHours: payload.full_time_hours,
        overtimePayDynamic: payload.overtime_pay_dynamic,
        overtimePay: payload.overtime_pay,
        payPerHourDynamic: payload.pay_per_hour_dynamic,
        insuranceRateDynamic: payload.insurance_rate_dynamic,
        holidayPayRateDynamic: payload.holiday_pay_rate_dynamic,
        apprenticeshipRateDynamic: payload.apprenticeship_rate_dynamic,
        pensionRateDynamic: payload.pension_rate_dynamic,
        fullTimeHoursDynamic: payload.full_time_hours_dynamic,
        clientId: payload.client_id,
        createdBy: loggedInUser.user_id,
        updatedBy: loggedInUser.user_id,
    };
    let rateCard = await createRateCard(rateCardPayload);
	return [201, {
		ok: true,
        message: MessageActions.CREATE_RATE_CARD,
        rate_card_id: _.map(rateCard, 'id'),
	}];
};

/**
 * update rateCard.
 * @param  {id}
 * @param  {UpdateRateCardDTO} payload
 */
export const updateRateCardService = async (id: string, payload: UpdateRateCardDTO, loggedInUser) => {
    let rateCardToUpdate = await getRateCardById(id);

	if (!rateCardToUpdate) {
		return [404, ErrorResponse.ResourceNotFound];
	}
    const rateCardPayload = {
        name: payload.name,
        currency: payload.currency,
        payPerHour: payload.pay_per_hour,
        insuranceRate: payload.insurance_rate,
        holidayPayRate: payload.holiday_pay_rate,
        apprenticeshipRate: payload.apprenticeship_rate,
        pensionRate: payload.pension_rate,
        fullTimeHours: payload.full_time_hours,
        overtimePayDynamic: payload.overtime_pay_dynamic,
        overtimePay: payload.overtime_pay,
        payPerHourDynamic: payload.pay_per_hour_dynamic,
        insuranceRateDynamic: payload.insurance_rate_dynamic,
        holidayPayRateDynamic: payload.holiday_pay_rate_dynamic,
        apprenticeshipRateDynamic: payload.apprenticeship_rate_dynamic,
        pensionRateDynamic: payload.pension_rate_dynamic,
        fullTimeHoursDynamic: payload.full_time_hours_dynamic,
        updatedBy: loggedInUser.user_id,
    }
    let rateCard = await updateRateCard(id, rateCardPayload);
	return [200, {
		ok: true,
        message: MessageActions.UPDATE_RATE_CARD,
        rate_card_id: rateCard.id
	}];
};

/**
 * get rateCard list.
 */
export const getRateCardListService = async (page: number, limit: number, clientId: number) => {
    const { rateCardList, count } = await EasyPromiseAll({
        rateCardList: getRateCardList(page, limit, clientId),
        count: getRateCardCount(clientId)
    });
	return [200, {
        "ok": true,
        "rate_card_list": rateCardList,
        count
    }];
};

/**
 * Service to GET rate-cards for drop down.
 */
export const rateCardDropDownService = async (clientId: number) => {
    const { rateCardList, count } = await EasyPromiseAll({
        rateCardList: getRateCardForDropDown(clientId)
    });
	return [200, {
        "ok": true,
        "rate_card_list": rateCardList,
        count
    }];
};