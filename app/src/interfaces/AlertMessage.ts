import { AlertSeverity, AlertSubjects } from "constants/alertEnums";

interface AlertMessage {
  severity: AlertSeverity;
  subject: AlertSubjects;
  content: string;
  autoClose?: number;
  id: string;
}

export default AlertMessage;
