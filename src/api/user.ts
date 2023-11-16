import { AddNewUserSchema, UpdateUserProfileSchema, MimeType, GetAdminsSchema, QueryParamsSchemaWithIdOnly, RevokeUserProfileAccessSchema } from "../common";
import { config } from "../configurations";
import { addNewUser, revokeUserProfileAccessService } from "../services";
import { getAdminUserDetailsService, getUsers, updateUserProfileService, resendInvitationService } from "../services";
import { validateRequestData, notifyBugsnag } from "../utils";
const path = require("path");

/**
 * API to create a new user.
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const createNewUser = async (req, res, next) => {
    try {
        await validateRequestData(AddNewUserSchema, req.body);
        let response = await addNewUser(req.body, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to get the user details based on the logged in user.
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const getUsersList = async (req, res, next) => {
    try {
        let response = await getUsers(req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to update the user-profile details
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const updateUserProfile = async (req, res, next) => {
    try {
        let image = null;
        if (req.files) {
            if (req.files.profile.mimetype !== MimeType.JPG &&
                req.files.profile.mimetype !== MimeType.PNG) {
                return res.status(400).json({
                    "status": 400,
                    "ok": false,
                    "message": "Invalid file type.",
                    "error": "BAD_REQUEST"
                })
            }
            if (req.files.profile.size > config.MAX_IMAGE_SIZE) {
                return res.status(400).json({
                    "status": 400,
                    "ok": false,
                    "message": "File size is more than 5 MB",
                    "error": "BAD_REQUEST"
                })
            }
            let ext = path.extname(req.files.profile.name);
            image = {
                data: req.files.profile.data,
                mime: req.files.profile.mimetype,
                extension: ext
            };
        }
        await validateRequestData(UpdateUserProfileSchema, req.body);
        let response = await updateUserProfileService(req.body, image, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to GET the Admin user details
 * @param req
 * @param res
 * @param next
 */
export const getAdminUserDetails = async (req, res, next) => {
    try {

        await validateRequestData(GetAdminsSchema, req.query)
        let response = await getAdminUserDetailsService(req.query, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to send reset password link.
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const resendInvitation = async (req, res, next) => {
    try {
        await validateRequestData(QueryParamsSchemaWithIdOnly, req.params);
        let response = await resendInvitationService(req.params.id, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API to revoke user access.
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const revokeUserProfileAccess = async (req, res, next) => {
    try {
        await validateRequestData(RevokeUserProfileAccessSchema, req.params);
        let response = await revokeUserProfileAccessService(req.params, req.user);
        res.status(response[0]).json(response[1]);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}