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
    severity: AlertSeverity.Success,
    subject: AlertSubjects.Network,
    autoClose: 6
  },
  userWentOnlineWithUnsyncedActivities: {
    content: 'You are back online. Functionality is restored, you have unsynchronized activities.',
    severity: AlertSeverity.Info,
    subject: AlertSubjects.Network
  },
  userLostConnection: {
    content: 'You have been disconnected from the service, please check your internet connection.',
    severity: AlertSeverity.Error,
    subject: AlertSubjects.Network,
    autoClose: 10
  },
  attemptToReconnectFailed: {
    content: 'Unable to return online. Please check your internet connection and try again',
    severity: AlertSeverity.Error,
    subject: AlertSubjects.Network,
    autoClose: 10
  },
  automaticReconnectFailed: {
    content: 'We were unable to bring you back online. Please try again later.',
    severity: AlertSeverity.Error,
    subject: AlertSubjects.Network,
    autoClose: 10
  }
};

export default networkAlertMessages;
