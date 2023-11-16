/**
 * All the routes which are supported into the system. Separate that by version.
 */

export enum userAuthentication {
    RENEW_TOKEN = "/v1/token",
    LOG_IN = "/v1/login",
    FORGOT_PASSWORD = "/v1/forgot-password",
    RESET_PASSWORD = "/v1/reset-password"
}

export enum clientDetails {
    ADD_CLIENT = "/v1/client",
    SECTORS = "/v1/sectors",
    GET_OR_UPDATE_CLIENT_DETAILS_BY_ID = "/v1/client/:clientId",
    GET_CLIENT_DETAILS = "/v1/client",
    ADD_CLIENT_USERS = "/v1/client/users",
    UPDATE_CLIENT_USERS = "/v1/client/users/:id",
    CLIENT_USERS = "/v1/client-users",
    CLIENT_RATINGS = "/v1/client-ratings",
    TYPE_WISE_CLIENT_RATINGS = "/v1/type-wise-client-rating"
}

export enum agency {
    CREATE_AND_GET_LIST_OF_AGENCY = "/v1/agency",
    UPDATE_AND_GET_AGENCY = "/v1/agency/:id",
    AGENCY_RATINGS = "/v1/agency-ratings",
    AGENCY_RATINGS_DETAILS = "/v1/agency-ratings/details",
    ADD_AGENCY_USERS = "/v1/agency/users",
    UPDATE_AGENCY_USERS = "/v1/agency/users/:id",
    AGENCY_USERS = "/v1/agency-users"
}

export enum worker {
    CREATE_OR_GET_WORKERS = "/v1/workers",
    BULK_UPLOAD_OR_UPDATE_WORKERS = "/v1/workers/bulk",
    GET_SAMPLE_SHEET = "/v1/get-sample-sheet",
    GET_AND_UPDATE_WORKER_DETAILS = "/v1/workers/:id",
    LOGIN = "/v1/worker/login",
    DOCUMENTS = "/v1/worker/documents",
    GET_WORKER_LISTING = "/v1/workers-listing",
    CHECK_EXISTENCE_WORKER = "/v1/worker/check-availability",
    SIGN_UP = "/v1/worker/sign-up",
    PROFILE = "/v1/worker/user/:id",
    WORKER_PROFILE = "/v1/workers/users/:id",
    GET_WORKER_GROUPS = "/v1/workers-groups",
    TRACK_TRAINING = "/v1/messages/:id/training-completed",
    WORKER_NATIONALITYT_LIST = "/v1/workers-nationality"
}

export enum timeAndAttendance {
    UPLOAD_TIME_AND_ATTENDANCE = "/v1/time-and-attendance-upload",
    GET_LIST_OF_TIME_AND_ATTENDANCE = "/v1/time-and-attendance",
    GET_DETAIL_OF_TIME_AND_ATTENDANCE = "/v1/time-and-attendance/:id",
    GET_TIME_AND_ATTENDANCE_SAMPLE_SHEET = "/v1/time-and-attendance/get-sample-sheet",
}

export enum region {
    REGION = "/v1/region",
    GET_REGION = "/v1/region",
    DROPDOWN = "/v1/region-drop-down",
    UPDATE_REGION = "/v1/region/:id"
}

export enum department {
    CREATE_AND_GET_LIST_OF_DEPARTMENT = "/v1/department",
    UPDATE_DEPARTMENT = "/v1/department/:id"
};

export enum sector {
    CREATE_AND_GET_LIST_OF_SECTOR = "/v1/sector",
    UPDATE_SECTOR = "/v1/sector/:id"
};

export enum site {
    SITE = "/v1/site",
    SITE_DROPDOWN = "/v1/site-drop-down",
    UPDATE_SITE = "/v1/site/:id",
    SITE_RATINGS = "/v1/site-ratings",
    SITE_RATINGS_DETAILS = "/v1/site-ratings/details",
    TYPE_WISE_SITE_RATINGS = "/v1/type-wise-site-rating"
}

export enum rateCard {
    CREATE_AND_GET_LIST_OF_RATE_CARD = "/v1/rate-card",
    UPDATE_RATE_CARD = "/v1/rate-card/:id",
    RATE_CARD_DROP_DOWN = "/v1/rate-card-drop-down",
}

export enum job {
    CREATE_AND_GET_LIST_OF_JOB = "/v1/job",
    UPDATE_JOB = "/v1/job/:id",
    GET_JOBS_DROPDOWN_BY_SITE = "/v1/job/site/:site_id",
    GET_JOBS_NAME_DROPDOWN_BY_SITE = "/v1/job-drop-down/site/:site_id"
};

export enum agencyClientAssociation {
    CREATE_AND_GET_LIST_OF_ASSOCIATION = "/v1/agency-client",
    UPDATE_ASSOCIATION = "/v1/agency-client/:id"
};
export enum user {
    ADD_NEW_USER = "/v1/user",
    GET_ADMIN_USERS = "/v1/admin-users",
    RESEND_INVITATION = "/v1/user/resend-invitation/:id",
    REVOKE_USER = "/v1/user/:id/revoke"
}

export enum shift {
    SHIFT = "/v1/shift",
    EDIT_SHIFT = "/v1/shift/:id",
}

export enum booking {
    GET_OR_CREATE_BOOKING = "/v1/bookings",
    GET_BOOKING_DETAILS = "/v1/bookings/:id",
    UPDATE_BOOKING_DETAILS = "/v1/booking/:id",
    UPDATE_BOOKING = "/v1/booking"
}

export enum payroll {
    UPLOAD_PAYROLL_AND_SUMMARY = "/v1/payroll",
    DOWNLOAD_PAYROLL_CSV = "/v1/payroll-download/:id",
    GET_PAYROLL_DETAILS = "/v1/payroll/:id",
    GET_PAYROLL_SAMPLE_SHEET = "/v1/payroll-get-sample-sheet",
}

// Dashboard APIs
export enum masterAdminDashboard {
    DASHBOARD_SECTOR_LIST = "/v1/dashboard/sectors",
    DASHBOARD_ANALYTICS = "/v1/dashboard/analytics",
    DASHBOARD_CLIENT_LIST = "/v1/dashboard/clients",
    DASHBOARD_AGENCY_LIST = "/v1/dashboard/agencies",
    DASHBOARD_PAYROLL_LIST = "/v1/dashboard/payroll"
}

export enum dashboardWorkForce {
    DASHBOARD_WORKER_DEMOGRAPHICS = "/v1/dashboard/worker-demographics",
    DASHBOARD_WORKER_LENGTH_OF_SERVICE = "/v1/dashboard/worker-service-length",
    DASHBOARD_WORKER_SHIFT_UTILIZATION = "/v1/dashboard/workforce/day-wise-shift-utilization",
    POOL_UTILIZATION = "/v1/dashboard/workforce/pool-utilization"
}

export enum dashboardWorkForceBottomDeck {
    DASHBOARD_WORKER_DEMOGRAPHICS = "/v1/dashboard/workforce/agency-wise-worker-demographics",
    DASHBOARD_WORKER_LENGTH_OF_SERVICE = "/v1/dashboard/workforce/agency-wise-length-of-service",
    DASHBOARD_WORKER_SHIFT_UTILIZATION = "/v1/dashboard/workforce/agency-wise-shift-utilization",
    HEAD_COUNT = "/v1/dashboard/activity/head-count",
}

export enum dashboardLeaversTopDeck {
    LEAVERS_LENGTH_OF_SERVICE = "/v1/dashboard/leaver-service-length",
    LEAVERS_COUNT_AND_STARTER_RETENTION = "/v1/dashboard/leaver-count-and-starter-retention",
    LEAVERS_SHIFT_UTILIZATION = "/v1/dashboard/leaver-shift-utilization",
    POOL_UTILIZATION = "/v1/dashboard/pool-utilization"
}

export enum dashboardLeaversBottonDeck {
    AGENCY_WISE_LEAVERS_LENGTH_OF_SERVICE = "/v1/dashboard/agency-wise-leaver-service-length",
    AGENCY_WISE_LEAVERS_COUNT_AND_STARTER_RETENTION = "/v1/dashboard/agency-wise-new-starter-retention",
    AGENCY_WISE_LEAVERS_SHIFT_UTILIZATION = "/v1/dashboard/agency-wise-leaver-shift-utilization",
    LEAVERS = "/v1/dashboard/leavers-data"
}

export enum activityAllStats {
    ALL_STATS = "/v1/dashboard/activity-stats"
}

export enum activityBottomDeck {
    SPEND = "/v1/dashboard/activity/spend",
    AVERAGE_HOURS = "/v1/dashboard/activity/average-hours",
    SHIFT_DETAILS = "/v1/dashboard/activity/shift-details",
}

export enum header {
    HEADER_STATS = "/v1/dashboard/header-stats",
    LEAVERS_ANALYSIS = "/v1/dashboard/leavers-analysis",
    RATINGS = "/v1/dashboard/ratings"
}

export enum dashboardDemographics {
    GENDER = "/v1/dashboard/gender",
    PROXIMITY = "/v1/dashboard/proximity",
    AGE = "/v1/dashboard/age"
}

export enum message {
    MESSAGE = "/v1/messages",
    MESSAGE_DETAILS = "/v1/messages/:id",
    WORKER_SIDE_MESSAGES_LIST = "/v1/users/:user_id/messages",
    TEMPLATES = "/v1/templates",
    UPDATE_TEMPLATES = "/v1/templates/:id",
    TRAINING_MESSAGE_DETAILS = "/v1/workers/training/messages/:id",
    UPDATE_MESSAGE_STATUS = "/v1/message-read/:id"
}

export enum survey {
    GET_SURVEY_CATEGORY = "/v1/survey/categories",
    GET_SURVEY_ANALYSIS = "/v1/survey/analysis/:id",
    DOWNLOAD_SURVEY_ANALYSIS = "/v1/survey/analysis-download/:id",
    GET_SURVEY_QUESTIONS = "/v1/survey/questions/:id",
    ADD_SURVEY_RESPONSE = "/v1/survey/response"
}

export enum automatedMessages {
    TIMELINE_MESSAGES = "/v1/scheduler/timeline/messages",
    BIRTHDAY_MESSAGES = "/v1/scheduler/birthday/messages",
    WORKER_INACTIVE_MESSAGES = "/v1/scheduler/worker-inactive/messages",
    FIRST_DAY_WELCOME_MESSAGE = "/v1/scheduler/first-day-welcome/messages"
}

export enum trendsAnalysis {
    GET_STANDARD_OVERTIME_SPEND = "/v1/dashboard/trends/spend",
    GET_STANDARD_OVERTIME_HOURS = "/v1/dashboard/trends/hours",
    GET_TOTAL_HEADS = "/v1/dashboard/trends/heads",
    GET_LEAVERS_ANALYSIS = "/v1/dashboard/trends/leavers",
    SITE_RATING = "/v1/dashboard/trends/site-rating",
    AGENCY_RATING = "/v1/dashboard/trends/agency-rating",
    COMPANY_RATING = "/v1/dashboard/trends/company-rating",
}

export enum faq {
    GET_LIST_OF_FAQ = "/v1/support/:type",
};

export enum mobileVersion {
    GET_MOBILE_VERSION = "/v1/app/mobile-version",
};
