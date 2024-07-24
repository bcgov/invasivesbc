import { AlertSeverity, AlertSubjects } from "constants/alertEnums";

interface AlertMessage {
  severity: AlertSeverity;
  subject: AlertSubjects;
  content: string;
  title?: string;
  autoClose?: number;
  id: string;
}

export default AlertMessage;
