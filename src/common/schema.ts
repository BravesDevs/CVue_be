/**
 * All the validation related Schema.
 */

const JoiBase = require('joi');
const JoiDateExtension = require('@joi/date');
const Joi = JoiBase.extend(JoiDateExtension);
import { dateTimeFormates, workerTableAllowedSortingFields, bookingListingAllowedFields, payrollDataAllowedSortingFields } from "../common/constants";
import {
    MessageType, MessageBodyContentType, MessageReceiverGroups, WorkerSideMessagesType,
    WorkerSideMessagesScreenViewType, FaqUrlType
} from "./enum"


export const UserLoginRequestSchema = Joi.object({
    email: Joi.string().email().min(1).required(),
    password: Joi.string().min(8).required(),
}).options({ abortEarly: false, allowUnknown: true })

export const RenewAccessTokenRequestSchema = Joi.object({
    refresh_token: Joi.string().min(1).required(),
}).options({ abortEarly: false, allowUnknown: true })


export const AddNewClientSchema = Joi.object({
    name: Joi.string().min(1).required(),
    address_line_1: Joi.string().min(1).required(),
    address_line_2: Joi.string().allow(null, ''),
    address_line_3: Joi.string().allow(null, ''),
    city: Joi.string().min(1).pattern(/^[aA-zZ\s]+$/).error(new Error('Only alphabets are allowed for the field city.')).required(),
    country: Joi.string().min(1).required(),
    sectorId: Joi.number().min(1).required(),
    postCode: Joi.string().uppercase().alphanum().allow(null, '')

}).options({ abortEarly: false, allowUnknown: true })

export const ForgotPasswordRequestSchema = Joi.object({
    email: Joi.string().email().min(1).required(),
}).options({ abortEarly: false, allowUnknown: true })

export const AddAndUpdateRegionSchema = Joi.object({
    name: Joi.string().min(1).required(),
    client_id: Joi.number().min(1).required(),
}).options({ abortEarly: false, allowUnknown: true })

export const timeAndAttendanceIdsSchema = Joi.object({
    client_id: Joi.number().min(1).required(),
    site_id: Joi.string().min(1).required(),
    agency_id: Joi.string().min(1).required(),
    start_date: Joi.date().format(dateTimeFormates.YYYYMMDD).raw().required(),
    end_date: Joi.date().format(dateTimeFormates.YYYYMMDD).raw().required(),
    week: Joi.number().required()
}).options({ abortEarly: false, allowUnknown: true })

export const payrollReportBodySchema = Joi.object({
    client_id: Joi.number().min(1).required(),
    site_id: Joi.string().min(1).required(),
    agency_id: Joi.string().min(1).required(),
    start_date: Joi.date().format(dateTimeFormates.YYYYMMDD).raw().required(),
    end_date: Joi.date().format(dateTimeFormates.YYYYMMDD).raw().required(),
    week: Joi.number().required()
}).options({ abortEarly: false, allowUnknown: true })

export const ResetPasswordRequestSchema = Joi.object({
    code: Joi.string().min(1).required(),
    password: Joi.string().min(8).required(),
}).options({ abortEarly: false, allowUnknown: true })

export const CreateAgencyRequestSchema = Joi.object({
    name: Joi.string().required(),
    address_line_1: Joi.string().required(),
    address_line_2: Joi.string().allow(null, ''),
    address_line_3: Joi.string().allow(null, ''),
    city: Joi.string().pattern(/^[aA-zZ\s]+$/).error(new Error('Only alphabets are allowed for the field city.')).required(),
    country: Joi.string().required(),
    postCode: Joi.string().uppercase().alphanum().allow(null, '')
})

export const UpdateClientSchema = Joi.object({
    name: Joi.string().required(),
    address_line_1: Joi.string().required(),
    address_line_2: Joi.string().allow(null, ''),
    address_line_3: Joi.string().allow(null, ''),
    city: Joi.string().pattern(/^[aA-zZ\s]+$/).error(new Error('Only alphabets are allowed for the field city.')).required(),
    country: Joi.string().required(),
    sectorId: Joi.number().min(1).required(),
    postCode: Joi.string().uppercase().alphanum().allow(null, ''),
    client_id: Joi.number().min(1).required(),
    user_id: Joi.number().min(1).required(),
    profile: Joi.string().allow(null, ''),
})
export const CreateAgencyAssociationRequestSchema = Joi.object({
    client_id: Joi.number().required(),
    agency_id: Joi.number().required(),
    margin: Joi.string(),
    currency: Joi.string()
})

export const UpdateAgencyAssociationRequestSchema = Joi.object({
    client_id: Joi.number().required(),
    agency_id: Joi.number().required(),
    margin: Joi.string(),
    currency: Joi.string()
})

export const UpdateAgencyRequestSchema = Joi.object({
    name: Joi.string().required(),
    address_line_1: Joi.string().required(),
    address_line_2: Joi.string().allow(null, ''),
    address_line_3: Joi.string().allow(null, ''),
    city: Joi.string().pattern(/^[aA-zZ\s]+$/).error(new Error('Only alphabets are allowed for the field city.')).required(),
    country: Joi.string().required(),
    postCode: Joi.string().uppercase().alphanum().allow(null, ''),
    profile: Joi.string().allow(null, ''),
})

export const QueryParamsSchemaWithIdOnly = Joi.object({
    id: Joi.string().required()
})

export const GetNationalityQueryParamsSchema = Joi.object({
    site_id: Joi.string(),
    client_id: Joi.string().required(),
    agency_id: Joi.string(),
    type: Joi.string().valid('TEMPORARY', 'PERMANENT')
})

export const QueryParamsForSurveyAnalysis = Joi.object({
    client_id: Joi.string().required(),
    agency_id: Joi.string(),
    site_id: Joi.string(),
    region_id: Joi.string(),
    start_date: Joi.date().format(dateTimeFormates.YYYYMMDD).raw(),
    end_date: Joi.date().format(dateTimeFormates.YYYYMMDD).raw(),
    type: Joi.string().valid('TEMPORARY', 'PERMANENT')
})

export const CreateSurveySchema = Joi.object({
    result: Joi.array().items(Joi.object({
        workerId: Joi.string().required(),
        questionId: Joi.string().required(),
        siteId: Joi.string().required(),
        agencyId: Joi.string().allow(null, ''),
        clientId: Joi.string().required(),
        surveyId: Joi.string().required(),
        rating: Joi.string().valid(null, "0.5", "1.0", "1.5", "2.0", "2.5", "3.0", "3.5", "4.0", "4.5", "5.0"),
        answer: Joi.array().items(Joi.string())
    }))
})

export const QueryParamsForPayrollSummary = Joi.object({
    client_id: Joi.string().required(),
    agency_id: Joi.string(),
    region_id: Joi.string(),
    site_id: Joi.string(),
    start_date: Joi.date().format(dateTimeFormates.YYYYMMDD).raw(),
    end_date: Joi.date().format(dateTimeFormates.YYYYMMDD).raw(),
    page: Joi.number().required(),
    limit: Joi.number().required(),
    sort_by: Joi.string(),
    sort_type: Joi.string()
})

export const PaginationSchema = Joi.object({
    page: Joi.number().required(),
    limit: Joi.number().required(),
    sort_by: Joi.string(),
    sort_type: Joi.string().valid("ASC", "DESC")
})

export const departmentPaginationSchema = Joi.object({
    client_id: Joi.number().min(1).required(),
    site_id: Joi.number().min(1),
    region_id: Joi.number().min(1),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).default(50)
})

export const dropDownSchema = Joi.object({
    client_id: Joi.number().required(),
    site_id: Joi.number().min(1),
    region_id: Joi.number().min(1)
})

export const PaginationSchemaWithClientId = Joi.object({
    client_id: Joi.string().allow(null, ''),
    site_id: Joi.string().allow(null, ''),
    region_id: Joi.string().allow(null, ''),
    page: Joi.number().required(),
    limit: Joi.number().required(),
    sort_by: Joi.string(),
    sort_type: Joi.string()
})

export const CreateAndUpdateDepartmentRequestSchema = Joi.object({
    name: Joi.string().pattern(/^[aA-zZ_-]+$/).error(new Error('Only alphabets, underscore(_) and hypen(-) are allowed for the field name.')).required(),
    client_id: Joi.number().required(),
})
export const CreateAndUpdateSectorRequestSchema = Joi.object({
    key: Joi.string().required(),
    value: Joi.string().required()
})

export const CreateJobRequestSchema = Joi.object({
    name: Joi.string().required(),
    clientId: Joi.string(),
    departmentId: Joi.array().items(Joi.string()),
    siteId: Joi.string(),
    type: Joi.string(),
    shiftId: Joi.string(),
    hoursPerWeek: Joi.number(),
})
export const UpdateJobRequestSchema = Joi.object({
    name: Joi.string().required(),
    clientId: Joi.string(),
    departmentId: Joi.array().items(Joi.string()),
    siteId: Joi.string(),
    type: Joi.string().required(),
    shiftId: Joi.string(),
    hoursPerWeek: Joi.number(),
})

export const addAndUpdateSiteSchema = Joi.object({
    name: Joi.string().min(1).required(),
    region_id: Joi.number().min(1).required(),
    address_line_1: Joi.string().required(),
    address_line_2: Joi.string().allow(null, ''),
    address_line_3: Joi.string().allow(null, ''),
    post_code: Joi.string().uppercase().alphanum().allow(null, ''),
    city: Joi.string().pattern(/^[aA-zZ\s]+$/).error(new Error('Only alphabets are allowed for the field city.')).required(),
    country: Joi.string().required(),
    client_id: Joi.number().min(1).required()
})
export const AddWorkerSchema = Joi.object({
    first_name: Joi.string().min(1).required(),
    last_name: Joi.string().min(1).required(),
    date_of_birth: Joi.date().max('now').format(dateTimeFormates.YYYYMMDD).raw().required(),
    national_insurance_number: Joi.string().min(1).required(),
    post_code: Joi.string().uppercase().alphanum().allow(null, ''),
    nationality: Joi.string().min(1).required(),
    orientation: Joi.string().min(1).required(),
    email: Joi.string().min(1).required(),
    country_code: Joi.string().pattern(/\+[0-9]+/).error(new Error('Please enter a valid country code.')).allow(null, ''),
    mobile: Joi.string().min(1).allow(null, ""),
    payroll_ref: Joi.string().alphanum().required(),
    employee_id: Joi.string().alphanum().required(),
    job_id: Joi.string().min(1).required(),
    client_id: Joi.number().min(1).allow(null),
    start_date: Joi.date().format(dateTimeFormates.YYYYMMDD).raw().required(),
    agency_id: Joi.number().min(1).allow(null),
    is_active: Joi.boolean().default(true),
    type: Joi.string().valid('TEMPORARY', 'PERMANENT').default('TEMPORARY')
}).options({ abortEarly: false, allowUnknown: true })

export const updateSingleWorkerSchema = Joi.object({
    first_name: Joi.string().min(1).required(),
    last_name: Joi.string().min(1).required(),
    date_of_birth: Joi.date().max('now').format(dateTimeFormates.YYYYMMDD).raw().required(),
    post_code: Joi.string().uppercase().alphanum().allow(null, ''),
    nationality: Joi.string().min(1).required(),
    orientation: Joi.string().min(1).required(),
    country_code: Joi.string().pattern(/\+[0-9]+/).error(new Error('Please enter a valid country code.')).allow(null, ''),
    mobile: Joi.string().min(1).allow(null, ''),
    payroll_ref: Joi.string().alphanum().required().allow(null, ''),
    employee_id: Joi.string().alphanum().required().allow(null, ''),
    job_id: Joi.string().min(1).required(),
    client_id: Joi.number().min(1).allow(null),
    start_date: Joi.date().format(dateTimeFormates.YYYYMMDD).raw().required(),
    agency_id: Joi.number().min(1).allow(null),
    is_active: Joi.boolean().default(true),
    national_insurance_number: Joi.string().required(),
    documents: Joi.object().keys({
        passport: Joi.string().uri().min(1).allow(null, '').required(),
        driving_license: Joi.string().uri().allow(null, '').required(),
        identity_card: Joi.string().uri().allow(null, '').required(),
        utility_bill: Joi.string().uri().allow(null, '').required()
    }).allow(null, '')

}).options({ abortEarly: false, allowUnknown: true })

export const CreateRateCardRequestSchema = Joi.object({
    name: Joi.string().required(),
    currency: Joi.string().required(),
    pay_per_hour: Joi.string(),
    insurance_rate: Joi.string(),
    holiday_pay_rate: Joi.string(),
    apprenticeship_rate: Joi.string(),
    pension_rate: Joi.string(),
    full_time_hours: Joi.string().required(),
    overtime_pay: Joi.string().required(),
    pay_per_hour_dynamic: Joi.string(),
    insurance_rate_dynamic: Joi.string(),
    holiday_pay_rate_dynamic: Joi.string(),
    apprenticeship_rate_dynamic: Joi.string(),
    pension_rate_dynamic: Joi.string(),
    full_time_hours_dynamic: Joi.string().required(),
    overtime_pay_dynamic: Joi.string().required(),
    client_id: Joi.string().required(),
})

export const UpdateRateCardRequestSchema = Joi.object({
    name: Joi.string(),
    currency: Joi.string(),
    pay_per_hour: Joi.string(),
    insurance_rate: Joi.string(),
    holiday_pay_rate: Joi.string(),
    apprenticeship_rate: Joi.string(),
    pension_rate: Joi.string(),
    full_time_hours: Joi.string(),
    overtime_pay: Joi.string(),
    overtime_pay_dynamic: Joi.string(),
    pay_per_hour_dynamic: Joi.string(),
    insurance_rate_dynamic: Joi.string(),
    holiday_pay_rate_dynamic: Joi.string(),
    apprenticeship_rate_dynamic: Joi.string(),
    pension_rate_dynamic: Joi.string(),
    full_time_hours_dynamic: Joi.string()
})

export const AddNewUserSchema = Joi.object({
    user_type: Joi.number().required(),
    id: Joi.number().min(1),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    country_code: Joi.string().pattern(/\+[0-9]+/).error(new Error('Please enter a valid country code.')).allow(null, ''),
    phone: Joi.number().min(1).allow(null, "")
})

export const UpdateWorkerSchema = Joi.object({
    client_id: Joi.number().min(1).allow(null),
    agency_id: Joi.number().min(1).allow(null),
    is_active: Joi.boolean().allow(null),
    job_id: Joi.number().min(1).allow(null),
    workers: Joi.array().items(Joi.number().min(1).required()).required()
})

export const GetWorkersListSchema = Joi.object({
    client_id: Joi.number().min(1),
    agency_id: Joi.number().min(1),
    site_id: Joi.number().min(1),
    page: Joi.number().min(1),
    limit: Joi.number().min(1),
    sort_by: Joi.string().valid(...workerTableAllowedSortingFields),
    sort_type: Joi.string().valid("ASC", "DESC"),
    type: Joi.string().valid('TEMPORARY', 'PERMANENT')
}).options({ abortEarly: false, allowUnknown: true })

export const GetWorkersListSchemaWithoutPagination = Joi.object({
    client_id: Joi.number().min(1).allow(null),
    agency_id: Joi.number().min(1).allow(null),
    site_id: Joi.number().min(1).allow(null),
    type: Joi.string().valid('TEMPORARY', 'PERMANENT')
}).options({ abortEarly: false, allowUnknown: true })

export const UpdateUserProfileSchema = Joi.object({
    name: Joi.string().allow(null, ''),
    profile: Joi.string().allow(null, ''),
})

export const AddClientUserSchema = Joi.object({
    client_role: Joi.number().min(1).required(),
    id: Joi.number().min(1).required(),
    client_id: Joi.number().min(1).required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(1).allow(null, ''),
    country_code: Joi.string().pattern(/\+[0-9]+/).error(new Error('Please enter a valid country code.')).allow(null, '')
})

export const updateClientParamsSchema = Joi.object({
    id: Joi.number().min(1).required()
})

export const UpdateClientUserSchema = Joi.object({
    name: Joi.string().allow(null, ''),
    phone: Joi.string().allow(null, ''),
    country_code: Joi.string().pattern(/\+[0-9]+/).error(new Error('Please enter a valid country code.')).allow(null, ''),
    user_type_id: Joi.number().allow(null, ''),
    id: Joi.number().allow(null, '')
})

export const AddAndEditNewShiftSchema = Joi.object({
    name: Joi.string().pattern(/^[aA-zZ]+$/).error(new Error('Only alphabets are allowed for the field name.')).required()
})

export const createBookingSchema = Joi.object({
    repeat: Joi.number().max(6).required(),
    start_date: Joi.date().format(dateTimeFormates.YYYYMMDD).raw().required(),
    end_date: Joi.date().format(dateTimeFormates.YYYYMMDD).raw().required(),
    department_id: Joi.number().min(1).required(),
    site_id: Joi.number().min(1).required(),
    shift_type_id: Joi.number().min(1).required(),
    required_heads: Joi.object().length(7).required(),
    requested_total: Joi.number().min(1).required(),
    agency_requested: Joi.array().required(),
})

export const getBookingSchema = Joi.object({
    client_id: Joi.number().min(1).allow(null),
    site_id: Joi.number().min(1).allow(null),
    agency_id: Joi.number().min(1).allow(null),
    region_id: Joi.number().min(1).allow(null),
    page: Joi.number().min(1),
    limit: Joi.number().min(1),
    sort_by: Joi.string().valid(...bookingListingAllowedFields).allow(null),
    sort_type: Joi.string().valid("ASC", "DESC").allow(null, ''),
})

export const GetAdminsSchema = Joi.object({
    user_type: Joi.number().min(1).required(),
    id: Joi.number().min(1).required()
})

export const updateBookingSchema = Joi.object({
    id: Joi.number().min(1).required()
})

export const bulkUploadWorkerCsvSchema = Joi.object({
    payroll_ref: Joi.string().alphanum().allow(null, ''),
    employee_id: Joi.string().alphanum().min(1).required(),
    national_insurance_number: Joi.string().min(1).required(),
    first_name: Joi.string().min(1).required().regex(/^([^0-9]*)$/),
    last_name: Joi.string().min(1).required(),
    dob: Joi.date().max('now').format(dateTimeFormates.DDMMYYYY).raw().required(),
    nationality: Joi.string().min(1).required(),
    sex: Joi.string().min(1).required(),
    email: Joi.string().min(1).required(),
    country_code: Joi.string().pattern(/\+[0-9]+/).error(new Error('Please enter a valid country code.')).allow(null, ''),
    mobile: Joi.string().min(1).pattern(/^[0-9]+$/).allow(null, ""),
    job_name: Joi.string().required(),
    department_name: Joi.string().required(),
    shift_name: Joi.string().required(),
    role_type: Joi.string().required(),
    start_date: Joi.date().format(dateTimeFormates.DDMMYYYY).raw().required(),
    is_active: Joi.string().default("Yes").valid('Yes', 'No', 'yes', 'no', 'YES', 'NO'),
    post_code: Joi.string().uppercase().alphanum().allow(null, '')
}).options({ abortEarly: false, allowUnknown: true })

export const timeAndAttendanceCsvSchema = Joi.object({
    payroll_ref: Joi.string().alphanum().min(1).allow(null, ''),
    employee_id: Joi.string().alphanum().min(1).allow(null, ''),
    // national_insurance_number: Joi.string().allow(null, ''),
    first_name: Joi.string().min(1).required().allow(''),
    last_name: Joi.string().min(1).required().allow(''),
    client: Joi.string().min(1).required().allow(''),
    shift: Joi.string().min(1).required().allow(''),
    department: Joi.string().min(1).required().allow(''),
    sun: Joi.number().required().allow(0, ''),
    mon: Joi.number().required().allow(0, ''),
    tue: Joi.number().required().allow(0, ''),
    wed: Joi.number().required().allow(0, ''),
    thu: Joi.number().required().allow(0, ''),
    fri: Joi.number().required().allow(0, ''),
    sat: Joi.number().required().allow(0, ''),
    week_hours: Joi.number().required(),
    pay_rate: Joi.number().required(),
    pay_type: Joi.string().required().valid('Standard', 'Overtime', 'Holiday', 'Weekend').insensitive(),
    standard_charges: Joi.number().required().allow(0, ''),
    overtime_charges: Joi.number().required().allow(0, ''),
    total_charges: Joi.number().required(),
    charge_rate: Joi.number().required(),
    standard_pay: Joi.number().required().allow(0, ''),
    overtime_pay: Joi.number().required().allow(0, '')
}).options({ abortEarly: false, allowUnknown: true })

export const payrollReportCsvSchema = Joi.object({
    employee_id: Joi.string().alphanum().min(1).required(),
    total_hour: Joi.number().required(),
    total_charge: Joi.number().required(),
    total_pay: Joi.number().required(),
    ni: Joi.number().required().allow(0),
    holiday: Joi.number().required().allow(0),
    app_levy: Joi.number().required().allow(0),
    discount: Joi.number().required().allow(0),
    pension: Joi.number().required().allow(0)
}).options({ abortEarly: false, allowUnknown: true })

export const dashboardApiSchema = Joi.object({
    client_id: Joi.number().min(1).required(),
    agency_id: Joi.number().min(1),
    site_id: Joi.number().min(1),
    region_id: Joi.number().min(1),
    shift_id: Joi.number().min(1),
    department_id: Joi.number().min(1)
}).options({ abortEarly: false, allowUnknown: false });

export const dashboardApiWithDateFiltersSchema = Joi.object({
    client_id: Joi.number().min(1).required(),
    agency_id: Joi.number().min(1),
    site_id: Joi.number().min(1),
    region_id: Joi.number().min(1),
    shift_id: Joi.number().min(1),
    department_id: Joi.number().min(1),
    start_date: Joi.date().format(dateTimeFormates.YYYYMMDD).raw(),
    end_date: Joi.date().format(dateTimeFormates.YYYYMMDD).raw()
}).options({ abortEarly: false, allowUnknown: false });


export const dashboardApiWithMandatoryDateFiltersSchema = Joi.object({
    client_id: Joi.number().min(1).required(),
    agency_id: Joi.number().min(1),
    site_id: Joi.number().min(1),
    region_id: Joi.number().min(1),
    shift_id: Joi.number().min(1),
    department_id: Joi.number().min(1),
    start_date: Joi.date().format(dateTimeFormates.YYYYMMDD).raw().required(),
    end_date: Joi.date().format(dateTimeFormates.YYYYMMDD).raw().required()
}).options({ abortEarly: false, allowUnknown: false });

export const updateBookingForSiteAdminSchema = Joi.object({
    booking_total: Joi.number().min(1).required(),
    booking_details: Joi.array().min(1).items(Joi.object({
        booking_association_id: Joi.number().min(1).required(),
        requested_heads: Joi.object().required(),
        total_heads: Joi.number().min(1).required(),
    })).required(),
}).options({ abortEarly: false, allowUnknown: true })


export const RevokeUserProfileAccessSchema = Joi.object({
    id: Joi.number().min(1).required()
}).options({ abortEarly: false, allowUnknown: true })

export const GetWorkerDetailsByWorkerIdSchema = Joi.object({
    id: Joi.number().min(1).required()
})

export const dashboardWithoutAgencyIdApiSchema = Joi.object({
    client_id: Joi.number().min(1).required(),
    site_id: Joi.number().min(1),
    region_id: Joi.number().min(1),
    shift_id: Joi.number().min(1),
    department_id: Joi.number().min(1),
    start_date: Joi.date().format(dateTimeFormates.YYYYMMDD).raw(),
    end_date: Joi.date().format(dateTimeFormates.YYYYMMDD).raw()
}).options({ abortEarly: false, allowUnknown: false });

export const dashboardApiWithOutAgencyIdSchema = Joi.object({
    client_id: Joi.number().min(1).required(),
    site_id: Joi.number().min(1),
    region_id: Joi.number().min(1),
    shift_id: Joi.number().min(1),
    department_id: Joi.number().min(1)
}).options({ abortEarly: false, allowUnknown: false });

export const WorkerPasswordResetRequestSchema = Joi.object({}).options({ abortEarly: false, allowUnknown: false });

export const workerRegistrationSchema = Joi.object({
    email: Joi.string().email().required(),
    national_insurance_number: Joi.string().allow(null, ''),
    first_name: Joi.string().allow(null, ''),
    password: Joi.string().min(8).required(),
}).options({ abortEarly: false, allowUnknown: false });

export const WorkerLoginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    device_token: Joi.string()
}).options({ abortEarly: false, allowUnknown: false });


export const demographicsDashboardSchema = Joi.object({
    client_id: Joi.number().min(1).required(),
    agency_id: Joi.number().min(1),
    site_id: Joi.number().min(1),
    region_id: Joi.number().min(1),
    is_active: Joi.string().valid("true", "false"),
    type: Joi.string().valid("TEMPORARY", "PERMANENT")
}).options({ abortEarly: false, allowUnknown: false });


export const CheckWorkerAvailabilitySchema = Joi.object({
    first_name: Joi.string().min(1).required(),
    national_insurance_number: Joi.string().alphanum().min(1).required(),
})


export const SendMessageRequestSchema = Joi.object({
    name: Joi.string().min(1).required(),
    title: Joi.string().min(1).required(),
    type: Joi.string().min(1).required().valid(
        MessageType.GENERAL,
        MessageType.AWARD,
        MessageType.BADGE,
        MessageType.KUDOS,
        MessageType.REWARD,
        MessageType.TRAINING
    ),
    from: Joi.string().min(1).required(),
    body: Joi.array().items(
        Joi.array().items(
            Joi.object({
                type: Joi.string().min(1).required().valid(
                    MessageBodyContentType.LINK,
                    MessageBodyContentType.MEDIA,
                    MessageBodyContentType.TEXT
                ),
                data: Joi.string().min(1).required()
            }).required()
        ).required()
    ).required(),
    send_to: Joi.array().items(
        Joi.object({
            type: Joi.string().min(1).required().valid(
                MessageReceiverGroups.DEPARTMENT,
                MessageReceiverGroups.SHIFT,
                MessageReceiverGroups.JOB,
                MessageReceiverGroups.WORKERS,
                MessageReceiverGroups.NATIONALITY
            ),
            data: Joi.array().items().required()
        })
    )
}).options({ abortEarly: false, allowUnknown: false });


export const SendMessageRequestParamsSchema = Joi.object({
    client_id: Joi.number().min(1).required(),
    site_id: Joi.number().min(1),
    agency_id: Joi.number().min(1),
    type: Joi.string().valid('TEMPORARY', 'PERMANENT')
}).options({ abortEarly: false, allowUnknown: false });


export const workerProfileSchema = Joi.object({
    id: Joi.number().min(1).required()
})

export const UpdateWorkerProfileSchema = Joi.object({
    resource: Joi.string().uri().allow(null, ''),
    documents: Joi.object().keys({
        passport: Joi.string().uri().allow(null, ''),
        driving_license: Joi.string().uri().allow(null, ''),
        identity_card: Joi.string().uri().allow(null, ''),
        utility_bill: Joi.string().uri().allow(null, '')
    }).allow(null, '')
}).rename('profile', 'resource');


export const GetSentMessageListSchema = Joi.object({
    from: Joi.string(),
    name: Joi.string(),
    type: Joi.string().min(1).valid(
        MessageType.GENERAL,
        MessageType.AWARD,
        MessageType.BADGE,
        MessageType.KUDOS,
        MessageType.REWARD,
        MessageType.TRAINING
    ),
    sort_by: Joi.string().valid().default("created_at"),
    sort_type: Joi.string().valid().default("DESC").valid(
        "ASC", "DESC"
    ),
    page: Joi.number().required(),
    limit: Joi.number().required(),
    client_id: Joi.number().min(1).allow(null, ''),
    agency_id: Joi.number().min(1).allow(null, ''),
    site_id: Joi.number().min(1).allow(null, '')
}).options({ abortEarly: false, allowUnknown: false });


export const GeTemnplateListSchema = Joi.object({
    from: Joi.string(),
    name: Joi.string(),
    type: Joi.string().min(1).valid(
        MessageType.GENERAL,
        MessageType.AWARD,
        MessageType.BADGE,
        MessageType.KUDOS,
        MessageType.REWARD,
        MessageType.TRAINING
    )
}).options({ abortEarly: false, allowUnknown: false });


export const getWorkerSideMessagesListSchema = Joi.object({
    type: Joi.string().min(1).valid(
        WorkerSideMessagesType.GENERAL,
        WorkerSideMessagesType.AWARD,
        WorkerSideMessagesType.BADGE,
        WorkerSideMessagesType.KUDOS,
        WorkerSideMessagesType.FEED,
        WorkerSideMessagesType.TRAINING
    ).required(),
    view: Joi.string().min(1).valid(
        WorkerSideMessagesScreenViewType.GENERAL,
        WorkerSideMessagesScreenViewType.AGENCY,
        WorkerSideMessagesScreenViewType.CLIENT
    ),
    page: Joi.number().required(),
    limit: Joi.number().required()
}).options({ abortEarly: false, allowUnknown: false });


export const CreateMessageTemplateSchema = Joi.object({
    name: Joi.string().min(1).required(),
    title: Joi.string().min(1).required(),
    type: Joi.string().min(1).required().valid(
        MessageType.KUDOS,
        MessageType.AWARD,
        MessageType.BADGE,
        MessageType.GENERAL,
        MessageType.REWARD,
        MessageType.TRAINING
    ),
    from: Joi.string().min(1).required(),
    body: Joi.array().items(
        Joi.array().items(
            Joi.object({
                type: Joi.string().min(1).required().valid(
                    MessageBodyContentType.LINK,
                    MessageBodyContentType.MEDIA,
                    MessageBodyContentType.TEXT
                ),
                data: Joi.string().min(1).required()
            }).required()
        ).required()
    ).required()
}).options({ abortEarly: false, allowUnknown: false });

export const TrackWorkerTrainingSchema = Joi.object({
    is_training_completed: Joi.boolean().allow(null, ''),
    require_more_training: Joi.boolean().allow(null, '')
}).options({ abortEarly: false, allowUnknown: false });

export const clientRatingsSchema = Joi.object({
    client_id: Joi.number().min(1).allow(null, ''),
    agency_id: Joi.number().min(1).allow(null, '')
}).options({ abortEarly: false, allowUnknown: false });

export const siteRatingsSchema = Joi.object({
    client_id: Joi.number().min(1).allow(null, ''),
    region_id: Joi.number().min(1).allow(null, ''),
    site_id: Joi.number().min(1).allow(null, '')
})

export const trendsAnalysisSchema = Joi.object({
    start_date: Joi.date().format(dateTimeFormates.YYYYMMDD).raw().required(),
    end_date: Joi.date().format(dateTimeFormates.YYYYMMDD).raw().required(),
    client_id: Joi.number().min(1).required(),
    agency_id: Joi.number().min(1).allow(null, ''),
    site_id: Joi.number().min(1).allow(null, ''),
    region_id: Joi.number().min(1).allow(null, ''),
    type: Joi.string().valid("TEMPORARY", "PERMANENT")
})

export const detailedSiteRatingsSchema = Joi.object({
    client_id: Joi.number().min(1).allow(null, ''),
    region_id: Joi.number().min(1).allow(null, ''),
    type: Joi.string().valid('TEMPORARY', 'PERMANENT')
})


export const agencyRatingsSchema = Joi.object({
    client_id: Joi.number().min(1).allow(null, ''),
    agency_id: Joi.number().min(1).allow(null, '')
})

export const detailedAgencyRatingsSchema = Joi.object({
    client_id: Joi.number().min(1).required(),
})

export const dashboardTrendsFilterSchema = Joi.object({
    client_id: Joi.number().min(1).required(),
    agency_id: Joi.number().min(1),
    site_id: Joi.number().min(1),
    region_id: Joi.number().min(1),
    start_date: Joi.date().format(dateTimeFormates.YYYYMMDD).raw().required(),
    end_date: Joi.date().format(dateTimeFormates.YYYYMMDD).raw().required(),
    type: Joi.string().valid("TEMPORARY", "PERMANENT")
}).options({ abortEarly: false, allowUnknown: false });

export const faqPaginationSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).default(50)
})

export const faqParamSchema = Joi.object({
    type: Joi.string().valid(
        FaqUrlType.FAQ,
        FaqUrlType.LINK_TO_SUPPORT
    ).required()
})

export const GetMessageRequestParamsSchema = Joi.object({
    message_receiver_worker_id: Joi.number().min(1)
})

export const updateBookingByAgencySchema = Joi.object({
    fulfilled_heads: Joi.object().keys({
        1: Joi.number().min(0).required(),
        2: Joi.number().min(0).required(),
        3: Joi.number().min(0).required(),
        4: Joi.number().min(0).required(),
        5: Joi.number().min(0).required(),
        6: Joi.number().min(0).required(),
        7: Joi.number().min(0).required(),
    }),
    total: Joi.number().min(0).required()
})


export const PayrollListPaginationSchema = Joi.object({
    page: Joi.number().required(),
    limit: Joi.number().required(),
    sort_by: Joi.string().valid(...payrollDataAllowedSortingFields).required(),
    sort_type: Joi.string().valid("ASC", "DESC").required()
})

export const UpdateSurveyQuestionSchema = Joi.object({
    questions: Joi.array().items(Joi.object({
        id: Joi.string().required(),
        question_text: Joi.string().required()
    }))
})
