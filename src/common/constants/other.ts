
// Slack Error Message field formatting configuration
export const slackErrorMessageFormat = {
    attachments: [
        {
	        mrkdwn_in: ["text"],
            color: "#E91E63",
            pretext: "{service-name} Notification",
            fields: []
        }
    ]
};


export const bcryptSaltRound = 10;

export const dateTimeFormates = {
    YYYYMMDD: "YYYY-MM-DD",
    DDMMYYYY: "DD/MM/YYYY"
};

export const ErrorCodes = {
    duplicateKeyError: "ER_DUP_ENTRY",
    dbReferenceError: "ER_NO_REFERENCED_ROW_2"
};

export const workerTableAllowedSortingFields = ["first_name", "last_name", "email", "country_code", "mobile", "agency_name", "client_name",
"national_insurance_number", "current_worker_id", "date_of_birth", "post_code", "start_date", "nationality", "employee_id",
"orientation", "agency_id", "client_id", "is_active", "created_by", "created_at", "updated_by", "updated_at"];

export const lengthOfServiceResponse = [
    {
        "name": "1-2",
        "data": [0]
    },
    {
        "name": "3-4",
        "data": [0]
    },
    {
        "name": "5-8",
        "data": [0]
    },
    {
        "name": "9-12",
        "data": [0]
    },
    {
        "name": "13-16",
        "data": [0]
    },
    {
        "name": "17-26",
        "data": [0]
    },
    {
        "name": "27-52",
        "data": [0]
    },
    {
        "name": "52+",
        "data": [0]
    }
];

export const bookingListingAllowedFields = ["id","client_name","site_name","department_name",
"region_name","shift_name","total","start_date","end_date","fulfilled_total","status"]

export const databaseSeparator = "|&|&|";

export const sensitiveData = ['password'];

export const defaultAppreciationJson = '{"badge": 0, "award": 0, "kudos": 0}';

// Mobile notifications
export const firebaseServerEndpoint = "https://fcm.googleapis.com/fcm/send";

export const payrollDataAllowedSortingFields = ["agency", "client", "workers", "start_date", "week"];

export const loggerPath = `${__dirname}/../../../logs`;
