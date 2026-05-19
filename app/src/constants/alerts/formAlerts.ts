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
    content: 'You do not have permission to delete this record.',
    severity: AlertSeverity.Error,
    subject: AlertSubjects.Form,
    autoClose: 8
  },
  noActiveForm: {
    content: 'There is no active form to perform this action on.',
    severity: AlertSeverity.Error,
    subject: AlertSubjects.Form,
    autoClose: 8
  },
  recordCouldNotBeDeleted: {
    content: 'Could not delete record.',
    severity: AlertSeverity.Error,
    subject: AlertSubjects.Form,
    autoClose: 8
  }
};

export default formAlerts;
