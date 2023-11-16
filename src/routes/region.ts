const express = require('express');

import { region, UserType } from './../common';
import { authorizeJwtToken } from './../middlewares/auth';
import { checkPermission } from '../middlewares/permission';
import { addRegion, getRegionByClientId, updateRegion, getRegionDropDown } from '../api';

export const router = express.Router();

router.route(region.REGION).post(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN]), addRegion);
router.route(region.GET_REGION).get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getRegionByClientId);
router.route(region.DROPDOWN).get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.AGENCY_ADMIN, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getRegionDropDown);
router.route(region.UPDATE_REGION).put(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN]), updateRegion);
