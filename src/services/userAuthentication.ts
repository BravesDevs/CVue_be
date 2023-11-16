/**
 * All the service layer methods for the User and its authentication.
 */
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const deepClone = require('lodash.clonedeep');
import { config } from "./../configurations";
import {
	LoginUserDTO, ErrorResponse, ForgotPasswordDTO, RedirectURLs,
	ResetPasswordDTO, bcryptSaltRound, UserType
} from "./../common";
import {
	getUserByEmail, getPermissionsByUserType, updatePasswordAndVerificationStatus,
	addResetPasswordToken, removeResetPasswordToken
} from "./../models";
import { verifyJwtToken, sendTemplateEmail, notifyBugsnag } from "../utils";

/**
 * Renew access token
 * @param  {string} refresh_token
 */
export const renewAccessTokenService = async (refresh_token: string) => {

	let tokenData = verifyJwtToken(refresh_token);

	if (tokenData) {
		return [200, {
			ok: true,
			access_token: await jwt.sign(
				tokenData,
				config.JWT_TOKEN_KEY,
				{
					expiresIn: config.USER_ACCESS_TOKEN_EXPIRE_TIME,
				}
			),
		}];
	}
	return [401, ErrorResponse.InvalidCredentials];
};


/**
 * Login user to the system.
 * @param  {LoginUserDTO} payload
 */
export const userLoginService = async (payload: LoginUserDTO) => {
	try {

		let userDetails = await getUserByEmail(payload.email);

		if (!userDetails) {
			return [404, ErrorResponse.UserNotFound];
		}

		if (parseInt(userDetails.userTypeId) === UserType.AGENCY_WORKER) {
			return [403, ErrorResponse.PermissionDenied]
		}

		if (userDetails.password === null && !userDetails.isVerified) {
			return [401, ErrorResponse.InvalidCredentials];
		}
		if (userDetails.password === null && userDetails.isVerified) {
			return [403, ErrorResponse.UserAccessRevoked];
		}

		if (await bcrypt.compareSync(payload.password, userDetails.password)) {

			// User data to be set into the JWT token. Add other user details which needs to be set into the JWT token
			let jwtUerData = {
				user_id: userDetails.id,
				user_type_id: userDetails.userTypeId,
				user_name: userDetails.name,
				client_id: userDetails.clientId
			}
			const permissions = await getPermissionsByUserType(userDetails.userTypeId)

			return [200, {
				ok: true,
				user_id: userDetails.id,
				permissions: permissions,
				user_type: userDetails.clientId ? "client" : (userDetails.agencyId ? "agency" : ""),
				client_id: userDetails.clientId ? parseInt(userDetails.clientId) : null,
				agency_id: userDetails.agencyId ? parseInt(userDetails.agencyId) : null,

				access_token: await jwt.sign(
					jwtUerData,
					config.JWT_TOKEN_KEY,
					{
						expiresIn: config.USER_ACCESS_TOKEN_EXPIRE_TIME,
					}
				),

				refresh_token: await jwt.sign(
					jwtUerData,
					config.JWT_TOKEN_KEY,
					{
						expiresIn: config.USER_REFRESH_TOKEN_EXPIRE_TIME,
					}
				)
			}];
		}

		return [401, ErrorResponse.InvalidCredentials];
	} catch (error) {
		notifyBugsnag(error);
		return [500, error.message]
	}
};


/**
 * Forgot password service layer.
 * API will validate the email and then send email to the user with reset password link.
 * @param  {ForgotPasswordDTO} payload
 */
export const forgotPasswordService = async (payload: ForgotPasswordDTO) => {
	try {
		let userDetails = await getUserByEmail(payload.email);

		// Return 
		if (!userDetails) {
			return [404, ErrorResponse.UserNotFound];
		}
		if (userDetails.password === null && userDetails.isVerified) {
			return [403, ErrorResponse.UserAccessRevoked];
		}

		const resetPasswordJwtToken = await jwt.sign(
			{ user_id: userDetails.id },
			config.JWT_TOKEN_KEY,
			{
				expiresIn: config.RESET_PASSWORD_LINK_EXPIRE_TIME,
			}
		)
		let resetPasswordUrl = config.PORTAL_HOST_URL + RedirectURLs.RESET_PASSWORD + "?type=forgot_password&code=" + resetPasswordJwtToken;

		if (userDetails.nationalInsuranceNumber != null) {
			resetPasswordUrl += "&is_worker=true"
		}

		await addResetPasswordToken(resetPasswordJwtToken, parseInt(userDetails.id));

		let message = {
			toEmailId: payload.email,
			templateId: config.Sendgrid.FORGOT_PASSWORD_EMAIL_TEMPLATE,
			dynamicTemplateData: {
				"reset_password_url": resetPasswordUrl,
				"user_name": userDetails.name
			},
		}

		await sendTemplateEmail(message);

		return [200, {
			ok: true
		}]
	} catch (err) {
		notifyBugsnag(err);
		if (err.error && err.error === "SENDGRID_BAD_REQUEST") {
			return [400, ErrorResponse.ForgotPasswordEmailNotSent]
		}
		return [500, err.message]
	}
};


/**
 * Reset password service layer. It will also work for setting new password after user signup.
 * API will set user provided password and verification status to true.
 * @param  {ResetPasswordDTO} payload
 */
export const resetPasswordService = async (payload: ResetPasswordDTO) => {

	let tokenData = verifyJwtToken(payload.code);

	if (!tokenData) {
		let errorResponse = await deepClone(ErrorResponse.InvalidCredentials);
		errorResponse.message = "Unauthorized code is provided.";
		return [401, errorResponse];
	}

	let queryResponse = await removeResetPasswordToken(payload.code);

	if (!queryResponse.affected) {
		return [404, ErrorResponse.InvalidResetPasswordCodeError]
	}

	let salt = bcrypt.genSaltSync(bcryptSaltRound);
	let encodedPassword = bcrypt.hashSync(payload.password, salt);

	let response = await updatePasswordAndVerificationStatus(tokenData.user_id, encodedPassword);

	return response ? [200, {
		ok: true
	}] : [404, ErrorResponse.UserNotFound]
};
