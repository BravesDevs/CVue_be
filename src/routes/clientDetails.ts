
const express = require('express');

import { clientDetails, UserType } from './../common';
import { addNewClients, updateClients, getSectors, getClientById, getClients, getClientUsers, addClientUsers, updateClientUsers, clientRatingsAPI, workerTypeWiseClientRatingsAPI } from '../api';
import { authorizeJwtToken } from './../middlewares/auth';
import { checkPermission } from '../middlewares/permission';
const upload = require("express-fileupload");


export const router = express.Router();

router.route(clientDetails.ADD_CLIENT)
    .post(authorizeJwtToken, checkPermission([UserType.CLEARVUE_ADMIN]), addNewClients);

router.route(clientDetails.GET_OR_UPDATE_CLIENT_DETAILS_BY_ID)
    .get(authorizeJwtToken, checkPermission([UserType.CLEARVUE_ADMIN, UserType.CLIENT_ADMIN, UserType.CLIENT_SITE, UserType.CLIENT_REGIONAL, UserType.AGENCY_REGIONAL, UserType.AGENCY_ADMIN, UserType.AGENCY_SITE]), getClientById)
    .put(authorizeJwtToken, checkPermission([UserType.CLEARVUE_ADMIN, UserType.CLIENT_ADMIN]), upload(), updateClients);

router.route(clientDetails.GET_CLIENT_DETAILS)
    .get(authorizeJwtToken, checkPermission([UserType.CLEARVUE_ADMIN, UserType.CLIENT_ADMIN, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getClients);

router.route(clientDetails.CLIENT_USERS)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN]), getClientUsers);

router.route(clientDetails.ADD_CLIENT_USERS)
    .post(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN]), addClientUsers);

router.route(clientDetails.UPDATE_CLIENT_USERS)
    .put(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN]), updateClientUsers)

router.route(clientDetails.SECTORS)
    .get(authorizeJwtToken, getSectors);

router.route(clientDetails.CLIENT_RATINGS)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), clientRatingsAPI);

router.route(clientDetails.TYPE_WISE_CLIENT_RATINGS)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN]), workerTypeWiseClientRatingsAPI);
