import moment from "moment";
import { BookingStatus, ErrorCodes, ErrorResponse, MessageActions, UserType } from "../common";
import { config } from "../configurations";
import {
    createBookingAssociationHelper, createBookingHelper, getAllUsers, getBookingAssociationDetails,
    getBookingByAgencyHelper, getBookingByClientHelper, getBookingById, getbookingDetailsForEmail,
    getBookingHelper, getSiteById, updateBooking, updateBookingAssociationDetails, updateBookingHelper
} from "../models";
import { updateBookingStatusHelper } from "../models";
import { sendTemplateEmail, notifyBugsnag } from "../utils";
const _ = require("lodash");

/**
 * Service to create a booking.
 */
export const createBookingService = async (payload, loggedInUser) => {
    try {

        let agency_requested_heads = payload.agency_requested.map(object => object.total);

        if (agency_requested_heads.includes(0)) {
            return [400, ErrorResponse.InvalidWorkersAssignment]
        }

        let sum = 0;
        agency_requested_heads.forEach(x => {
            sum += x
        });

        if (payload.requested_total !== sum) {
            return [400, ErrorResponse.InvalidBookingWorkers]
        }


        // if(payload.requested_total !== )
        let dataArray = []
        let { client_id, name: client_user_name, email: client_user_email } = await getAllUsers(loggedInUser);
        let { region_id, name: site_name } = await getSiteById(payload.site_id);
        let data = {
            clientId: client_id,
            siteId: payload.site_id,
            regionId: region_id,
            shiftTypeId: payload.shift_type_id,
            departmentId: payload.department_id,
            startDate: payload.start_date,
            endDate: payload.end_date,
            requiredHeads: payload.required_heads,
            total: payload.requested_total,
            createdBy: loggedInUser.user_id,
            updatedBy: loggedInUser.user_id
        }
        dataArray.push(data);
        let days = 7;

        if (payload.repeat) {
            if (payload.repeat > config.MAX_REPEAT_BOOKING_ALLOWED) {
                return [400, ErrorResponse.InvalidRepeatBookingCount]
            }
            for (let i = 1; i <= parseInt(payload.repeat); i++) {
                let dataObj = _.cloneDeep(data)
                dataObj.startDate = moment(dataObj.startDate).add(days * i, 'd').format('YYYY-MM-DD');
                dataObj.endDate = moment(dataObj.endDate).add(days * i, 'd').format('YYYY-MM-DD');
                dataArray.push(dataObj);
            }
        }
        let bookingDetails = await createBookingHelper(dataArray);

        let arr = [];
        let agencyID = [];
        let obj = {};

        for (let i = 0; i < payload.agency_requested.length; i++) {
            agencyID.push(payload.agency_requested[i].agency_id)
            obj = {
                agencyId: payload.agency_requested[i].agency_id,
                requestedHeads: payload.agency_requested[i].requested_heads,
                requestedTotal: payload.agency_requested[i].total,
                bookingId: bookingDetails[0],
                createdBy: loggedInUser.user_id,
                updatedBy: loggedInUser.user_id
            }
            arr.push(obj);
        }

        let newArr = [];
        if (payload.repeat) {
            if (payload.repeat > config.MAX_REPEAT_BOOKING_ALLOWED) {
                return [400, ErrorResponse.InvalidRepeatBookingCount]
            }
            for (let k = 1; k <= parseInt(payload.repeat); k++) {
                for (let i = 0; i < arr.length; i++) {
                    obj = _.cloneDeep(arr[i]);
                    obj["bookingId"] = bookingDetails[k]
                    newArr.push(obj);
                }
            }
            arr = arr.concat(newArr);
        }


        let bookingAssociationDetails = await createBookingAssociationHelper(arr);
        if (!bookingAssociationDetails) {
            return [404, ErrorResponse.ResourceNotFound];
        }

        //Fetching the data for mailing the booking details.
        let whereClause = `booking.id IN (${bookingDetails}) and user.user_type_id = ${UserType.AGENCY_ADMIN}`;
        let details = await getbookingDetailsForEmail(whereClause);

        //Fetching the emails of the agency admin.
        const emails = details.map(({ email }) => email);

        //Fetching the start dates
        const startDates = details.map(({ start_date }) => {
            let date = moment(new Date(start_date)).format('DD MMMM, YYYY');
            return date;
        });

        //Fetching the end dates.
        const endDates = details.map(({ end_date }) => {
            let date = moment(new Date(end_date)).format('DD MMMM, YYYY');
            return date;
        });

        //Fetching the agency names
        const agency_name = details.map(({ agency_name }) => agency_name);

        //Fetching the client names.
        const client_name = details.map(({ client_name }) => client_name);
        ////TODO: Need to send the mail to the agencies.

        for (let i = 0; i < emails.length; i++) {
            let message = {
                toEmailId: emails[i],
                templateId: config.Sendgrid.BOOKING_NOTIFICATION_EMAIL_TEMPLATE,
                dynamicTemplateData: {
                    subject_line: `ClearVue | New Shift Booking Added`,
                    booking_message: `Dear ${agency_name[i]},
                    ${client_user_name} has requested new booking for ${agency_requested_heads[i]} worker(s) from (${startDates[i]} to ${endDates[i]}).`,
                    // booking_message: `${client_name[i]} has requested new booking (${startDates[i]} to ${endDates[i]}) from your agency ${agency_name[i]} on ClearVue.`,
                    invitation_link: config.PORTAL_HOST_URL + "/shift-booking"
                },
            };
            await sendTemplateEmail(message);
        }

        return [
            201,
            {
                ok: true,
                booking_id: _.map(bookingDetails, (id) => parseInt(id))
            },
        ];

    } catch (err) {
        if (err.code === ErrorCodes.duplicateKeyError) {
            return [409, ErrorResponse.ClientAlreadyExists]    // Return 409 if worker already exists
        } else if (err.code === ErrorCodes.dbReferenceError) {
            return [404, ErrorResponse.ResourceNotFound]    // Return 404 if any foreign key contraint is not available in DB
        }
        else if (err.error && err.error === "SENDGRID_BAD_REQUEST") {
            return [400, ErrorResponse.BookingEmailNotSent]
        }
        else {
            notifyBugsnag(err);
            return [500, err.message]
        }
    }
};

/**
 * Service to get the booking list.
 */
export const getBookingService = async (data, loggedInUser) => {
    try {
        let whereClause: string;
        let bookingDetails: any;
        let count: number = 0;
        if (loggedInUser.user_type_id == UserType.CLIENT_ADMIN) {
            whereClause = `bk.client_id = ${data.client_id}`;
            bookingDetails = await getBookingByClientHelper(whereClause, data.page || 1, data.limit || 10, data.sort_by || "bk.created_at", data.sort_type || "desc");
            count = bookingDetails["count"];
        }
        else if (loggedInUser.user_type_id == UserType.CLIENT_SITE) {
            whereClause = `bk.site_id = ${data.site_id}`;
            bookingDetails = await getBookingByClientHelper(whereClause, data.page || 1, data.limit || 10, data.sort_by || "bk.created_at", data.sort_type || "desc");
            count = bookingDetails["count"];
        }
        else {
            whereClause = `bk.client_id = ${data.client_id} AND ba.agency_id = ${data.agency_id}`;
            if (data.site_id) {
                whereClause = whereClause + ` AND bk.site_id = ${data.site_id}`
            } else if (data.region_id) {
                whereClause = whereClause + ` AND bk.region_id = ${data.region_id}`
            }

            bookingDetails = await getBookingByAgencyHelper(whereClause, data.page || 1, data.limit || 10, data.sort_by || "bk.created_at", data.sort_type || "desc");
            count = bookingDetails["count"];
            bookingDetails = _.map(bookingDetails, (booking) => {
                booking.fulfilled_total = booking.fulfilled_total > 0 ? booking.fulfilled_total : booking.fulfilled_total == null ? 0 : '';
                return booking;
            })
        }

        bookingDetails = _.map(bookingDetails, (booking) => {
            booking.verbose_status = BookingStatus[parseInt(booking.status)]
            return booking;
        })
        if (!bookingDetails) {
            return [200, {
                ok: true,
                "count": 0,
                "bookings": []
            }]
        }
        return [200, {
            ok: true,
            "count": count,
            "bookings": bookingDetails
        }]
    } catch (err) {
        if (err.code === ErrorCodes.duplicateKeyError) {
            return [409, ErrorResponse.ClientAlreadyExists]    // Return 409 if worker already exists
        } else if (err.code === ErrorCodes.dbReferenceError) {
            return [404, ErrorResponse.ResourceNotFound]    // Return 404 if any foreign key contraint is not available in DB
        } else {
            notifyBugsnag(err);
            return [500, err.message]
        }
    }
}

/**
 * Service to get the booking details
 */
export const getBookingDetailsService = async (data, booking_id, loggedInUser) => {
    //TODO: CREATE a helper class and create the query as per the user type.
    let whereClause: string;
    if (loggedInUser.user_type_id == UserType.CLIENT_ADMIN || loggedInUser.user_type_id == UserType.CLIENT_SITE) {
        whereClause = `booking.id = ${booking_id}`;
    }
    else {
        whereClause = `booking.clientId = ${data.client_id} AND booking_association.agencyId = ${data.agency_id} AND booking.id = ${booking_id}`;
        if (data.site_id) {
            whereClause = whereClause + ` AND booking.site_id = ${data.site_id}`
        } else if (data.region_id) {
            whereClause = whereClause + ` AND booking.region_id = ${data.region_id}`
        }
    }

    let bookingDetails = await getBookingHelper(whereClause);
    if (!bookingDetails) {
        return [200, {
            ok: true,
            "booking_details": []
        }]
    }
    return [200, {
        ok: true,
        "booking_details": bookingDetails
    }]
}

/**
 * Service to update the booking details.
 */
export const updateBookingDetailsService = async (id, data, loggedInUser) => {
    //TODO: CREATE a helper class and create the query as per the user type.
    try {
        //Fetching the agency id from the loggedIn user.
        let { agency_id } = await getAllUsers(loggedInUser);

        //Validation agency ID for the agency update is requested.
        let where = { agencyId: agency_id, bookingId: id }
        let associationDetails = await getBookingAssociationDetails(where);
        if (!associationDetails) {
            return [401, ErrorResponse.Unauthorized]
        }

        //Creating object to update.
        let obj = {
            fulfilledHeads: data.fulfilled_heads,
            fulfilledTotal: data.total,
            status: BookingStatus.FULFILLED,
            updatedBy: loggedInUser.user_id
        }

        //Updating the status of the booking in the booking table.
        let booking_status = { status: BookingStatus.FULFILLED }
        await updateBookingStatusHelper(id, booking_status)

        //Updating the booking association data.
        await updateBookingHelper(id, agency_id, obj)
        return [200, { ok: true, message: MessageActions.UPDATE_BOOKING }]

    } catch (err) {
        if (err.code === ErrorCodes.duplicateKeyError) {
            return [409, ErrorResponse.ClientAlreadyExists]    // Return 409 if worker already exists
        } else if (err.code === ErrorCodes.dbReferenceError) {
            return [404, ErrorResponse.ResourceNotFound]    // Return 404 if any foreign key contraint is not available in DB
        } else {
            notifyBugsnag(err);
            return [500, err.message]
        }
    }
}

/**
 * Service to cancel the booking.
 */
export const cancelBookingService = async (booking_id, data, loggedInUser) => {
    try {
        if (loggedInUser.user_type_id == UserType.AGENCY_ADMIN) {
            return [403, ErrorResponse.PermissionDenied]
        }
        let { id } = await getBookingById(booking_id)
        if (!id) {
            return [404, ErrorResponse.ResourceNotFound]
        }
        await updateBookingStatusHelper(booking_id, data);
        return [200, { ok: true, message: MessageActions.CANCEL_BOOKING }]

    } catch (err) {
        if (err.code === ErrorCodes.duplicateKeyError) {
            return [409, ErrorResponse.ClientAlreadyExists]    // Return 409 if worker already exists
        } else if (err.code === ErrorCodes.dbReferenceError) {
            return [404, ErrorResponse.ResourceNotFound]    // Return 404 if any foreign key contraint is not available in DB
        } else {
            notifyBugsnag(err);
            return [500, err.message]
        }
    }
}

/**
 * Service to amend the booking.
 */
export const updateBookingService = async (loggedInUser, data) => {
    try {
        //Fetching the association IDS from the Object
        let associationIds = _.map(data.booking_details, (object) => {
            return object.booking_association_id
        })
        let whereClause = `booking_association.id IN (${associationIds})`;
        let details = await getbookingDetailsForEmail(whereClause);

        // Data for booking association update.
        const dataUpdate = _.map(data.booking_details, (object) => {
            object["id"] = object.booking_association_id.toString();
            object["requestedHeads"] = object.requested_heads;
            object["requestedTotal"] = object.total_heads;
            object["status"] = BookingStatus.AMENDED;
            object["updatedBy"] = loggedInUser.user_id;
            delete object.booking_association_id;
            delete object.requested_heads;
            delete object.total_heads;
            return object;
        })
        await updateBookingAssociationDetails(dataUpdate)


        // Fetching the booking id for the associated booking id for booking details update.
        const dataObj = {
            id: details[0].booking_id.toString(),
            total: data.booking_total,
            status: BookingStatus.AMENDED,
            updatedBy: loggedInUser.user_id
        };

        await updateBooking(dataObj);

        // Generating the data to email the details to agency.
        const emails = details.map(({ email }) => email);
        const startDates = details.map(({ start_date }) => {
            let date = moment(new Date(start_date)).format('DD MMMM, YYYY');
            return date;
        });
        const endDates = details.map(({ end_date }) => {
            let date = moment(new Date(end_date)).format('DD MMMM, YYYY');
            return date;
        });
        const agency_name = details.map(({ agency_name }) => agency_name);
        const client_name = details.map(({ client_name }) => client_name);

        for (let i = 0; i < emails.length; i++) {
            let message = {
                toEmailId: emails[i],
                templateId: config.Sendgrid.BOOKING_NOTIFICATION_EMAIL_TEMPLATE,
                dynamicTemplateData: {
                    subject_line: `ClearVue | Shift Booking Amended`,
                    booking_message: `${client_name[i]} has amended a booking (${startDates[i]} to ${endDates[i]}) for your agency ${agency_name[i]} on ClearVue.`,
                    invitation_link: config.PORTAL_HOST_URL + "/shift-booking"
                },
            };
            await sendTemplateEmail(message);
        }

        return [
            200,
            {
                ok: true,
                message: MessageActions.UPDATE_BOOKING
            },
        ];

    } catch (err) {
        if (err.error && err.error === "SENDGRID_BAD_REQUEST") {
            return [400, ErrorResponse.BookingAmendEmailNotSent]
        }
        notifyBugsnag(err);
        return [500, err.message]
    }
}