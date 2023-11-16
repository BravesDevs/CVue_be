import { updateBookingForSiteAdminSchema, createBookingSchema, getBookingSchema, updateBookingByAgencySchema, workerProfileSchema } from "../common";
import { createBookingService, getBookingService, getBookingDetailsService, updateBookingDetailsService, updateBookingService } from "../services";
import { validateRequestData, notifyBugsnag } from "../utils";


/**
 * API to add create booking.
 * @param req Request
 * @param res Response
 */
export const createBooking = async (req, res, next) => {
    try {
        await validateRequestData(createBookingSchema, req.body);
        let response = await createBookingService(req.body, req.user);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};


/**
 * Listing for agency
 * Listing for site admin
 * Listing for client admin
 * @param req
 * @param res
 * @param next
 */
export const getBookings = async (req, res, next) => {
    try {
        await validateRequestData(getBookingSchema, req.query);
        let response = await getBookingService(req.query, req.user);
        res.status(response[0]).json(response[1]);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * Booking Details for the agency admin user
 * Listing for site admin user
 * Listing for client admin user
 * @param req
 * @param res
 * @param next
 */
export const getBookingDetails = async (req, res, next) => {
    try {
        await validateRequestData(getBookingSchema, req.query);
        let response = await getBookingDetailsService(req.query, req.params.id, req.user);
        res.status(response[0]).json(response[1]);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * Amend booking details by agency.
 * @param req
 * @param res
 * @param next
 */
export const updateBookingDetails = async (req, res, next) => {
    try {
        await validateRequestData(workerProfileSchema, req.params)
        await validateRequestData(updateBookingByAgencySchema, req.body);
        let response = await updateBookingDetailsService(req.params.id, req.body, req.user);
        res.status(response[0]).json(response[1]);
    }
    catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}

/**
 * API for booking cancellation
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
export const updateBooking = async (req, res, next) => {
    try {
        await validateRequestData(updateBookingForSiteAdminSchema, req.body);
        let response = await updateBookingService(req.user, req.body);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
}