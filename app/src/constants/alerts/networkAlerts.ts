import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import AlertMessage from 'interfaces/AlertMessage';

const networkAlertMessages: Record<string, AlertMessage> = {
  userWentOffline: {
    content: 'You are now offline, Some functionality may be limited',
    severity: AlertSeverity.Warning,
    subject: AlertSubjects.Network,
    autoClose: 6
  },
  userWentOnline: {
    content: 'You are back online. Functionality is restored',
    severity: AlertSeverity.Info,
    subject: AlertSubjects.Network,
    autoClose: 6
  }
};

export default networkAlertMessages;
