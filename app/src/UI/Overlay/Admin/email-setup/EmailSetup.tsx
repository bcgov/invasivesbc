import EmailSettings from './EmailSettings';
import EmailTemplates from './EmailTemplates';
import './Email.css';

const EmailSetup = () => {
  return (
    <section id="email-setup">
      <EmailSettings />
      <EmailTemplates />
    </section>
  );
};
export default EmailSetup;
