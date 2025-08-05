import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import AlertMessage from 'interfaces/AlertMessage';

const tripAlertMessages: Record<string, AlertMessage> = {
  submitted: {
    content: 'Your trip has been submitted.',
    severity: AlertSeverity.Success,
    subject: AlertSubjects.PlanMyTrip,
    autoClose: 3
  }
};

export default tripAlertMessages;
