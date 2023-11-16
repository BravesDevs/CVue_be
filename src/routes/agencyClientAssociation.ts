/**
 * All the agency related APIs.
 */

const express = require('express');
export const router = express.Router();

import { checkPermission } from './../middlewares/permission';
import { authorizeJwtToken } from './../middlewares/auth';
import { agencyClientAssociation, UserType } from './../common';
import { createAgencyAssociation, updateAgencyAssociation, getAgencyAssociationList } from '../api';

// APIs
router.route(agencyClientAssociation.CREATE_AND_GET_LIST_OF_ASSOCIATION)
    .post(authorizeJwtToken, checkPermission([UserType.CLEARVUE_ADMIN, UserType.CLIENT_ADMIN]), createAgencyAssociation)
    .get(authorizeJwtToken, checkPermission([UserType.CLEARVUE_ADMIN, UserType.CLIENT_ADMIN, UserType.AGENCY_ADMIN]), getAgencyAssociationList);

router.route(agencyClientAssociation.UPDATE_ASSOCIATION)
    .put(authorizeJwtToken, checkPermission([UserType.CLEARVUE_ADMIN, UserType.CLIENT_ADMIN]), updateAgencyAssociation);
