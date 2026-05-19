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
    content: 'An error occurred during submission',
    autoClose: 8
  },
  recordDeleted: {
    content: 'Record deleted',
    severity: AlertSeverity.Success,
    subject: AlertSubjects.Form,
    autoClose: 8
  },
  insufficientDeletePermission: {
    content: 'Cannot delete record, insufficient permissions.',
    severity: AlertSeverity.Error,
    subject: AlertSubjects.Form,
    autoClose: 8
  },
  noActiveForm: {
    content: 'No active form.',
    severity: AlertSeverity.Error,
    subject: AlertSubjects.Form,
    autoClose: 8
  },
  recordCouldNotBeDeleted: {
    content: 'An error occurred, could not delete record at this time.',
    severity: AlertSeverity.Error,
    subject: AlertSubjects.Form,
    autoClose: 8
  }
};

export default formAlerts;
