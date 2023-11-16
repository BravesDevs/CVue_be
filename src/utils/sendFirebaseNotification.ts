import { firebaseServerEndpoint, HttpMethods } from '../common';
import { config } from '../configurations';
import { invokeApi } from './apiInvoker';

const header = {
    Authorization: `key=${config.FIREBASE_SERVER_KEY}`
}

export const sendNotificationsToMobiles = (registrationIds: Array<string>, title: string, body: string, image: string="", customData: any={}) => {
    const payload = {
        "registration_ids": registrationIds,
        "notification": {
            "title": title.substring(0, config.NOTIFICATION_TITLE_CHARACTER_LIMIT),
            "body": body.substring(0, config.NOTIFICATION_BODY_CHARACTER_LIMIT),
            "mutable_content": true,
            "image": image
        },
        "data": customData
    }

    return invokeApi(
        firebaseServerEndpoint,
        HttpMethods.POST,
        header,
        payload
    );
}
