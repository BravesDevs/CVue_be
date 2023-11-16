/**
 * All the user authentication related APIs.
 */
import { userAuthentication } from './../common';
import { userLogin, renewAccessToken, forgotPassword, resetPassword } from '../api';

const express = require('express');
export const router = express.Router();


// APIs
router.post(userAuthentication.LOG_IN, userLogin);
router.post(userAuthentication.RENEW_TOKEN, renewAccessToken);
router.post(userAuthentication.FORGOT_PASSWORD, forgotPassword);
router.post(userAuthentication.RESET_PASSWORD, resetPassword);
