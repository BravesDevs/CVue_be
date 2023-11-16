/**
 * All the agency related APIs.
 */

const express = require('express');
export const router = express.Router();

import { checkPermission } from './../middlewares/permission';
import { authorizeJwtToken } from './../middlewares/auth';
import { booking, UserType } from './../common';
import { createBooking, getBookings, getBookingDetails, updateBookingDetails, updateBooking } from '../api';

// APIs
router.route(booking.GET_OR_CREATE_BOOKING)
    .post(authorizeJwtToken, createBooking)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.AGENCY_ADMIN, UserType.CLIENT_SITE, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getBookings);

router.route(booking.GET_BOOKING_DETAILS)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.AGENCY_ADMIN, UserType.CLIENT_SITE, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getBookingDetails)

router.route(booking.UPDATE_BOOKING_DETAILS)
    .put(authorizeJwtToken, checkPermission([UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), updateBookingDetails)

router.route(booking.UPDATE_BOOKING)
    .put(authorizeJwtToken, checkPermission([UserType.CLIENT_SITE]), updateBooking)