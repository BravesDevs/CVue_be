
const express = require('express');

import { shift, UserType } from './../common';
import { addShift, getShifts, editShift } from '../api';
import { authorizeJwtToken } from './../middlewares/auth';
import { checkPermission } from '../middlewares/permission';


export const router = express.Router();

router.route(shift.SHIFT).post(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN]), addShift);
router.route(shift.SHIFT).get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.AGENCY_ADMIN, UserType.CLIENT_SITE, UserType.CLIENT_REGIONAL, UserType.AGENCY_REGIONAL, UserType.AGENCY_SITE]), getShifts);
router.route(shift.EDIT_SHIFT).put(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN]), editShift);
