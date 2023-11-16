/**
 * All the service layer methods for the FAQ.
 */
import { getFaqListWithPagination } from "./../models";
import { FaqDatabaseType } from "../common/enum";

/**
 * API to get FAQ
 * @param  {} type
 * @param  {} params
 */
export const getFaqListService = async (type, params) => {
    const { page, limit } = params;
    let faq_list = await getFaqListWithPagination(type == 'faq' ? FaqDatabaseType.FAQ : FaqDatabaseType.LINK_TO_SUPPORT, page, limit);
    faq_list.forEach(element => {
        element.answer = JSON.parse(element.answer)
    });
    return [200, {
        ok: true,
        count: faq_list.count,
        faq_list
    }];
};
