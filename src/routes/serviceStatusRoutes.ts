/**
 * ALl the System status related routes..
 */

const express = require('express');
export const router = express.Router();

import { service_status } from '../utils';

router.get('/readiness', service_status);
router.get('/liveness', service_status);
router.get('/termination', service_status);
