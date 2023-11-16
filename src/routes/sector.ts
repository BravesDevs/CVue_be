/**
 * All the Sector related APIs.
 */

const express = require('express');
export const router = express.Router();

import { checkPermission } from './../middlewares/permission';
import { authorizeJwtToken } from './../middlewares/auth';
import { sector, UserType } from './../common';
import { createSector, updateSector, getSectorList } from '../api';

// APIs
router.route(sector.CREATE_AND_GET_LIST_OF_SECTOR)
    .post(authorizeJwtToken, checkPermission([UserType.CLEARVUE_ADMIN, UserType.CLIENT_ADMIN]), createSector)
    .get(authorizeJwtToken, checkPermission([UserType.CLEARVUE_ADMIN, UserType.CLIENT_ADMIN]), getSectorList);

router.route(sector.UPDATE_SECTOR)
    .put(authorizeJwtToken, checkPermission([UserType.CLEARVUE_ADMIN, UserType.CLIENT_ADMIN]), updateSector)