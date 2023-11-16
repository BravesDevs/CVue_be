/**
 * All the service layer methods for the mobile version.
 */
import { getmobileVersionDetails } from "./../models";

/**
 * API to get mobile version details
 */
export const getmobileVersionService = async () => {
    let mobileVersionDetails = await getmobileVersionDetails();
    return [200, {
        ok: true,
        id: mobileVersionDetails.mobile_version_id,
        name: mobileVersionDetails.mobile_version_name,
        description: mobileVersionDetails.mobile_version_description,
        ios_version: mobileVersionDetails.mobile_version_ios_version,
        android_version: mobileVersionDetails.mobile_version_android_version,
        is_forced_update: Boolean(mobileVersionDetails.mobile_version_is_forced_update),
        is_latest_running: Boolean(mobileVersionDetails.mobile_version_is_latest_running),
        created_at: mobileVersionDetails.mobile_version_created_at
    }];
};