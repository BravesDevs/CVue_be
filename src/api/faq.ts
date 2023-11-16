import { validateRequestData, notifyBugsnag } from './../utils';
import { faqPaginationSchema, faqParamSchema } from './../common';
import { getFaqListService } from '../services'

/**
 * API to get FAQ list
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const getFaqList = async (req, res, next) => {
    try {
        await validateRequestData(faqParamSchema, req.params);          // Validate path params      
        let response = await getFaqListService(req.params.type, await validateRequestData(faqPaginationSchema, req.query));
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};
