import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import AlertMessage from 'interfaces/AlertMessage';

const formAlerts: Record<PropertyKey, AlertMessage> = {
  recordSubmittedSuccess: {
    severity: AlertSeverity.Success,
    subject: AlertSubjects.Form,
    content: 'Form submitted successfully.',
    autoClose: 8
  },
  recordSubmittedFailure: {
    severity: AlertSeverity.Error,
    subject: AlertSubjects.Form,
    content: 'An error ocurred during submission',
    autoClose: 8
  }
};

export default formAlerts;
