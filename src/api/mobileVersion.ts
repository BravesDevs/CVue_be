import { notifyBugsnag } from './../utils';
import { getmobileVersionService } from '../services'

/**
 * API to get mobile version
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const getmobileVersion = async (req, res, next) => {
    try {
        let response = await getmobileVersionService();
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};
