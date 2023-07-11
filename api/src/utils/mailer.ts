import { getEmailSettingsFromDB } from "../paths/email-settings";
import { getLogger } from "./logger";
const defaultLog = getLogger('access-request');

export class Mailer {
  private authenticationURL: string;
  private emailServiceURL: string;
  private clientId: string;
  private clientSecret: string;
  private enabled: boolean;

  constructor(authenticaitonURL: string, emailServiceURL: string, clientId: string, clientSecret: string, enabled: boolean = false) {
    this.authenticationURL = authenticaitonURL;
    this.emailServiceURL = emailServiceURL;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.enabled = enabled;
  }

  private async getBearerToken(): Promise<string> {
    const tokenEndpoint = `${this.authenticationURL}/auth/realms/comsvcauth/protocol/openid-connect/token`;
    const credentials = btoa(`${this.clientId}:${this.clientSecret}`)
    defaultLog.error("Tokenendpoint: " + tokenEndpoint + "\nCredentails; " + credentials )
    try {
      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${credentials}`,
        },
        body: 'grant_type=client_credentials',
      });

      const data = await response.json();
      defaultLog.error("Data: " + JSON.stringify(data));
      const { access_token } = data;
      return access_token;
    } catch (error) {
      console.error(JSON.stringify(error))
      defaultLog.error({ label: 'Mailer', message: 'Failed to retrieve bearer token: ', error });
      throw error;
    }
  }

  public async sendEmail(
    to: [string],
    from: string,
    subject: string,
    body: string,
    bodyType: string,
  ): Promise<void> {
    if (!this.enabled)
      return;
    const emailEndpoint = `${this.emailServiceURL}/api/v1/email`;

    try {
      const token = await this.getBearerToken();
      const emailPayload = {
        to,
        from,
        subject,
        body,
        bodyType,
      };
      await fetch(emailEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(emailPayload),
      }).then(response => {
        if (response.status > 199 && response.status < 300)
          defaultLog.debug({ label: 'Mailer', message: 'Email sent successfully' });
        else
          defaultLog.debug({ label: 'Mailer', message: 'Could not send Email: ' + response.statusText });
      }).catch(error => {
        defaultLog.error({ label: 'Mailer', message: 'Error sending email: ', error });
      });

    } catch (error) {
      console.error(JSON.stringify(error))
      defaultLog.error({ label: 'Mailer', message: 'Failed to send email:', error });
    }
  }
}

export const buildMailer = async () => {
  const response = await getEmailSettingsFromDB();
  if (response.code === 200)
    return new Mailer(response.result[0].authenticationurl, response.result[0].emailserviceurl, response.result[0].clientid, response.result[0].clientsecret, response.result[0].enabled);
}
