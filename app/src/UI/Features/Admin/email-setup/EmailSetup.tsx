import EmailSettings from 'UI/Features/Admin/email-setup/EmailSettings';
import EmailTemplates from 'UI/Features/Admin/email-setup/EmailTemplates';
import 'UI/Features/Admin/email-setup/Email.css';

const EmailSetup = () => {
  return (
    <section id="email-setup">
      <EmailSettings />
      <EmailTemplates />
    </section>
  );
};
export default EmailSetup;
