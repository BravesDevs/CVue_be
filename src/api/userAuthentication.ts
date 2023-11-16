import { validateRequestData, notifyBugsnag } from './../utils';
import { UserLoginRequestSchema, RenewAccessTokenRequestSchema, ForgotPasswordRequestSchema,
    ResetPasswordRequestSchema } from './../common';
import { userLoginService, renewAccessTokenService, forgotPasswordService,
    resetPasswordService } from '../services'


/**
 * Renew access token as per the refresh-token
 * @param req Request
 * @param res Response
 */
 export const renewAccessToken = async (req, res, next) => {
    try {
        // Validate request body
        await validateRequestData(RenewAccessTokenRequestSchema, req.body);
        let response = await renewAccessTokenService(req.body.refresh_token);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};

/**
 * Login for the User
 * @param req Request
 * @param res Response
 */
export const userLogin = async (req, res, next) => {
    try {
        // Validate request body
        await validateRequestData(UserLoginRequestSchema, req.body);
        
        let response = await userLoginService(req.body);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};


/**
 * Forgot Password API. It will send email to the user to reset the password.
 * @param req Request
 * @param res Response
 */
 export const forgotPassword = async (req, res, next) => {
    try {
        // Validate request body
        await validateRequestData(ForgotPasswordRequestSchema, req.body);
        
        let response = await forgotPasswordService(req.body);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};



/**
 * Reset Password API. It will set user defined password and also set user status as verified.
 * @param req Request
 * @param res Response
 */
 export const resetPassword = async (req, res, next) => {
    try {
        // Validate request body
        await validateRequestData(ResetPasswordRequestSchema, req.body);
        
        let response = await resetPasswordService(req.body);
        res.status(response[0]).json(response[1]);
    } catch (err) {
        notifyBugsnag(err);
        next(err);
    }
};