const SlackHook = require("winston-slack-webhook-transport");
import { slackErrorMessageFormat } from './../../common/';
import { config } from './../config';

let slackFormatter = info => {
 
	let message = slackErrorMessageFormat;
	message.attachments[0].pretext = message.attachments[0].pretext.replace('{service-name}', config.APP_NAME)
	let attachmentFieldObject = [];

	let attachmentFiel = {
		title: "Message",
		value: info.message,
		short: false
	}
	attachmentFieldObject.push(attachmentFiel);
	
	let metadata = info.metadata || {};
	for (let key in metadata) {
		attachmentFiel = {
			title: key,
			value: metadata[key],
			short: false
		}
		attachmentFieldObject.push(attachmentFiel);
	}
	message.attachments[0].fields = attachmentFieldObject;
	return message;
}

export let getSlackLoggerTransport = () => {
    return new SlackHook({
        webhookUrl: config.ERROR_WEBHOOK_URL,
        username: 'bot',
        channel: '#logs',
        level: "warn",
        formatter: info => slackFormatter(info),
		handleExceptions: true
    });
};
