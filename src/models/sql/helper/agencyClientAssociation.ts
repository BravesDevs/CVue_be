import { getRepository } from 'typeorm';
import { AgencyClientAssociation } from '../';

/**
 * create agency association
 */
export const createAgencyAssociation: any = async (body) => {
    const agencyAssociationRepository = getRepository(AgencyClientAssociation);
    return await agencyAssociationRepository.save(body);
};

/**
 * update agency association
 */
export const updateAgencyAssociation: any = async (id, body) => {
    const agencyAssociationRepository = getRepository(AgencyClientAssociation);
    body.updatedAt = new Date();
    return await agencyAssociationRepository.update({ id }, body);
};

/**
 * get agency association list
 */
export const getAgencyAssociationList: any = async (page, limit, sort_by, sort_type, whereClause) => {
    const agencyAssociationRepository = getRepository(AgencyClientAssociation);
    let response = await agencyAssociationRepository
        .createQueryBuilder('agency_client_association')
        .innerJoin('agency_client_association.client', 'client')
        .innerJoin('agency_client_association.agency', 'agency')
        .select(['agency_client_association.id AS id', 'agency_client_association.margin AS margin',
            'agency_client_association.agency.id AS agency_id', 'agency_client_association.client.id AS client_id',
            'client.name AS client_name', 'agency.name AS agency_name', 'agency_client_association.currency AS currency',
            'client.city AS client_city', 'client.sector AS client_sector', 'client.country AS client_country',
            'agency.city AS agency_city', 'agency.country AS agency_country'])
        .where(whereClause)
        .orderBy(sort_by, sort_type)
        .addOrderBy('agency_client_association.id', sort_type.toUpperCase())
        .offset((page - 1) * limit)
        .limit(limit)
        .execute();
    response["count"] = await agencyAssociationRepository.count({ where: whereClause })
    return response
};

/**
 * get agency association By Id
 */
export const getAgencyAssociationById: any = async (id) => {
    const agencyAssociationRepository = getRepository(AgencyClientAssociation);
    return await agencyAssociationRepository.createQueryBuilder("agency_client_association")
        .where("agency_client_association.id = :id", { id })
        .select(['id', 'client_id', 'agency_id', 'margin'])
        .getRawOne();
};

/**
 * get agency association By agencyId and clientId
 */
export const getAgencyAssociationByAgencyIdAndClientId: any = async (agencyId, clientId) => {
    const agencyAssociationRepository = getRepository(AgencyClientAssociation);
    return await agencyAssociationRepository.createQueryBuilder("agency_client_association")
        .where("agency_client_association.agency_id = :agencyId AND agency_client_association.client_id = :clientId", { agencyId, clientId })
        .orderBy("id", "DESC")
        .limit(1)
        .select(['id', 'margin'])
        .getRawOne();
};

/**
 * get agency association By clientId
 */
export const getAgencyAssociationByClientId: any = async (clientId) => {
    const agencyAssociationRepository = getRepository(AgencyClientAssociation);
    return await agencyAssociationRepository.createQueryBuilder("agency_client_association")
        .where("agency_client_association.client_id = :clientId", { clientId })
        .select(['id'])
        .getRawMany();
};

/**
 * get agency association with agencyName and clientName
 */
export const getAgencyAssociationByAgencyNameAndClientName: any = async (agencyName, clientName) => {
    const agencyAssociationRepository = getRepository(AgencyClientAssociation);
    return await agencyAssociationRepository.createQueryBuilder("agency_client_association")
        .innerJoin('agency_client_association.client', 'client')
        .innerJoin('agency_client_association.agency', 'agency')
        .where("agency.name = :agencyName AND client.name = :clientName", { agencyName, clientName })
        .select(['agency_client_association.agency_id AS agencyId', 'client.name AS clientName', 'agency_client_association.client_id AS clientId', 'agency.name AS agencyName'])
        .getRawOne();
};

/**
 * get associated clients by agencyId.
 */
export const getAssociatedClients: any = async (agencyId) => {
    return await getRepository(AgencyClientAssociation).find({
        select: ['clientId'], where: {
            agencyId
        }
    })
};


/**
 * get associated agencies by clientId.
 */
export const getAssociatedAgencies: any = async (clientId) => {
    return await getRepository(AgencyClientAssociation).find({
        select: ['agencyId'], where: {
            clientId
        }
    })
};

