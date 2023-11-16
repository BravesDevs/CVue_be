/**
 * All the service layer methods for the Agency.
 */
const _ = require('lodash');
import { config } from "./../configurations";
import { CreateAgencyDTO, ErrorResponse, ErrorCodes } from "./../common";
import {
    createAgency, updateAgency, getAgencyList, getAgencyById, getAssociatedAgencies,
    getDashboardAgencyRatingsHelper, getAgencyRatingsWithLabelHelper, getAverageAgencyRatings, getAgencyWiseReviewsCount,
    addAgencySiteUser, addResetPasswordToken, getRegionById, addAgencyRegionUser, updateAgencyUserHelper, getAgencyUsersByIDHelper, updateUserHelper, updateRegion, removeUserSiteAssociation, generateUserSiteAssociation, getAllUsers, getClientUsersHelper
} from "./../models";
import { uploadFileOnS3, sendTemplateEmail, notifyBugsnag } from "../utils";
import { MessageActions, UserType, RedirectURLs } from "./../common";
import { sendDefaultMessageTemplate } from "./messages";
const jwt = require("jsonwebtoken");

/**
 * create agency.
 * @param  {CreateAgencyDTO} payload
 */
export const createAgencyService = async (payload: CreateAgencyDTO, loggedInUser) => {
    const agencyPayload = {
        name: payload.name,
        city: payload.city,
        country: payload.country,
        postCode: payload.postCode,
        address: {
            address_line_1: payload.address_line_1,
            address_line_2: payload.address_line_2 || '',
            address_line_3: payload.address_line_3 || '',
        },
        createdBy: loggedInUser.user_id,
        updatedBy: loggedInUser.user_id,
    }
    let agency = await createAgency(agencyPayload);
    return [201, {
        ok: true,
        message: MessageActions.CREATE_AGENCY,
        agency_id: agency.id,
    }];
};

/**
 * update agency.
 * @param id
 * @param  {UpdateAgencyDTO} payload
 * @param loggedInUser
 * @param image
 */
export const updateAgencyService = async (id, payload, loggedInUser, image) => {
    let agencytoUpdate = await getAgencyById(id);

    if (!agencytoUpdate) {
        return [404, ErrorResponse.ResourceNotFound];
    }
    if (payload.profile && (payload.profile === "null")) {
        delete payload.profile
    } else if (image) {
        let resourceName = "AGENCY" + id + image.extension;
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

    let agency = await updateAgency(id, payload);
    return [200, {
        ok: true,
        message: MessageActions.UPDATE_AGENCY,
        agency_id: agency.id
    }];
};

/**
 * get agency list.
 * @param loggedInUser
 * @param data
 */
export const getAgencyListService = async (loggedInUser, data) => {

    let agencyList = await getAgencyList(loggedInUser, data.page || 1, data.limit || 10, data.sort_by || "agency_name", data.sort_type || "asc");
    let count = 0;
    if (agencyList.count) {
        count = parseInt(agencyList.count);
        agencyList = _.map(agencyList, (object) => {
            object.association_id = parseInt(object.association_id);
            object.agency_id = parseInt(object.agency_id);
            object.address = JSON.parse(object.address);
            return object;
        })
    }

    return [200, {
        "ok": true,
        "count": count,
        "agency_list": agencyList
    }];
};

/**
 * get agency by id.
 * @param id
 */
export const getAgencyByIdService = async (id: string) => {

    let agency = await getAgencyById(id);
    let url: any;
    if (agency.resource == null) {
        url = config.BUCKET_URL + "/" + config.PROFILE_BUCKET_FOLDER + "/" + config.DEFAULT_IMAGE;
    } else {
        url = agency.resource;
    }
    delete agency.resource;
    agency.address = JSON.parse(agency.address);
    agency.profile_url = url
    return [200, {
        "ok": true,
        "agency": agency
    }];
};


/**
 * Agency Ratings Service.
 * @param data
 * @param loggedInUser
 */
export const agencyRatingsService = async (data, loggedInUser) => {
    if (!_.size(data)) {
        return [400, ErrorResponse.BadRequestError]
    }
    let { client_id, agency_id } = data;
    let response: any;
    let whereClause1 = `survey_question.belongs_to='AGENCY'`
    let whereClause2: string = 'survey_result.rating is not null AND ';
    if (client_id && !agency_id) {
        //Get List of associated agencies.
        // let agencies = await getAssociatedAgencies(client_id);
        // if (_.size(agencies)) {
        // let agencyIdList = agencies.map(element => parseInt(element.agencyId));
        whereClause2 += `survey_result.client_id=${client_id}`
        // }
        // else {
        //     return [200, {
        //         "ok": true,
        //         "average_rating": 0,
        //         "reviews_count": 0,
        //         "label_wise_ratings": [{
        //             "label": "Role Expectations",
        //             "ratings": "0.0"
        //         },
        //         {
        //             "label": "Leadership",
        //             "ratings": "0.0"
        //         },
        //         {
        //             "label": "Engagement",
        //             "ratings": "0.0"
        //         },
        //         {
        //             "label": "Payroll",
        //             "ratings": "0.0"
        //         },
        //         {
        //             "label": "Identification",
        //             "ratings": "0.0"
        //         }]
        //     }]
        // }
    }
    //Ratings for the agency admin dashboard with client id.
    else if (client_id && agency_id) {
        //Get agency wise ratings
        whereClause2 += `survey_result.client_id=${client_id} AND survey_result.agency_id = ${agency_id}`;
    }
    else {
        whereClause2 += `survey_result.agency_id = ${agency_id}`;
    }
    response = await getDashboardAgencyRatingsHelper(whereClause1, whereClause2);
    let reviews_count = response.reviews_count.map(object => parseInt(object.reviews_count));
    let { average_rating, label_wise_ratings } = response;

    return [200, {
        "ok": true,
        average_rating: parseFloat(average_rating.ratings),
        reviews_count: _.sum(reviews_count),
        label_wise_ratings
    }]
};


/**
 * Agency Ratings Service.
 * @param data
 * @param loggedInUser
 */
export const detailedAgencyRatingsService = async (data, loggedInUser) => {
    if (!_.size(data)) {
        return [400, ErrorResponse.BadRequestError]
    }
    let agencyWiseRatings: any;
    let agencies = await getAssociatedAgencies(data.client_id);
    if (_.size(agencies)) {
        let agencyIdList = agencies.map(element => parseInt(element.agencyId));
        let whereClause = `survey_result.rating is not null AND survey_question.belongs_to='AGENCY' AND survey_result.agency_id IN (${agencyIdList}) AND survey_result.client_id=${data.client_id}`;
        agencyWiseRatings = await getAgencyRatingsWithLabelHelper(whereClause);
        let agencyWiseAverageRatings = await getAverageAgencyRatings(whereClause);
        let agencyWiseReviewsCount = await getAgencyWiseReviewsCount(whereClause);

        let grouped = _.groupBy(agencyWiseRatings, object => object.agency_name);

        let response: any = []

        Object.keys(grouped).forEach(key => {
            let reviewsCount = [];
            reviewsCount = grouped[key].map(object => parseInt(object.reviews_count))
            let label_wise_ratings = grouped[key].map(object => { return { "label": object.label, "ratings": object.ratings } })
            let obj = agencyWiseReviewsCount.find(o => o.agency_id === grouped[key][0].agency_id);
            response.push({
                name: key,
                reviews_count: parseInt(obj.reviews_count),
                average_rating: parseFloat(agencyWiseAverageRatings.find(object => object.agency_name === key).ratings),
                label_wise_ratings
            })
        })

        return [200, { ok: true, 'ratings': response || [] }]
    }
    else {
        return [200, { ok: true, ratings: {} }]
    }
};

/**
 * Service for adding the agency admin users.
 */
export const addAgencyUsersService = async (payload, loggedInUser) => {
    try {
        let id: number;
        let company_name: any;
        if (payload.client_role === UserType.AGENCY_SITE) {
            //helper to add the agency user and update the admin id of the site.
            let agencySiteUser = await addAgencySiteUser(payload, loggedInUser);
            id = parseInt(agencySiteUser.id);
            company_name = agencySiteUser.company_name;

            await sendDefaultMessageTemplate(id);   // Send default template messages for agency site admin
        } else if (payload.client_role == UserType.AGENCY_REGIONAL) {
            let { agency_region_admin_id } = await getRegionById(payload.id);
            if (agency_region_admin_id) {
                return [409, ErrorResponse.AdminAlreadyAssignToRegion];
            }
            //Helper to add the agency user and update tha admin id of the region.
            let agencyRegionUser = await addAgencyRegionUser(payload, loggedInUser);
            id = parseInt(agencyRegionUser.id);
            company_name = agencyRegionUser.company_name;

            await sendDefaultMessageTemplate(id);   // Send default template messages for agency regional admin
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
        return [201, { ok: true, user_id: id, message: MessageActions.CREATE_USER }]

    } catch (err) {
        notifyBugsnag(err);
        if (err.code === ErrorCodes.dbReferenceError) {
            return [404, ErrorResponse.ResourceNotFound]    // Return 404 if any foreign key constraint is not available in DB
        } else if (err.code === ErrorCodes.duplicateKeyError && payload.client_role === UserType.AGENCY_SITE) {
            return [409, ErrorResponse.AdminAlreadyAssignToSite]; // Return 409 if the admin is already assigned to other site
        } else if (err.code === ErrorCodes.duplicateKeyError && payload.client_role == UserType.AGENCY_REGIONAL) {
            return [409, ErrorResponse.AdminAlreadyAssignToRegion]; // Return 409 if the admin is already assigned to other region
        } else {
            notifyBugsnag(err);
            return [500, err.message]
        }
    }
}

/**
 * Service to updating the agency users details.
 */
export const updateAgencyUserService = async (agency_user_id, payload, loggedInUser) => {
    try {
        let data: any = {};
        //Updating only user details
        if (!payload.user_type_id && !payload.id) {
            data = {
                name: payload.name,
                mobile: payload.phone,
                countryCode: payload.country_code
            }
            await updateAgencyUserHelper(agency_user_id, data);
        } else {
            //Assigning the admin to different site or different region.
            data = {
                name: payload.name,
                mobile: payload.phone,
                countryCode: payload.country_code
            }
            await updateAgencyUserHelper(agency_user_id, data);
            //TODO: Check for current user_type of the user admin and site assigned.
            let whereClause = `user.id = ${agency_user_id}`;
            let userDetails = await getAgencyUsersByIDHelper(whereClause);
            if (!userDetails) {
                return [404, ErrorResponse.ResourceNotFound]
            }
            let { user_type_id } = userDetails;
            if (parseInt(user_type_id) == parseInt(payload.user_type_id)) {
                if (parseInt(user_type_id) == UserType.AGENCY_REGIONAL) {
                    if (parseInt(userDetails.region_id) == parseInt(payload.id)) {
                        return [400, ErrorResponse.AssociationAlreadyExists]
                    }

                    //Revoking the existing region user if available.
                    let { agency_region_admin_id } = await getRegionById(parseInt(payload.id));
                    if (agency_region_admin_id) {
                        await updateUserHelper(agency_region_admin_id, {
                            password: null,
                            updatedBy: loggedInUser.user_id,
                            updatedAt: new Date()
                        })
                    }
                    //Revoke the user credentials.
                    await updateUserHelper(agency_user_id, {
                        password: null,
                        updatedBy: loggedInUser.user_id,
                        updatedAt: new Date()
                    })

                    //Update the region details.
                    if (parseInt(userDetails.region_id)) {
                        await updateRegion(parseInt(userDetails.region_id), {
                            agencyRegionAdminId: null,
                            updatedBy: loggedInUser.user_id,
                            updatedAt: new Date()
                        });
                    }

                    //Update the Region details.
                    await updateRegion(parseInt(payload.id), {
                        agencyRegionAdminId: parseInt(agency_user_id),
                        updatedBy: loggedInUser.user_id,
                        updatedAt: new Date()
                    });

                } else {
                    //ToDo: Agency-Site-Admin reassignment to different site.
                    //Check if the association with the requested site exists.
                    if (parseInt(userDetails.site_id) == parseInt(payload.id)) {
                        return [400, ErrorResponse.AssociationAlreadyExists]
                    }
                    //Revoke the user details
                    await updateUserHelper(agency_user_id, {
                        password: null,
                        updatedBy: loggedInUser.user_id,
                        updatedAt: new Date()
                    });

                    //Remove the existing User-Site Association.
                    await removeUserSiteAssociation(agency_user_id, userDetails.site_id);

                    //Generate a new Association.
                    await generateUserSiteAssociation(agency_user_id, parseInt(payload.id), loggedInUser.user_id)
                }
            } else {
                //Assigning region admin to site admin.
                if (parseInt(payload.user_type_id) === UserType.AGENCY_SITE) {

                    //Revoke and Update the user_type of the user to site admin from region admin.
                    await updateUserHelper(agency_user_id, {
                        userTypeId: UserType.AGENCY_SITE,
                        password: null,
                        updatedBy: loggedInUser.user_id,
                        updatedAt: new Date()
                    })

                    //Update the region admin ID set admin ID to null.
                    await updateRegion(parseInt(userDetails.region_id), {
                        agencyRegionAdminId: null,
                        updatedBy: loggedInUser.user_id,
                        updatedAt: new Date()
                    });

                    //Generate the association.
                    await generateUserSiteAssociation(agency_user_id, parseInt(payload.id), loggedInUser.user_id);
                }
                //Assigning the site admin to region admin.
                else {
                    //Revoking the existing region admin.
                    let { agency_region_admin_id } = await getRegionById(parseInt(payload.id));
                    if (agency_region_admin_id) {
                        await updateUserHelper(agency_region_admin_id, {
                            password: null,
                            updatedBy: loggedInUser.user_id,
                            updatedAt: new Date()
                        })
                    }

                    //Revoke the and update the user details.
                    await updateUserHelper(agency_user_id, {
                        userTypeId: UserType.AGENCY_REGIONAL,
                        password: null,
                        updatedBy: loggedInUser.user_id,
                        updatedAt: new Date()
                    });

                    // Remove the site association
                    await removeUserSiteAssociation(agency_user_id, userDetails.site_id);

                    //Update the Region details.
                    await updateRegion(parseInt(payload.id), {
                        agencyRegionAdminId: parseInt(agency_user_id),
                        updatedBy: loggedInUser.user_id,
                        updatedAt: new Date()
                    });
                }
            }
            //Email invitation setup.

            const resetPasswordJwtToken = await jwt.sign(
                { user_id: agency_user_id },
                config.JWT_TOKEN_KEY,
                {
                    expiresIn: config.RESET_PASSWORD_LINK_EXPIRE_TIME,
                }
            );
            await addResetPasswordToken(resetPasswordJwtToken, agency_user_id);
            let message = {
                toEmailId: userDetails.email,
                templateId: config.Sendgrid.INVITE_USER_EMAIL_TEMPLATE,
                dynamicTemplateData: {
                    sender_name: loggedInUser.user_name,
                    account_name: userDetails.agency_name,
                    invitation_link:
                        config.PORTAL_HOST_URL +
                        RedirectURLs.RESET_PASSWORD +
                        "?type=set_password&code=" +
                        resetPasswordJwtToken,
                },
            };
            await sendTemplateEmail(message);
        }
        return [200, { ok: true, message: MessageActions.UPDATE_USER }]

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

/**
 * Service for GET list of agency users.
 */
export const getAgencyUsersService = async (data, loggedInUser) => {
    let userDetails = await getAllUsers(loggedInUser);
    const whereClause = `user.clientId = ${data.client_id} AND user.agencyId = ${userDetails.agency_id} AND user.user_type_id IN (${UserType.AGENCY_SITE}, ${UserType.AGENCY_REGIONAL})`;
    let agencyUsersDetails = await getClientUsersHelper(whereClause);

    agencyUsersDetails = _.map(agencyUsersDetails, (agency) => {
        agency.name = agency.user_type_id == UserType.AGENCY_REGIONAL ? agency.region_name : agency.user_type_id == UserType.AGENCY_SITE ? agency.site_name : "";
        agency.verbose_id = agency.user_type_id == UserType.AGENCY_REGIONAL ? agency.region_id : agency.user_type_id == UserType.AGENCY_SITE ? agency.site_id : "";
        delete agency.region_id;
        delete agency.region_name;
        delete agency.site_id;
        delete agency.site_name;
        return agency;
    })
    const response = _.size(agencyUsersDetails) ? agencyUsersDetails : [];
    return [
        200,
        {
            ok: true,
            users: response,
        },
    ];
}
