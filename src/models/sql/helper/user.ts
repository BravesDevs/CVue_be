import { worker } from 'cluster';
import { response } from 'express';
import { getRepository, In } from 'typeorm';
import { User, ResetPasswordToken, ClientDetails, AgencyDetails, Site, Region } from '../';
import { agency, UserType } from '../../../common';
import { UserSiteAssociation } from '../entities/UserSiteAssociation';

/**
 * Get user object as per user email
 * @param  {string} email
 */
export const getUserByEmail: any = async (email: string) => {
    const userRepository = getRepository(User);
    return await userRepository.findOne(
        {
            where:
                { email: email }
        }
    );
};

export const addClientAdminToUser: any = async (user) => {
    const userRepository = getRepository(User);
    let response = await userRepository.insert({
        userTypeId: user.user_type,
        clientId: user.clientId,
        name: user.admin_name,
        email: user.admin_email,
        countryCode: user.country_code,
        mobile: user.admin_contact_number,
        createdBy: user.user_id,
        updatedBy: user.user_id
    });
    return response.generatedMaps[0];
}

export const updateClientAdminUser: any = async (user) => {
    const userRepository = getRepository(User);
    let oldData = await userRepository.findOne({ where: { clientId: user.client_id } });
    let response = await userRepository.save({
        id: oldData.id,
        clientId: user.client_id,
        userTypeId: user.user_type,
        email: oldData.email,
        name: user.admin_name,
        countryCode: user.country_code,
        mobile: user.contact_number,
        updatedBy: user.user_id
    });
    return response;
}

/**
 * Update user password and set verification status to true
 * @param  {number} userId
 * @param  {string} password
 */
export const updatePasswordAndVerificationStatus: any = async (userId: number, password: string) => {
    const userRepository = getRepository(User);

    let result = await userRepository.createQueryBuilder("user")
        .update<User>(User, {
            password: password,
            isVerified: 1,
            updatedAt: new Date(),
            updatedBy: String(userId)
        })
        .where("user.id = :id", { id: userId })
        .updateEntity(true)
        .execute();

    return result.affected;
};

/**
 * create user
 */
export const createUser: any = async (body) => {
    const userRepository = getRepository(User);
    let response = await userRepository.save(body);
    if (response.agencyId === null) {
        let name = await getRepository(ClientDetails).findOne({ select: ['name'], where: { id: response.clientId } });
        response["company_name"] = name.name;
    } else {
        let name = await getRepository(AgencyDetails).findOne({ select: ['name'], where: { id: response.agencyId } });
        response["company_name"] = name.name;
    }
    return response;
};

export const getAllUsers: any = async (loggedInUser) => {
    let selectQuery = getRepository(User).createQueryBuilder("user")
        .innerJoin("user.userType_2", "user_type")
        .select(["user.id AS user_id", "user.user_type_id AS user_type_id", "user_type.type as user_type", "user.client_id as client_id", "user_type.name as user_type_name", "user.agency_id AS agency_id",
            "user.name AS name", "user.email AS email", "user.country_code AS country_code", "user.mobile AS mobile", "user.resource as resource"])
        .where(`user.id = ${loggedInUser.user_id}`)
    let response = {
        region_id: null,
        site_id: null
    };

    if (parseInt(loggedInUser.user_type_id) === UserType.CLIENT_SITE || parseInt(loggedInUser.user_type_id) === UserType.AGENCY_SITE) {
        let site = await getRepository(UserSiteAssociation).findOne({ select: ["siteId"], where: { userId: loggedInUser.user_id } });
        response["site_id"] = site.siteId;

    } else if (parseInt(loggedInUser.user_type_id) === UserType.CLIENT_REGIONAL) {
        let region = await getRepository(Region).findOne({ select: ["id"], where: { adminId: loggedInUser.user_id } });
        response["region_id"] = region.id;

    } else if (parseInt(loggedInUser.user_type_id) === UserType.AGENCY_REGIONAL) {
        let region = await getRepository(Region).findOne({ select: ["id"], where: { agencyRegionAdminId: loggedInUser.user_id } });
        response["region_id"] = region.id;
    }

    return { ...response, ... await selectQuery.getRawOne() };
};

/**
 * Add record in reset-password-token table
 * @param  {string} token
 * @param  {number} userId
 */
export const addResetPasswordToken = async (token: string, userId: number) => {
    const resetPasswordRepository = getRepository(ResetPasswordToken);
    return await resetPasswordRepository.save({
        token: token,
        userId: String(userId)
    });
}


/**
 * Remove record from reset-password-token table
 * @param  {string} token
 */
export const removeResetPasswordToken = async (token: string) => {
    const resetPasswordRepository = getRepository(ResetPasswordToken);
    return await resetPasswordRepository.delete({ token: token });
};

export const updateUserHelper = async (id, data) => {
    const userRepository = getRepository(User);
    return await userRepository.update(id, data)
}

export const getAdminUserDetailsHelper = async (whereClause) => {
    const userRepository = getRepository(User);
    let response = await userRepository.createQueryBuilder('user')
        .select(['user.id as user_id',
            'user.name as user_name',
            'user.country_code as country_code',
            'user.mobile as mobile',
            'user.email as email',
            "date_format(user.created_at,'%Y-%m-%d') as created_at"
        ])
        .where(whereClause)
        .getRawMany();
    return response;
}
export const getUsers = async (whereClause) => {
    const usersRepository = getRepository(User);
    let reponse = await usersRepository.createQueryBuilder("user")
        .innerJoin("user.userType_2", "user_type")
        .leftJoin("user.client", "client_details")
        .leftJoin("user.agency", "agency_details")
        .select(["user.id AS user_id",
            "user.user_type_id AS user_type_id",
            "user_type.type as user_type",
            "user_type.name as user_type_name",
            "user.agency_id AS agency_id",
            "user.client_id AS client_id",
            "user.name AS name",
            "user.email AS email",
            "user.country_code AS country_code",
            "user.mobile AS mobile",
            "user.resource as resource",
            "client_details.name as client_name",
            "agency_details.name as agency_name"])
        .where(whereClause)
        .getRawMany();
    return reponse;
}

export const getUserById = async (userId) => {
    const usersRepository = getRepository(User);
    return await usersRepository.createQueryBuilder("user")
        .innerJoin("user.userType_2", "user_type")
        .leftJoin("user.client", "client_details")
        .leftJoin("user.agency", "agency_details")
        .select([
            "user.id AS id",
            "user.user_type_id AS user_type_id",
            "user.national_insurance_number as national_insurance_number",
            "user.email AS email",
            `user.resource as resource`,
            `user.documents AS documents`,
            "client_details.name as client_name",
            "agency_details.name as agency_name"
        ])
        .where("user.id = :userId", { userId })
        .getRawOne();
}

export const revokeUserProfileAccessHelper = async (user_id, loggedInUser) => {
    return await getRepository(User).update(user_id, {
        password: null,
        updatedAt: new Date(Date.now()),
        updatedBy: loggedInUser.user_id
    });
}

export const nationalInsuranceNumberExistsHelper: any = async (nationalInsuranceNumber: string) => {
    return await getRepository(User).count({ where: { nationalInsuranceNumber } })
}


export const getRequestedUserEmailCounts: any = async (emailList: string[]) => {
    const userRepository = getRepository(User);
    return await userRepository.count(
        {
            where: { email: In(emailList) }
        }
    );
}

export const getUserByNationalInsuranceNumber: any = async (nationalInsuranceNumber: string) => {
    return await getRepository(User).findOne({ select: ['id'], where: { nationalInsuranceNumber } });
}

export const createWorkerUser: any = async (requestPayload, loggedInUser) => {
    let response = await getRepository(User).insert({
        userTypeId: UserType.AGENCY_WORKER.toString(),
        nationalInsuranceNumber: requestPayload.national_insurance_number,
        name: requestPayload.first_name + ' ' + requestPayload.last_name,
        email: requestPayload.email,
        countryCode: requestPayload.country_code || '',
        mobile: requestPayload.mobile || '',
        createdBy: loggedInUser,
        createdAt: new Date()
    })
    return response.generatedMaps[0]
}

export const addWorkerUserInBulk: any = async (workerUserData) => {
    return await getRepository(User).save(workerUserData);
}

export const getUserIdByNationalInsuranceNumber: any = async (nationalInsuranceNumbers) => {
    return await getRepository(User).find({
        select: ['id', 'nationalInsuranceNumber'],
        where: { nationalInsuranceNumber: In(nationalInsuranceNumbers) }
    });
}


export const updateUser: any = async (id, userDetails) => {
    return await getRepository(User).update(id, userDetails);
}

export const getWorkerUserDetails: any = async (id, worker_id) => {
    return await getRepository(User).createQueryBuilder('user')
        .innerJoin('user.workers3', 'worker')
        .select(['DISTINCT(user.id) as user_id', 'worker.id as worker_id', 'user.name as name', 'worker.post_code as post_code', 'IFNULL(user.documents,"") as documents'])
        .where(`user.id=${id} AND worker.id = ${worker_id}`)
        .getRawOne();
}

export const getAdminEmailsFromSiteId: any = async (siteId) => {
    return await getRepository(User).createQueryBuilder('user')
        .innerJoin('user.userSiteAssociations', 'user_site')
        .select(['user.email as email'])
        .where(`user_site.site_id = ${siteId} AND user.user_type_id = ${UserType.CLIENT_SITE}`)
        .getRawMany()
}

export const getAgencyAdminEmailByAgencyId: any = async (agencyId) => {
    return await getRepository(User).findOne({
        select: ['email'], where: {
            agencyId
        }
    })
}