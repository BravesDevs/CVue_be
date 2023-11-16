const sgMail = require("@sendgrid/mail");
import { BadRequestError, SendgridEmailTemplateDTO } from "../common";
import { config } from "../configurations";

/**
 * Method to send template Email from the configured Sendgrid account.
 * @param  {SendgridEmailTemplateDTO} payload
 */
export const sendTemplateEmail = async (payload: SendgridEmailTemplateDTO) => {
    try {
        let toEmail: any;
        if (Array.isArray(payload.toEmailId)) {
            toEmail = payload.toEmailId;
        } else {
            toEmail = { email: payload.toEmailId }
        }
        const message = {
            from: config.Sendgrid.FROM_EMAIL,
            template_id: payload.templateId,
            personalizations: [{
                to: toEmail,
                dynamic_template_data: payload.dynamicTemplateData
            }],

        };

        await sgMail.setApiKey(config.Sendgrid.API_KEY);
        await sgMail.send(message);
    }
    catch (err) {
        throw new BadRequestError("SENDGRID_BAD_REQUEST", "Email not sent.")
    }
}
