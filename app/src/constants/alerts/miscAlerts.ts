import AlertMessage from 'interfaces/AlertMessage';

const miscAlertMessages: Record<string, AlertMessage> = {
  userRegistrationSubmitted: {
    content: 'Your registration has been submitted.',
    severity: 'success',
    subject: 'authentication',
    autoClose: 8
  },
  userRegistrationFailed: {
    content: 'We were unable to submit your registration request.',
    severity: 'error',
    subject: 'authentication',
    autoClose: 8
  }
};

export default miscAlertMessages;
