const express = require('express');
export const router = express.Router();

import { checkPermission } from './../middlewares/permission';
import { authorizeJwtToken } from './../middlewares/auth';
import { FeatureList, AccessType, user, UserType } from './../common';
import { createNewUser, getAdminUserDetails, getUsersList, updateUserProfile, resendInvitation, revokeUserProfileAccess } from '../api';
const upload = require("express-fileupload");

// APIs
router.route(user.ADD_NEW_USER)
    .post(authorizeJwtToken, createNewUser)
    .get(authorizeJwtToken, getUsersList)
    .put(authorizeJwtToken, upload(), updateUserProfile);

router.route(user.GET_ADMIN_USERS).get(authorizeJwtToken, getAdminUserDetails);
router.route(user.REVOKE_USER).put(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), revokeUserProfileAccess);
router.route(user.RESEND_INVITATION).post(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLEARVUE_ADMIN, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), resendInvitation);