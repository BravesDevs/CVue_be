import { getRepository, In, Not } from 'typeorm';
import { AgencyClientAssociation, ClientDetails, Region, Sector, Site, User } from '../';
import { UserType } from '../../../common';
import { UserSiteAssociation } from '../entities/UserSiteAssociation';

export const addNewClient: any = async (data) => {
    const clientDetailsRepository = getRepository(ClientDetails);
    let response = await clientDetailsRepository.insert({
        name: data.name,
        sectorId: data.sectorId,
        address: {
            address_line_1: data.address_line_1,
            address_line_2: data.address_line_2 || '',
            address_line_3: data.address_line_3 || ''
        },
        postCode: data.postCode,
        city: data.city,
        country: data.country,
        createdBy: data.user_id,
        updatedBy: data.user_id
    });
    return response.generatedMaps[0];
};

export const updateExistingClient: any = async (data, id) => {
    const clientDetailsRepository = getRepository(ClientDetails);
    data.updatedAt = new Date();
    return await clientDetailsRepository.update(id, data);
};

export const getAllClients: any = async (loggedInUser, page, limit, sortBy, sortType) => {
    let response: any;
    //Get all the client details associated with the agency.
    if (parseInt(loggedInUser.user_type_id) === UserType.AGENCY_ADMIN) {
        let userRepository = getRepository(User);
        let data = await userRepository.createQueryBuilder("user").select(["user.agency_id as agency_id"]).where({ id: parseInt(loggedInUser.user_id) }).getRawOne();
        const agencyid = parseInt(data.agency_id);
        const agencyclientAssocRepository = getRepository(AgencyClientAssociation);
        response = await agencyclientAssocRepository.createQueryBuilder("agency_client_association")
            .innerJoin("agency_client_association.client", "client_details")
            .innerJoin("client_details.sector", "sector")
            .select([
                "agency_client_association.id as association_id",
                "client_details.id as client_id",
                "client_details.name as client_name",
                "client_details.sector_id as sector_id",
                "sector.value as sector_name",
                "client_details.address as address",
                "client_details.post_code as post_code",
                "client_details.city as city",
                "client_details.country as country",
                "client_details.created_at as created_at",
            ]).where({ agencyId: agencyid })
            .orderBy(sortBy, sortType)
            .addOrderBy('agency_client_association.id', sortType.toUpperCase())
            .offset((page - 1) * limit)
            .limit(limit)
            .execute()
        response["count"] = await agencyclientAssocRepository.count({ where: { agencyId: agencyid } })
        return response;
    }
    // //Get all the clients.
    else {
        const clientDetailsRepository = getRepository(ClientDetails);
        response = await clientDetailsRepository.createQueryBuilder("client_details")
            .innerJoin('client_details.sector', 'sector')
            .select([
                'client_details.id AS client_id',
                'client_details.name AS client_name',
                "client_details.sector_id as sector_id",
                'sector.value as sector_name',
                'client_details.address as address',
                'client_details.post_code as post_code',
                'client_details.city as city',
                'client_details.country as country',
                'client_details.created_at AS created_at'
            ])
            .orderBy(sortBy, sortType)
            .addOrderBy('client_details.id', sortType.toUpperCase())
            .offset((page - 1) * limit)
            .limit(limit)
            .execute()
        response["count"] = await clientDetailsRepository.count()
        return response;
    }
};

export const getClientsById: any = async (clientId) => {
    const clientDetailsRepository = getRepository(ClientDetails);
    let response = await clientDetailsRepository.createQueryBuilder('client_details')
        .innerJoin('client_details.sector', 'sector')
        .select([
            'client_details.id AS id',
            'client_details.name AS name',
            'client_details.sector_id AS sector_id',
            'sector.value as sector_name',
            'client_details.address as address',
            'client_details.post_code as post_code',
            'client_details.city as city',
            'client_details.country as country',
            "date_format(client_details.created_at,'%Y-%m-%d') as created_at",
            'client_details.resource AS resource'
        ])
        .where({ id: clientId })
        .getRawOne();
    return response;
};

/**
 * Get list of sectors
 */
export const getSectorsList: any = async () => {
    const sectorRepository = getRepository(Sector);

    return await sectorRepository.find({
        select: ['id', 'key', 'value']
    });
};

export const getClientByNames: any = async (names) => {
    const clientDetailsRepository = getRepository(ClientDetails);
    return await clientDetailsRepository.find(
        {
            where: { name: In(names) },
            select: ['id', 'name']
        }
    );
};

export const getClientUsersHelper: any = async (whereClause) => {
    let selectQuery = getRepository(User).createQueryBuilder('user')
        .innerJoin('user.userType_2', 'user_type')
        .leftJoin('user.userSiteAssociations', 'user_site_association')
        .leftJoin('user_site_association.site', 'site')
        .select(['user.id as id',
            'user.name as user_name',
            'user.user_type_id as user_type_id',
            'user_type.type as user_type',
            'user_type.name as user_type_name',
            'user.name as name',
            'user.email as email',
            'CASE WHEN user.password is null THEN 0 ELSE 1 END as is_able_access',
            "IFNULL(user.country_code,'') as country_code",
            "IFNULL(user.mobile,'') as mobile",
            "IFNULL(site.id,'') as site_id",
            "IFNULL(site.name,'') as site_name",
            "IFNULL(region.id,'') as region_id",
            "IFNULL(region.name,'') as region_name"
        ])
        .where(whereClause)

    selectQuery = whereClause.includes('agencyId') ? selectQuery.leftJoin('user.region2', 'region') : selectQuery.leftJoin('user.region', 'region')
    return await selectQuery.getRawMany();

}

export const addClientSiteUser: any = async (payload, loggedInUser) => {
    const userRepository = await getRepository(User).findOne({ select: ['clientId'], where: { id: loggedInUser.user_id } });
    const clientRepository = await getRepository(ClientDetails).findOne({ select: ['name'], where: { id: userRepository.clientId } });
    const clientId = userRepository.clientId;
    let obj = {
        "userTypeId": payload.client_role,
        "clientId": clientId,
        "name": payload.name,
        "email": payload.email,
        "mobile": payload.phone,
        "countryCode": payload.country_code
    }
    let response = await getRepository(User).insert(obj);
    response.generatedMaps[0]['company_name'] = clientRepository.name;
    let client_user_id = response.generatedMaps[0].id;
    await getRepository(UserSiteAssociation).insert({ userId: client_user_id, siteId: payload.id, createdBy: loggedInUser.user_id, updatedBy: loggedInUser.user_id })
    return response.generatedMaps[0]
}

export const addClientRegionUser: any = async (payload, loggedInUser) => {
    const userRepository = await getRepository(User).findOne({ select: ['clientId'], where: { id: loggedInUser.user_id } });
    const clientRepository = await getRepository(ClientDetails).findOne({ select: ['name'], where: { id: userRepository.clientId } });
    const clientId = userRepository.clientId;
    let obj = {
        "userTypeId": payload.client_role,
        "clientId": clientId,
        "name": payload.name,
        "email": payload.email,
        "mobile": payload.phone,
        "countryCode": payload.country_code
    }
    let response = await getRepository(User).insert(obj);
    response.generatedMaps[0]['company_name'] = clientRepository.name;
    let client_user_id = response.generatedMaps[0].id;
    await getRepository(Region).update(payload.id, { adminId: client_user_id })
    return response.generatedMaps[0]
}

export const updateClientUserHelper: any = async (client_user_id, payload) => {
    return await getRepository(User).update(client_user_id, payload);
}

export const getClientUsersByIDHelper: any = async (whereClause) => {
    const userRepository1 = getRepository(User);
    let response = await userRepository1.createQueryBuilder('user')
        .innerJoin('user.userType_2', 'user_type')
        .innerJoin('user.client', 'client_details')
        .leftJoin('user.region', 'region')
        .leftJoin('user.userSiteAssociations', 'user_site_association')
        .leftJoin('user_site_association.site', 'site')
        .select(['user.id as id',
            'user.name as user_name',
            'user.user_type_id as user_type_id',
            'user_type.type as user_type',
            'user_type.name as user_type_name',
            'user.name as name',
            'user.email as email',
            'client_details.name as client_name',
            'CASE WHEN user.password is null THEN 0 ELSE 1 END as is_able_access',
            'user.country_code as country_code',
            "IFNULL(user.mobile,'') as mobile",
            'site.id as site_id',
            'site.name as site_name',
            'region.id as region_id',
            'region.name as region_name'
        ])
        .where(whereClause)
        .getRawOne();
    return response;
}

export const removeUserSiteAssociation: any = async (userId, siteId) => {
    return await getRepository(UserSiteAssociation).delete({ userId, siteId })
}

export const generateUserSiteAssociation: any = async (userId: string, siteId: string, loggedInUserId) => {
    return await getRepository(UserSiteAssociation).insert({ userId, siteId, createdBy: loggedInUserId, updatedBy: loggedInUserId })
}

export const getClientUserIdById: any = async (clientId) => {
    return await getRepository(User).createQueryBuilder('user')
        .innerJoin('user.client', 'client')
        .select('user.id')
        .where(`user.client_id = '${clientId}' AND user.user_type_id = '${UserType.CLIENT_ADMIN}'`)
        .getRawOne();
};


export const getAgencyUserIdById: any = async (agencyId) => {
    return await getRepository(User).createQueryBuilder('user')
        .innerJoin('user.agency', 'agency')
        .select('user.id')
        .where(`user.agency_id = '${agencyId}' AND user.user_type_id = '${UserType.AGENCY_ADMIN}'`)
        .getRawOne();
};
