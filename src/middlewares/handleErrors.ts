import { GeneralError } from '../common';
import { notifyBugsnag } from '../utils'

/**
 * Method to handle raised errors while processing request.
 * - If raised error is instance of the General(Custom) Errors 
 * then fetch status code for the error. And return response with that.
 * - If error is not instance of General Errors then Return INTERNAL_SERVER_ERROR
 * @param  {} err
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const handleErrors = (err, req, res, next) => {
    if (err instanceof GeneralError) {
        return res.status(err.getCode()).json({
            error: err.error,
            ok: false,
            status: err.getCode(),
            message: err.message
        });
    }
    notifyBugsnag(err, req.originalUrl);
    return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        ok: false,
        status: 500,
        message: err.message
    });
}
