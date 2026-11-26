import { CreateBugReportInSchema } from 'api/api-schema';
import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import AlertMessage from 'interfaces/AlertMessage';

export const defaultSchema: CreateBugReportInSchema = {
  description: '',
  device: 'Unknown',
  reproducible: false,
  expected_behavior: '',
  offline: false,
  online: false,
  issue_type: '',
  title: ''
};

export const alertMessages: Record<PropertyKey, AlertMessage> = {
  success: {
    content: 'Your bug report has been submitted.',
    severity: AlertSeverity.Success,
    subject: AlertSubjects.Form,
    autoClose: 3
  },
  fail: {
    content: 'Failed to submit report. Please try again.',
    severity: AlertSeverity.Error,
    subject: AlertSubjects.Form,
    autoClose: 3
  }
};
