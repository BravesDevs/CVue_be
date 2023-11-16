import { CreateUserDTO, ErrorCodes, ErrorResponse, RedirectURLs, UserType, RevokeUserProfileAccessDTO } from "../common";
import { createUser, getAllUsers, updateUserHelper, addResetPasswordToken, getAdminUserDetailsHelper, getUserById, revokeUserProfileAccessHelper, getDefaultMessageTemplate } from "../models";
import { sendTemplateEmail, uploadFileOnS3, notifyBugsnag } from "../utils";
import { sendDefaultMessageTemplate } from "./messages";
import { addDefaultGeneralQuestions } from './survey';
const _ = require("lodash");
const jwt = require("jsonwebtoken");
import { config } from "./../configurations";
import { MessageActions } from "./../common";


/**
 * Service to add user.
 */
export const addNewUser = async (payload: CreateUserDTO, loggedInUser) => {
    if (!payload.user_type) {
        return [400, ErrorResponse.BadRequestError];
    }
    try {
        let data = {}
        if (payload.user_type == UserType.CLIENT_ADMIN) {
            data["userTypeId"] = payload.user_type;
            data["clientId"] = payload.id;
            data["name"] = payload.name;
            data["email"] = payload.email;
            data["countryCode"] = payload.country_code;
            data["mobile"] = payload.phone;
            data["createdBy"] = loggedInUser.user_id;
            data["updatedBy"] = loggedInUser.user_id;
        }
        else if (payload.user_type == UserType.AGENCY_ADMIN) {
            data["userTypeId"] = payload.user_type;
            data["agencyId"] = payload.id;
            data["name"] = payload.name;
            data["email"] = payload.email;
            data["countryCode"] = payload.country_code;
            data["mobile"] = payload.phone
            data["createdBy"] = loggedInUser.user_id;
            data["updatedBy"] = loggedInUser.user_id;

        } else if (payload.user_type == UserType.CLEARVUE_ADMIN) {
            data["userTypeId"] = payload.user_type;
            data["name"] = payload.name;
            data["email"] = payload.email;
            data["countryCode"] = payload.country_code;
            data["mobile"] = payload.phone
            data["createdBy"] = loggedInUser.user_id;
            data["updatedBy"] = loggedInUser.user_id;

        }
        let userDetails = await createUser(data);
        if (!userDetails) {
            return [404, ErrorResponse.ResourceNotFound];
        }
        const resetPasswordJwtToken = await jwt.sign(
            { user_id: userDetails.id },
            config.JWT_TOKEN_KEY,
            {
                expiresIn: config.RESET_PASSWORD_LINK_EXPIRE_TIME,
            }
        );
        await addResetPasswordToken(resetPasswordJwtToken, parseInt(userDetails.id));
        let message = {
            toEmailId: payload.email,
            templateId: config.Sendgrid.INVITE_USER_EMAIL_TEMPLATE,
            dynamicTemplateData: {
                sender_name: loggedInUser.user_name,
                account_name: userDetails.company_name,
                invitation_link:
                    config.PORTAL_HOST_URL +
                    RedirectURLs.RESET_PASSWORD +
                    "?type=set_password&code=" +
                    resetPasswordJwtToken,
            },
        };

        await sendTemplateEmail(message);

        // Add default message template for agency admin
        if (payload.user_type == UserType.AGENCY_ADMIN) {
            await sendDefaultMessageTemplate(userDetails.id);
        }

        // Add default general survey questions for client admin and agency admin
        if (payload.user_type == UserType.CLIENT_ADMIN || payload.user_type == UserType.AGENCY_ADMIN) {
            await addDefaultGeneralQuestions(userDetails.id, payload.user_type);
        }
        return [
            201,
            {
                ok: true,
                message: MessageActions.CREATE_USER,
                user_id: parseInt(userDetails.id),
            },
        ];
    }
    catch (err) {
        if (err.code === ErrorCodes.duplicateKeyError) {
            return [409, ErrorResponse.UserAlreadyExists]    // Return 409 if user already exists
        } else if (err.code === ErrorCodes.dbReferenceError) {
            return [404, ErrorResponse.ResourceNotFound]    // Return 404 if any foreign key contraint is not available in DB
        }
        else if (err.error && err.error === "SENDGRID_BAD_REQUEST") {
            return [400, ErrorResponse.UserInviteEmailNotSent]
        }
        else {
            notifyBugsnag(err);
            return [500, err.message]
        }
    }
}


/**
 * Service to GET users.
 */
export const getUsers = async (loggedInUser) => {
    try {
        let url: any;
        let userDetails = await getAllUsers(loggedInUser);
        if (userDetails.resource == null) {
            url = config.BUCKET_URL + "/" + config.PROFILE_BUCKET_FOLDER + "/" + config.DEFAULT_IMAGE;
        }
        else {
            url = userDetails.resource;
        }
        let data = {
            "id": parseInt(userDetails.user_id),
            "user_type_id": parseInt(userDetails.user_type_id),
            "user_type": userDetails.user_type,
            "user_type_name": userDetails.user_type_name,
            "agency_id": parseInt(userDetails.agency_id),
            "client_id": parseInt(userDetails.client_id),
            "site_id": parseInt(userDetails.site_id),
            "region_id": parseInt(userDetails.region_id),
            "name": userDetails.name,
            "email": userDetails.email,
            "country_code": userDetails.country_code,
            "mobile": userDetails.mobile,
            "profile_url": url
        }
        if (!userDetails) {
            return [404, ErrorResponse.ResourceNotFound];
        }
        return [
            200,
            {
                ok: true,
                user_details: data,
            },
        ];
    }
    catch (err) {
        if (err.code === ErrorCodes.duplicateKeyError) {
            return [409, ErrorResponse.UserAlreadyExists]    // Return 409 if user already exists
        } else if (err.code === ErrorCodes.dbReferenceError) {
            return [404, ErrorResponse.ResourceNotFound]    // Return 404 if any foreign key contraint is not available in DB
        } else {
            notifyBugsnag(err);
            return [500, err.message]
        }
    }
}

/**
 * Service to update user profile.
 */
export const updateUserProfileService = async (data, image, loggedInUser) => {
    try {
        if (data.profile && (data.profile === "null")) {
            delete data.profile
        }
        else if (image) {
            let resourceName: string;
            if (parseInt(loggedInUser.user_type_id) === UserType.CLEARVUE_ADMIN) {
                resourceName = "admin" + parseInt(loggedInUser.user_id) + image.extension;
            }
            else if (parseInt(loggedInUser.user_type_id) === UserType.CLIENT_ADMIN) {
                resourceName = "client" + parseInt(loggedInUser.user_id) + image.extension;
            }
            else if (parseInt(loggedInUser.user_type_id) === UserType.AGENCY_ADMIN) {
                resourceName = "agency" + parseInt(loggedInUser.user_id) + image.extension;
            }
            else if (parseInt(loggedInUser.user_type_id) === UserType.CLIENT_REGIONAL) {
                resourceName = "region_admin" + parseInt(loggedInUser.user_id) + image.extension;
            }
            else if (parseInt(loggedInUser.user_type_id) === UserType.CLIENT_SITE) {
                resourceName = "site_admin" + parseInt(loggedInUser.user_id) + image.extension;
            }
            data["resource"] = config.BUCKET_URL + "/" + config.PROFILE_BUCKET_FOLDER + "/" + resourceName;
            await uploadFileOnS3(config.BUCKET_NAME, config.PROFILE_BUCKET_FOLDER, resourceName, image.mime, image.data);
        }
        data.updatedBy = loggedInUser.user_id
        let userDetails = await updateUserHelper(loggedInUser.user_id, data)
        if (!userDetails) {
            return [404, ErrorResponse.ResourceNotFound];
        }
        return [
            200,
            {
                ok: true,
                message: MessageActions.UPDATE_USER
            },
        ];
    } catch (err) {
        if (err.code === ErrorCodes.duplicateKeyError) {
            return [409, ErrorResponse.UserAlreadyExists]    // Return 409 if user already exists
        } else if (err.code === ErrorCodes.dbReferenceError) {
            return [404, ErrorResponse.ResourceNotFound]    // Return 404 if any foreign key contraint is not available in DB
        } else {
            notifyBugsnag(err);
            return [500, err.message]
        }
    }
}

/**
 * Service to GET admin user details.
 */
export const getAdminUserDetailsService = async (data, loggedInUser) => {
    try {
        let whereClause = '';
        let userDetails = []
        if (data.user_type == UserType.AGENCY_ADMIN) {
            whereClause = `user.userTypeId = ${data.user_type} AND user.agencyId = ${data.id}`;
        }
        else {
            whereClause = `user.userTypeId = ${data.user_type} AND user.clientId = ${data.id}`;
        }
        userDetails = await getAdminUserDetailsHelper(whereClause)
        return [200, {
            ok: true,
            users: userDetails
        }]
    } catch (err) {
        if (err.code === ErrorCodes.duplicateKeyError) {
            return [409, ErrorResponse.UserAlreadyExists]    // Return 409 if user already exists
        } else if (err.code === ErrorCodes.dbReferenceError) {
            return [404, ErrorResponse.ResourceNotFound]    // Return 404 if any foreign key contraint is not available in DB
        } else {
            notifyBugsnag(err);
            return [500, err.message]
        }
    }
}

/**
 * Service to resend email invitaion to user.
 */
export const resendInvitationService = async (userId, loggedInUser) => {
    try {
        let userDetails = await getUserById(userId);
        if (!userDetails) {
            return [404, ErrorResponse.ResourceNotFound];
        }
        let companyName = '';
        const userTypeId = parseInt(userDetails.user_type_id);
        if (userTypeId === UserType.CLIENT_ADMIN || userTypeId === UserType.CLIENT_REGIONAL || userTypeId === UserType.CLIENT_SITE) {
            companyName = userDetails.client_name;
        } else if (userTypeId === UserType.AGENCY_ADMIN) {
            companyName = userDetails.agency_name;
        }
        const resetPasswordJwtToken = await jwt.sign(
            { user_id: userDetails.id },
            config.JWT_TOKEN_KEY,
            {
                expiresIn: config.RESET_PASSWORD_LINK_EXPIRE_TIME,
            }
        );
        await addResetPasswordToken(resetPasswordJwtToken, parseInt(userDetails.id));
        let message = {
            toEmailId: userDetails.email,
            templateId: config.Sendgrid.INVITE_USER_EMAIL_TEMPLATE,
            dynamicTemplateData: {
                sender_name: loggedInUser.user_name,
                account_name: companyName,
                invitation_link:
                    config.PORTAL_HOST_URL +
                    RedirectURLs.RESET_PASSWORD +
                    "?type=set_password&code=" +
                    resetPasswordJwtToken,
            },
        };
        await sendTemplateEmail(message);
        return [200, {
            ok: true,
            message: MessageActions.RESEND_INVITATION,
        }];
    }
    catch (err) {
        if (err.error && err.error === "SENDGRID_BAD_REQUEST") {
            return [400, ErrorResponse.ResendInvitationEmailNotSent]
        }
        notifyBugsnag(err);
        return [500, err.message]
    }
};

/**
 * Service to revoke user access.
 */
export const revokeUserProfileAccessService = async (data: RevokeUserProfileAccessDTO, loggedInUser) => {
    try {
        let userDetails = await getUserById(data.id);
        if (!userDetails) {
            return [404, ErrorResponse.ResourceNotFound];
        }
        if (![UserType.CLIENT_SITE, UserType.CLIENT_REGIONAL, UserType.AGENCY_SITE, UserType.AGENCY_REGIONAL].includes(parseInt(userDetails.user_type_id))) {
            return [403, ErrorResponse.PermissionDenied]
        }
        await revokeUserProfileAccessHelper(data.id, loggedInUser);
        return [200, {
            ok: true,
            message: MessageActions.REVOKE_USER
        }]
    }
    catch (err) {
        notifyBugsnag(err);
        return [500, err.message];
    }
}