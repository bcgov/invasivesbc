import { SQL, SQLStatement } from 'sql-template-strings';

export function getEmailTemplatesSQL(): SQLStatement {
  return SQL`SELECT template_name as templateName, from_email as fromEmail, email_subject as emailSubject,
    email_body as emailBody, email_template_id as id FROM email_templates order by email_template_id;`;
}

export function updateEmailTemplatesSQL(
  fromEmail: string,
  emailSubject: string,
  emailBody: string,
  id: number
): SQLStatement {
  return SQL`
    update email_templates
    set from_email = ${fromEmail},
    email_subject = ${emailSubject},
    email_body = ${emailBody}
    where email_template_id = ${id}
  `;
}
