import { ErrorResponse } from "../common/errors";
import { getPermissionsByUserTypeAndFeatureId } from "./../models";


/**
 * Method to check user permission
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const checkPermission = (allowedUserTypes) => {
    return async function (req, res, next) {
        const loggedInUser = req.user;
        if (allowedUserTypes.includes(parseInt(loggedInUser.user_type_id))) {
            return next();
        }
        return res.status(403).send(ErrorResponse.PermissionDenied);
    }
};
