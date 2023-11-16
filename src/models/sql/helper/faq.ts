import { getRepository, In } from 'typeorm';
import { Faq } from '../entities/Faq';

/**
 * Get FAQ list by faq type
 * @param  {String} type
 * @param  {number} page
 * @param  {number} limit
 */
export const getFaqListWithPagination: any = async (type: String, page: number, limit: number) => {
    const faqRepository = getRepository(Faq);
    let response = await faqRepository.createQueryBuilder("faq")
        .select(['faq.question AS question', 'faq.answer AS answer'])
        .where('faq.is_visible = 1')
        .andWhere(`faq.type = '${type}'`)
        .orderBy("faq.display_order", "ASC")
        .offset((page - 1) * limit)
        .limit(limit)
        .getRawMany();

    response["count"] = await faqRepository.count({
        where: {
            isVisible: 1,
            type
        }
    });
    return response;
};
