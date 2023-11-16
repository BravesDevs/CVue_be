/**
 * All the custom errors with the status code for the same.
 */

import { config } from "../configurations";

export class GeneralError extends Error {
	error: string
	constructor(error: string, message: string) {
		super();
		this.message = message;
		this.error = error
	}

	getCode() {
		switch (true) {
			// Status code for the Custom Errors
			case this instanceof BadRequestError: return 400
			case this instanceof ResourceNotFoundError: return 404;
			case this instanceof UnauthorizedError: return 401;
			case this instanceof ForbiddenError: return 403;
			case this instanceof ConflictError: return 409;
			default: return 500;
		}
	}
}


// Declare and export Custom Errors
export class BadRequestError extends GeneralError { };
export class ResourceNotFoundError extends GeneralError { };
export class UnauthorizedError extends GeneralError { };
export class ForbiddenError extends GeneralError { };
export class ConflictError extends GeneralError { };
export class InternalServerError extends GeneralError { };


// Array of custom exceptions for which exception logs will be ignored.
const customExceptionsIgnoreLogsArray = [
	BadRequestError, UnauthorizedError, ForbiddenError, ResourceNotFoundError
];


/**
 * Check error log should be ignored or not.
 * @param  {any} err
 */
export const shouldIgnoreCustomeErrorLog = (err: any) => {
	for (let customException of customExceptionsIgnoreLogsArray) {
		if (err instanceof customException) return true;
	}
	return false;
};


/**
 * Error Responses
 */

export const ErrorResponse = {
	// Invalid JWT token
	Unauthorized: {
		"status": 401,
		"ok": false,
		"message": "Your session has expired. Please login again.",
		"error": "UNAUTHORIZED"
	},

	// Missing JWT token in request header
	Forbidden: {
		"status": 403,
		"ok": false,
		"message": "Request is missing required authorization.",
		"error": "PERMISSION_DENIED"
	},

	// Invalid Password for the user
	InvalidCredentials: {
		"status": 401,
		"ok": false,
		"message": "Wrong password. Try again or click Forgot password to reset it.",
		"error": "INVALID_CREDENTIAL_ERROR"
	},

	// Invalid Password for the user
	WorkerInvalidCredentials: {
		"status": 401,
		"ok": false,
		"message": "You have entered an invalid email or password.",
		"error": "INVALID_CREDENTIAL_ERROR"
	},

	// Email not found for the user
	UserNotFound: {
		"status": 404,
		"ok": false,
		"message": "Oops! Couldn't find your account.",
		"error": "USER_NOT_FOUND",
	},
	UserAccessRevoked: {
		"status": 403,
		"ok": false,
		"message": "Your account is revoked.",
		"error": "USER_ACCOUNT_REVOKED",
	},

	// resource not found
	ResourceNotFound: {
		"status": 404,
		"ok": false,
		"message": "Oops! Couldn't find the requested resource.",
		"error": "RESOURCE_NOT_FOUND",
	},

	// User does not have permission for this action
	PermissionDenied: {
		"status": 403,
		"ok": false,
		"message": "You are not authorized for this action",
		"error": "PERMISSION_DENIED",
	},

	// Missing required data
	BadRequestError: {
		"status": 400,
		"ok": false,
		"message": "Missing data for required fields.",
		"error": "BAD_REQUEST",
	},

	InvalidRepeatBookingCount: {
		"status": 400,
		"ok": false,
		"message": `Repeat more than ${config.MAX_REPEAT_BOOKING_ALLOWED} not allowed.`,
		"error": "BAD_REQUEST",
	},
	// For Duplicate worker
	WorkerAlreadyExists: {
		"status": 409,
		"ok": false,
		"message": "Requested worker is already exists.",
		"error": "WORKER_ALREADY_EXISTS"
	},

	ClientAlreadyExists: {
		"status": 409,
		"ok": false,
		"message": "Requested client is already exists.",
		"error": "CLIENT_ALREADY_EXISTS"
	},
	UserAlreadyExists: {
		"status": 409,
		"ok": false,
		"message": "Requested user is already exists.",
		"error": "USER_ALREADY_EXISTS"
	},

	RegionAlreadyExists: {
		"status": 409,
		"ok": false,
		"message": "Requested region is already exists.",
		"error": "REGION_ALREADY_EXISTS"
	},

	AdminAlreadyAssignToSite: {
		"status": 409,
		"ok": false,
		"message": "Admin is already assigned to other site.",
		"error": "ADMIN_ALREADY_ASSIGN_TO_SITE"
	},

	AdminAlreadyAssignToRegion: {
		"status": 409,
		"ok": false,
		"message": "Admin is already assigned to other region.",
		"error": "ADMIN_ALREADY_ASSIGN_TO_REGION"
	},

	// For invalid token for the password reset API
	InvalidResetPasswordCodeError: {
		'ok': false,
		'error': 'INVALID_PASSWORD_LINK',
		'message': "Reset password link is expired. Try again!",
		'status': 404,
	},
	UnprocessableEntity: {
		"status": 422,
		"ok": false,
		"message": "Invalid data for required fields.",
		"error": "UNPROCESSABLE_ENTITY",
	},
	AssociationAlreadyExists: {
		"status": 409,
		"ok": false,
		"message": "Requested association is already exists.",
		"error": "ASSOCIATION_ALREADY_EXISTS"
	},
	AssociationPermissionDenied: {
		"status": 403,
		"ok": false,
		"message": "You cannot create association for other client.",
		"error": "ASSOCIATION_PERMISSION_DENIED"
	},
	// For Duplicate worker email
	WorkerEmailAlreadyExists: {
		"status": 409,
		"ok": false,
		"message": "Requested worker email is already exists.",
		"error": "WORKER_EMAIL_ALREADY_EXISTS"
	},
	//
	FileAlreadyExists: {
		"status": 409,
		"ok": false,
		"message": "Data for the week already exists.",
		"error": "FILE_ALREADY_EXISTS"
	},
	DepartmentAlreadyExists: {
		"status": 409,
		"ok": false,
		"message": "Requested Department name is already exists.",
		"error": "DEPARTMENT_ALREADY_EXISTS"
	},
	ShiftAlreadyExists: {
		"status": 409,
		"ok": false,
		"message": "Requested Shift name is already exists.",
		"error": "SHIFT_ALREADY_EXISTS"
	},
	WorkerClockReportNotFound: {
		"status": 404,
		"ok": false,
		"message": "Oops! Couldn't find the worker clock report for the given week, please upload that first.",
		"error": "WORKER_CLOCK_REPORT_NOT_FOUND",
	},
	WorkerPasswordAlreadyExists: {
		"status": 409,
		"ok": false,
		"message": "You are already registered to the system. Please try to login to the system.",
		"error": "WORKER_ALREADY_EXISTS"
	},
	WorkerNotFound: {
		"status": 404,
		"ok": false,
		"message": "Oops! Couldn't find your account.",
		"error": "WORKER_NOT_FOUND",
	},
	// No workers available while sending the message
	WorkersNotFoundForSendingMessage: {
		"status": 404,
		"ok": false,
		"message": "Oops! There are no workers available to send message as per selected filters!",
		"error": "WORKERS_NOT_AVAILABLE",
	},
	InvalidBookingWorkers: {
		"status": 400,
		"ok": false,
		"message": `Please assign the remaining workers to another agency to complete the booking.`,
		"error": "BAD_REQUEST",
	},

	InvalidWorkersAssignment: {
		"status": 400,
		"ok": false,
		"message": `Error! Can not create booking if workers are not assigned to all agencies!`,
		"error": "BAD_REQUEST",
	},

	MessageNotFound: {
		"status": 400,
		"ok": false,
		"message": `Oops! Couldn't find message.`,
		"error": "MESSAGE_NOT_AVAILABLE",
	},

	CronJobUnauthorizedError: {
		"status": 401,
		"ok": false,
		"message": "Missing required authorization details.",
		"error": "UNAUTHORIZED"
	},

	NationalInsuranceNumberExistsError: {
		'ok': false,
		'error': 'NATIONAL_INSURANCE_NUMBER_EXISTS',
		'message': "National Insurance number exists",
		'status': 422,
	},
	// For Duplicate template name
	TemplateNameAlreadyExists: {
		"status": 409,
		"ok": false,
		"message": "Requested template name is already exists.",
		"error": "TEMPLATE_ALREADY_EXISTS"
	},
	SurveyAlreadyFilled: {
		"status": 409,
		"ok": false,
		"message": "Requested survey is already filled.",
		"error": "SURVEY_ALREADY_FILLED"
	},
	BookingEmailNotSent: {
		"status": 409,
		"ok": false,
		"message": "Booking is created successfully but emails are not sent.",
		"error": "BOOKING_EMAIL_NOT_SENT"
	},
	BookingAmendEmailNotSent: {
		"status": 409,
		"ok": false,
		"message": "Booking is amended but emails are not sent.",
		"error": "BOOKING_EMAIL_NOT_SENT"
	},
	UserInviteEmailNotSent: {
		"status": 409,
		"ok": false,
		"message": "User has been created but email is not sent. Please try again later to re-invite this user.",
		"error": "BOOKING_EMAIL_NOT_SENT"
	},
	ForgotPasswordEmailNotSent: {
		"status": 409,
		"ok": false,
		"message": "Forgot Password email is not sent. Please try again later.",
		"error": "BOOKING_EMAIL_NOT_SENT"
	},
	ResendInvitationEmailNotSent: {
		"status": 409,
		"ok": false,
		"message": "Resend invitation email is not sent. Please try again later.",
		"error": "BOOKING_EMAIL_NOT_SENT"
	},
	WorkerIsNotRegistered: {
		"status": 404,
		"ok": false,
		"message": "Thank you for downloading The ClearVue app. It looks like your agency haven't registered you yet. Please try again later or contact your agency representative.",
		"error": "WORKER_IS_NOT_REGISTERED",
	}
}
