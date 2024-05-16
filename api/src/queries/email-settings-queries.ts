import { SQL, SQLStatement } from 'sql-template-strings';

export function getEmailSettingsSQL(): SQLStatement {
  return SQL`SELECT enabled,
        authentication_url as authenticationURL,
        email_service_url as emailserviceURL,
        client_id as clientId,
        client_secret as clientSecret,
        email_setting_id as id
        FROM email_settings;`;
}

export function updateEmailSettingsSQL(
  enabled: boolean,
  authenticationURL: string,
  emailServiceURL: string,
  clientId: string,
  clientSecret: string,
  id: number
): SQLStatement {
  return SQL`
    update email_settings
    set enabled = ${enabled},
    authentication_url = ${authenticationURL},
    email_service_url = ${emailServiceURL},
    client_id = ${clientId},
    client_secret = ${clientSecret}
    where email_setting_id = ${id}
  `;
}
