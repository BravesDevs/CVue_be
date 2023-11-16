/**
 * All the rate card related APIs.
 */

const express = require('express');
export const router = express.Router();

import { checkPermission } from './../middlewares/permission';
import { authorizeJwtToken } from './../middlewares/auth';
import { rateCard, UserType } from './../common';
import { createRateCard, updateRateCard, getRateCardList, rateCardDropDown } from '../api';

// APIs
router.route(rateCard.CREATE_AND_GET_LIST_OF_RATE_CARD)
    .post(authorizeJwtToken, checkPermission([UserType.CLIENT_SITE]), createRateCard)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_SITE, UserType.CLIENT_REGIONAL]), getRateCardList);

router.route(rateCard.UPDATE_RATE_CARD)
    .put(authorizeJwtToken, checkPermission([UserType.CLIENT_SITE]), updateRateCard);

router.route(rateCard.RATE_CARD_DROP_DOWN)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_SITE, UserType.CLIENT_REGIONAL]), rateCardDropDown);
