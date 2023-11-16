import { getRepository } from 'typeorm';
import { MobileVersion } from '../entities/MobileVersion';

/**
 * Get mobile app version details
 */
export const getmobileVersionDetails: any = async () => {
    let response = await getRepository(MobileVersion).createQueryBuilder("mobile_version")
        .where('mobile_version.is_latest_running = 1')
        .orderBy('mobile_version.created_at', 'DESC')
        .getRawOne();
    return response;
};
