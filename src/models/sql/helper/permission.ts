import { getRepository } from 'typeorm';
import { Permissions } from '../';

/**
 * Get permission array objects as per userTypeId (role)
 * @param  {number} userTypeId
 */
export const getPermissionsByUserType: any = async (userTypeId: number) => {
    const permissionRepository = getRepository(Permissions);
    return await permissionRepository
    .createQueryBuilder('permissions')
    .innerJoin('permissions.feature', 'feature')
    .where('permissions.userTypeId = :userTypeId', { userTypeId })
    .select(['permissions.id AS id', 'permissions.featureId AS feature_id', 'permissions.accessType AS access_type', 'permissions.userTypeId AS user_type_id', 'feature.name AS feature_name', 'feature.code AS feature_code'])
    .execute();
};



/**
 * Get permission object as per userTypeId (role) with featureId
 * @param  {number} userTypeId
 */
export const getPermissionsByUserTypeAndFeatureId: any = async (userTypeId: number, code: string) => {
    const permissionRepository = getRepository(Permissions);
    return await permissionRepository
    .createQueryBuilder('permissions')
    .innerJoin('permissions.feature', 'feature', 'feature.code = :code', { code })
    .where('permissions.userTypeId = :userTypeId', { userTypeId })
    .andWhere('feature.id = permissions.featureId')
    .select(['permissions.id AS id', 'permissions.featureId AS featureId', 'permissions.accessType AS accessType'])
    .getRawOne();
};
