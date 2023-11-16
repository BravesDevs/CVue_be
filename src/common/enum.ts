/**
 * All the enum type objects.
 */

export enum HttpMethods {
    POST = 'POST',
    PUT = 'PUT',
    GET = 'GET',
    DELETE = 'DELETE'
};

export enum FeatureList {
    AGENCY = "agency",
    CLIENT = "client",
    REGIONAL_CLIENT_ADMIN = "regional_client_admin",
    SITE_CLIENT_ADMIN = "site_client_admin",
    DEPARTMENT = "department",
    REGION = "region",
    SITE = "site",
    JOB = "job",
    RATE_CARD = "rate_card",
    SHIFT_TYPE = "shift_type",
    WORKER = "worker",
    SECTOR = "sector",
    MANAGE_ASSOCIATIONS = "manage_associations",
    TIME_AND_ATTENDANCE = "time_and_attendance",
    USER = "user",
    SHIFT_BOOKING = "shift_booking",
    MASTER_ADMIN_DASHBOARD = "master_admin_dashboard",
    RESEND_INVITATION = "resend_invitation"
};

export enum RedirectURLs {
    RESET_PASSWORD = '/reset-password'
};

export enum UserType {
    CLEARVUE_ADMIN = 1,
    CLIENT_ADMIN = 2,
    AGENCY_ADMIN = 3,
    CLIENT_REGIONAL = 4,
    CLIENT_SITE = 5,
    AGENCY_WORKER = 6,
    AGENCY_SITE = 7,
    AGENCY_REGIONAL = 8
}

export enum AccessType {
    VIEW = 1,
    CREATE = 2,
    UPDATE = 3,
    DELETE = 4
}


export enum MessageActions {
    CREATE_CLIENT = "Client has been added successfully.",
    CREATE_CLIENT_USER = "Client user has been added successfully.",
    UPDATE_CLIENT_USER = "Client user details has been updated successfully.",
    UPDATE_CLIENT = "Client details has been updated successfully.",
    CREATE_SITE = "Site has been added successfully.",
    CREATE_REGION = "Region has been added successfully.",
    CREATE_AGENCY = "Agency has been added successfully.",
    UPDATE_AGENCY = "Agency details updated successfully.",
    CREATE_AGENCY_ASSOCIATION = "Agency Association has been added successfully.",
    UPDATE_AGENCY_ASSOCIATION = "Agency Association has been updated successfully.",
    CREATE_DEPARTMENT = "Department has been added successfully.",
    UPDATE_DEPARTMENT = "Department details has been updated successfully.",
    UPDATE_REGION = "Region details has been updated successfully.",
    UPDATE_SITE = "Site details has been updated successfully.",
    CREATE_JOB = "Job has been added successfully.",
    UPDATE_JOB = "Job details has been updated successfully.",
    CREATE_RATE_CARD = "Rate has been card added successfully.",
    UPDATE_RATE_CARD = "Rate card details has been updated successfully.",
    CREATE_SECTOR = "Sector has been added successfully.",
    UPDATE_SECTOR = "Sector details has been updated successfully.",
    CREATE_WORKER = "Worker has been added successfully.",
    CREATE_WORKERS = "Workers has been added successfully.",
    UPDATE_WORKER = "Worker has been updated successfully.",
    CREATE_TIME_AND_ATTENDANCE = "Time and attendance data has been added successfully.",
    CREATE_PAYROLL = "Payroll Report has been added successfully.",
    UPDATE_WORKERS = "Workers data has been updated successfully.",
    UPDATE_SINGLE_WORKERS = "Worker has been updated successfully.",
    REGISTRATION_SUCCESS = "Worker registration successful",
    CREATE_USER = "User has been added successfully",
    UPDATE_USER = "User data has been updated successfully.",
    CREATE_SHIFT = "Shift has been added successfully.",
    UPDATE_SHIFT = "Shift has been updated successfully.",
    RESEND_INVITATION = "Invitation has been resend successfully.",
    CANCEL_BOOKING = "Booking has been cancelled.",
    UPDATE_BOOKING = "Booking has updated successfully.",
    NO_CANCEL_BOOKING = "Booking has not been cancelled.",
    REVOKE_USER = "User access revoked.",
    UPDATE_WORKER_PROFILE = "Details are updated successfully.",
    SURVEY_RESPONSE = "Response is submitted successfully.",
    MESSAGE_SENT = "Message is sent successfully!",
    TEMPLATE = "Template is added successfully!",
    UPDATE_TEMPLATE = "Template is updated successfully!",
    UPDATE_QUESTION = "Questions are updated successfully!"
}

export enum MimeType {
    CSV = "text/csv",
    JPG = 'image/jpeg',
    PNG = 'image/png',
    XLS = 'application/vnd.ms-excel',
    XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    PDF = 'application/pdf',
    GIF = 'image/gif',
    DOC = 'application/msword',
    DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    PPT = 'application/vnd.ms-powerpoint',
    PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
}

export enum TimeAndAttendanceStatus {
    APPROVED = "Approved",
    PROCESSING = "Processing",
    PROCESSED = "Processed"
}

export enum PayrollAssumptions {
    NI_THRESHOLD = 170,
    NI_RATE = 0.138,
    PENSION_THRESHOLD = 120,
    PENSION_CONTRIBUTION = 0.03,
    APPRENTICESHIP_LEVY = 0.005,
    HOLIDAY_RATE = 0.1207,
    HOLIDAY_ENTITLEMENT = 28,
    STANDARD_WORKING_HOURS = 37.5,
}

export enum RoleTypeForCSV {
    'FULLTIME' = 1,
    'PARTTIME' = 2,
    'WEEKEND' = 3
}

export enum RoleType {
    'FULL-TIME' = 1,
    'PART-TIME' = 2,
    'WEEKEND' = 3
}

export enum BookingStatus {
    'OPEN' = 0,
    'FULFILLED' = 1,
    'AMENDED' = 2
}

export enum PayType {
    STANDARD = 'standard',
    OVERTIME = 'overtime',
}

export enum MessageType {
    GENERAL = "GENERAL",
    BADGE = "BADGE",
    KUDOS = "KUDOS",
    AWARD = "AWARD",
    REWARD = "REWARD",
    TRAINING = "TRAINING",
    SYSTEM = "SYSTEM"
}

export enum MessageBodyContentType {
    TEXT = "text",
    MEDIA = "media",
    LINK = "link"
}

export enum MessageReceiverGroups {
    WORKERS = 'workers',
    JOB = 'job',
    SHIFT = 'shift',
    DEPARTMENT = 'department',
    NATIONALITY = 'nationality'
}

export enum HallOfFameTypes {
    KUDOS = "kudos",
    BADGE = "badge",
    AWARD = "award"
}


export enum WorkerSideMessagesType {
    GENERAL = "general",
    KUDOS = "kudos",
    AWARD = "award",
    TRAINING = "training",
    BADGE = "badge",
    FEED = "feed"
}

export enum WorkerSideMessagesScreenViewType {
    CLIENT = "client",
    AGENCY = "agency",
    GENERAL = "general"
}

export enum AutomatedMessagesLabels {
    NEW_STARTER_WEEK_1 = "new_starter_week_1",
    NEW_STARTER_WEEK_2 = "new_starter_week_2",
    NEW_STARTER_WEEK_4 = "new_starter_week_4",
    NEW_STARTER_WEEK_8 = "new_starter_week_8",
    NEW_STARTER_WEEK_12 = "new_starter_week_12",
    NEW_STARTER_WEEK_26 = "new_starter_week_26",
    NEW_STARTER_WEEK_39 = "new_starter_week_39",
    NEW_STARTER_WEEK_52 = "new_starter_week_52",
    ANNUAL_WORK_ANNIVERSARY = "annual_work_anniversary",
    BIRTHDAY_MESSAGES = "birthday_wishes",
    UNASSINGED_WORKER = "unassign_worker",
    ZERO_HOURS_MESSAGE = "zero_hours",
    FIRST_DAY_WELCOME_MESSAGE = "first_day_welcome"
}

export enum FaqUrlType {
    FAQ = "faq",
    LINK_TO_SUPPORT = "link-to-support"
}

export enum FaqDatabaseType {
    FAQ = "FAQ",
    LINK_TO_SUPPORT = "LINK_TO_SUPPORT"
}

export enum WorkerTypes {
    TEMPORARY = "TEMPORARY",
    PERMANENT = "PERMANENT"
}
