import {
    AddClientDTO,
    ErrorCodes,
    ErrorResponse,
    RedirectURLs,
} from "../common";
import { UserType } from '../common'
import {
    addNewClient,
    updateExistingClient,
    getSectorsList,
    getClientsById,
    getAllClients,
    getClientUsersHelper,
    addClientSiteUser,
    addClientRegionUser,
    getAllUsers,
    updateClientUserHelper,
    addResetPasswordToken,
    getRegionById,
    getClientUsersByIDHelper,
    updateRegion,
    updateUserHelper,
    removeUserSiteAssociation,
    generateUserSiteAssociation,
    getDefaultMessageTemplate,
    createMessageTemplate
} from "../models";
import { sendTemplateEmail, uploadFileOnS3 } from "../utils";
import { sendDefaultMessageTemplate } from "./messages";
const _ = require("lodash");
const jwt = require("jsonwebtoken");
import { config } from "../configurations";
import { MessageActions } from "../common";
import { notifyBugsnag } from "../utils";

/**
 * Service to add client.
 */
export const addClient = async (payload: AddClientDTO, loggedInUser) => {
    try {
        let clientDetails = await addNewClient(payload);
        if (!clientDetails) {
            return [404, ErrorResponse.ResourceNotFound];
        }
        return [
            201,
            {
                ok: true,
                message: MessageActions.CREATE_CLIENT,
                client_id: parseInt(clientDetails.id),
            },
        ];
    } catch (err) {
        if (err.code === ErrorCodes.duplicateKeyError) {
            return [409, ErrorResponse.ClientAlreadyExists]    // Return 409 if worker already exists
        } else if (err.code === ErrorCodes.dbReferenceError) {
            return [404, ErrorResponse.ResourceNotFound]    // Return 404 if any foreign key constraint is not available in DB
        } else {
            notifyBugsnag(err);
            return [500, err.message]
        }
    }
};

/**
 * Service to amend client details.
 */
export const updateClient = async (payload, image, loggedInUser) => {
    try {
        let clientId = payload.client_id;
        if (payload.profile && (payload.profile === "null")) {
            delete payload.profile
        } else if (image) {
            let resourceName = "COMPANY" + payload["client_id"] + image.extension;
            payload["resource"] = config.BUCKET_URL + "/" + config.PROFILE_BUCKET_FOLDER + "/" + resourceName;
            await uploadFileOnS3(config.BUCKET_NAME, config.PROFILE_BUCKET_FOLDER, resourceName, image.mime, image.data);
        }
        payload.address = {
            address_line_1: payload.address_line_1,
            address_line_2: payload.address_line_2 || '',
            address_line_3: payload.address_line_3 || ''
        }
        payload.updatedBy = loggedInUser.user_id
        delete payload.address_line_1
        delete payload.address_line_2
        delete payload.address_line_3
        delete payload.client_id
        delete payload.user_id
        let clientDetails = await updateExistingClient(payload, clientId);
        if (!clientDetails || clientDetails.affected == 0) {
            return [404, ErrorResponse.ResourceNotFound];
        }
        return [
            200,
            {
                ok: true,
                message: MessageActions.UPDATE_CLIENT
            },
        ];
    } catch (err) {
        notifyBugsnag(err);
        if (err.code === ErrorCodes.dbReferenceError) {
            return [404, ErrorResponse.ResourceNotFound]    // Return 404 if any foreign key constraint is not available in DB
        } else {
            notifyBugsnag(err);
            return [500, err.message]
        }
    }
};

/**
 * Service to GET all the clients.
 */
export const getAllClientDetails = async (loggedInUser, data) => {
    try {
        let clientDetails = await getAllClients(loggedInUser, data.page || 1, data.limit || 10, data.sort_by || "client_name", data.sort_type || "asc");
        if (!clientDetails) {
            return [404, ErrorResponse.ResourceNotFound];
        }
        let count = 0;
        if (clientDetails.count) {
            count = parseInt(clientDetails.count);
        }
        return [200, {
            ok: true,
            count: count,
            client_details: clientDetails
        }];
    } catch (err) {
        notifyBugsnag(err);
        if (err.code === ErrorCodes.dbReferenceError) {
            return [404, ErrorResponse.ResourceNotFound]    // Return 404 if any foreign key constraint is not available in DB
        } else {
            notifyBugsnag(err);
            return [500, err.message]
        }
    }

}

/**
 * Service to GET the client details by ID.
 */
export const getClientDetailsById = async (clientId) => {
    try {
        if (!clientId) {
            return [400, ErrorResponse.BadRequestError];
        }
        let clientDetails = await getClientsById(clientId);
        if (!clientDetails) {
            return [404, ErrorResponse.ResourceNotFound];
        }
        let url: any;
        if (clientDetails.resource === null) {
            url = config.BUCKET_URL + "/" + config.PROFILE_BUCKET_FOLDER + "/" + config.DEFAULT_IMAGE;
        } else {
            url = clientDetails.resource;
        }
        let obj = {
            "id": parseInt(clientDetails.id),
            "name": clientDetails.name,
            "sector_id": parseInt(clientDetails.sector_id),
            "sector_name": clientDetails.sector_name,
            "address": JSON.parse(clientDetails.address),
            "post_code": clientDetails.post_code,
            "city": clientDetails.city,
            "country": clientDetails.country,
            "created_at": clientDetails.created_at,
            "profile_url": url
        }
        return [200, {
            ok: true,
            client_details: obj
        }];
    } catch (err) {
        notifyBugsnag(err);
        if (err.code === ErrorCodes.dbReferenceError) {
            return [404, ErrorResponse.ResourceNotFound]    // Return 404 if any foreign key constraint is not available in DB
        } else {
            notifyBugsnag(err);
            return [500, err.message]
        }
    }
}

/**
 * Service for fetching list of sectors
 */
export const getSectorsService = async () => {
    let sectorList = await getSectorsList();

    let response = [];

    sectorList.forEach((element) => {
        response.push({
            id: parseInt(element.id),
            name: element.value,
            key: element.key,
        });
    });

    return [
        200,
        {
            ok: true,
            sectors: response,
        },
    ];
};

/**
 * Service for GET list of client users.
 */
export const getClientUsersService = async (loggedInUser) => {
    let userDetails = await getAllUsers(loggedInUser);
    const whereClause = `user.id <> ${loggedInUser.user_id} AND user.clientId = ${userDetails.client_id} AND user.user_type_id IN (${UserType.CLIENT_SITE}, ${UserType.CLIENT_REGIONAL})`;
    let clientUsersDetails = await getClientUsersHelper(whereClause);
    clientUsersDetails = _.map(clientUsersDetails, (client) => {
        client.name = client.user_type_id == UserType.CLIENT_REGIONAL ? client.region_name : client.user_type_id == UserType.CLIENT_SITE ? client.site_name : "";
        client.verbose_id = client.user_type_id == UserType.CLIENT_REGIONAL ? client.region_id : client.user_type_id == UserType.CLIENT_SITE ? client.site_id : "";
        delete client.region_id;
        delete client.region_name;
        delete client.site_id;
        delete client.site_name;
        return client;
    })
    const response = _.size(clientUsersDetails) ? clientUsersDetails : [];
    return [
        200,
        {
            ok: true,
            users: response,
        },
    ];
}

/**
 * Service for adding the client users for site and region roles.
 */
export const addClientUsersService = async (payload, loggedInUser) => {
    try {
        let id: number;
        let company_name: any;
        if (payload.client_role === UserType.CLIENT_SITE) {
            //helper to add the client user and update the admin id of the site.
            let clientSiteUser = await addClientSiteUser(payload, loggedInUser);
            id = parseInt(clientSiteUser.id);
            company_name = clientSiteUser.company_name;

            await sendDefaultMessageTemplate(id);   // Send default template messages for site admin
        } else if (payload.client_role == UserType.CLIENT_REGIONAL) {
            let { admin_id } = await getRegionById(payload.id);
            if (admin_id) {
                return [409, ErrorResponse.AdminAlreadyAssignToRegion];
            }
            //Helper to add the client and update tha admin id of the region.
            let clientRegionUser = await addClientRegionUser(payload, loggedInUser);
            id = parseInt(clientRegionUser.id);
            company_name = clientRegionUser.company_name;
        } else if (!payload.id) {
            return [400, ErrorResponse.BadRequestError];
        } else {
            return [422, ErrorResponse.UnprocessableEntity]
        }

        //Email Authentication setup.
        const resetPasswordJwtToken = await jwt.sign(
            { user_id: id },
            config.JWT_TOKEN_KEY,
            {
                expiresIn: config.RESET_PASSWORD_LINK_EXPIRE_TIME,
            }
        );

        await addResetPasswordToken(resetPasswordJwtToken, id);

        let message = {
            toEmailId: payload.email,
            templateId: config.Sendgrid.INVITE_USER_EMAIL_TEMPLATE,
            dynamicTemplateData: {
                sender_name: loggedInUser.user_name,
                account_name: company_name,
                invitation_link:
                    config.PORTAL_HOST_URL +
                    RedirectURLs.RESET_PASSWORD +
                    "?type=set_password&code=" +
                    resetPasswordJwtToken,
            },
        };
        await sendTemplateEmail(message);
        return [201, { ok: true, user_id: id, message: MessageActions.CREATE_CLIENT_USER }]

    } catch (err) {
        notifyBugsnag(err);
        if (err.code === ErrorCodes.dbReferenceError) {
            return [404, ErrorResponse.ResourceNotFound]    // Return 404 if any foreign key constraint is not available in DB
        } else if (err.code === ErrorCodes.duplicateKeyError && payload.client_role === UserType.CLIENT_SITE) {
            return [409, ErrorResponse.AdminAlreadyAssignToSite]; // Return 409 if the admin is already assigned to other site
        } else if (err.code === ErrorCodes.duplicateKeyError && payload.client_role == UserType.CLIENT_REGIONAL) {
            return [409, ErrorResponse.AdminAlreadyAssignToRegion]; // Return 409 if the admin is already assigned to other region
        } else {
            notifyBugsnag(err);
            return [500, err.message]
        }
    }
}

/**
 * Service to updating the client users details.
 */
export const updateClientUserService = async (client_user_id, payload, loggedInUser) => {
    try {
        let data: any = {};
        //Updating only user details
        if (!payload.user_type_id && !payload.id) {
            data = {
                name: payload.name,
                mobile: payload.phone,
                countryCode: payload.country_code
            }
            await updateClientUserHelper(client_user_id, data);
        } else {
            //Assigning the admin to different site or different region.
            data = {
                name: payload.name,
                mobile: payload.phone,
                countryCode: payload.country_code
            }
            await updateClientUserHelper(client_user_id, data);
            //TODO: Check for current user_type of the user admin and site assigned.
            let whereClause = `user.id = ${client_user_id}`;
            let userDetails = await getClientUsersByIDHelper(whereClause);
            if (!userDetails) {
                return [404, ErrorResponse.ResourceNotFound]
            }
            let { user_type_id } = userDetails;
            if (parseInt(user_type_id) == parseInt(payload.user_type_id)) {
                if (parseInt(user_type_id) == UserType.CLIENT_REGIONAL) {
                    if (parseInt(userDetails.region_id) == parseInt(payload.id)) {
                        return [400, ErrorResponse.AssociationAlreadyExists]
                    }

                    //Revoking the existing region user if available.
                    let { admin_id } = await getRegionById(parseInt(payload.id));
                    if (admin_id) {
                        await updateUserHelper(admin_id, {
                            password: null,
                            updatedBy: loggedInUser.user_id,
                            updatedAt: new Date()
                        })
                    }
                    //Revoke the user credentials.
                    await updateUserHelper(client_user_id, {
                        password: null,
                        updatedBy: loggedInUser.user_id,
                        updatedAt: new Date()
                    })

                    //Update the region details.
                    if (parseInt(userDetails.region_id)) {
                        await updateRegion(parseInt(userDetails.region_id), {
                            adminId: null,
                            updatedBy: loggedInUser.user_id,
                            updatedAt: new Date()
                        });
                    }

                    //Update the Region details.
                    await updateRegion(parseInt(payload.id), {
                        adminId: parseInt(client_user_id),
                        updatedBy: loggedInUser.user_id,
                        updatedAt: new Date()
                    });

                } else {
                    //ToDo: Site-Admin reassignment to different site.
                    //Check if the association with the requested site exists.
                    if (parseInt(userDetails.site_id) == parseInt(payload.id)) {
                        return [400, ErrorResponse.AssociationAlreadyExists]
                    }
                    //Revoke the user details
                    await updateUserHelper(client_user_id, {
                        password: null,
                        updatedBy: loggedInUser.user_id,
                        updatedAt: new Date()
                    });

                    //Remove the existing User-Site Association.
                    await removeUserSiteAssociation(client_user_id, userDetails.site_id);

                    //Generate a new Association.
                    await generateUserSiteAssociation(client_user_id, parseInt(payload.id), loggedInUser.user_id)
                }
            } else {
                //Assigning region admin to site admin.
                if (parseInt(payload.user_type_id) === UserType.CLIENT_SITE) {

                    //Revoke and Update the user_type of the user to site admin from region admin.
                    await updateUserHelper(client_user_id, {
                        userTypeId: UserType.CLIENT_SITE,
                        password: null,
                        updatedBy: loggedInUser.user_id,
                        updatedAt: new Date()
                    })

                    //Update the region admin ID set admin ID to null.
                    await updateRegion(parseInt(userDetails.region_id), {
                        adminId: null,
                        updatedBy: loggedInUser.user_id,
                        updatedAt: new Date()
                    });

                    //Generate the association.
                    await generateUserSiteAssociation(client_user_id, parseInt(payload.id), loggedInUser.user_id);
                }
                //Assigning the site admin to region admin.
                else {
                    //Revoking the existing region admin.
                    let { admin_id } = await getRegionById(parseInt(payload.id));
                    if (admin_id) {
                        await updateUserHelper(admin_id, {
                            password: null,
                            updatedBy: loggedInUser.user_id,
                            updatedAt: new Date()
                        })
                    }

                    //Revoke the and update the user details.
                    await updateUserHelper(client_user_id, {
                        userTypeId: UserType.CLIENT_REGIONAL,
                        password: null,
                        updatedBy: loggedInUser.user_id,
                        updatedAt: new Date()
                    });

                    // Remove the site association
                    await removeUserSiteAssociation(client_user_id, userDetails.site_id);

                    //Update the Region details.
                    await updateRegion(parseInt(payload.id), {
                        adminId: parseInt(client_user_id),
                        updatedBy: loggedInUser.user_id,
                        updatedAt: new Date()
                    });
                }
            }
            //Email invitation setup.

            const resetPasswordJwtToken = await jwt.sign(
                { user_id: client_user_id },
                config.JWT_TOKEN_KEY,
                {
                    expiresIn: config.RESET_PASSWORD_LINK_EXPIRE_TIME,
                }
            );
            await addResetPasswordToken(resetPasswordJwtToken, client_user_id);
            let message = {
                toEmailId: userDetails.email,
                templateId: config.Sendgrid.INVITE_USER_EMAIL_TEMPLATE,
                dynamicTemplateData: {
                    sender_name: loggedInUser.user_name,
                    account_name: userDetails.client_name,
                    invitation_link:
                        config.PORTAL_HOST_URL +
                        RedirectURLs.RESET_PASSWORD +
                        "?type=set_password&code=" +
                        resetPasswordJwtToken,
                },
            };
            await sendTemplateEmail(message);
        }
        return [200, { ok: true, message: MessageActions.UPDATE_CLIENT_USER }]

    } catch (err) {
        notifyBugsnag(err);
        if (err.code === ErrorCodes.dbReferenceError) {
            return [404, ErrorResponse.ResourceNotFound] // Return 404 if any foreign key
        } else {
            notifyBugsnag(err);
            return [500, err.message]
        }
    }
}
