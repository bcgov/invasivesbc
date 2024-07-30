import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';

/**
 * @type {AlertMessage} AlertMessage
 * @property {AlertSeverity} severity - Type of alert to display, affects color scheme.
 * @property {AlertSubjects} subject - Relation of the alert to display, affects displayed Icon.
 * @property {string} content - Main text body of alert.
 * @property {string} [title] - Optional Title bar text.
 * @property {number} [autoclose] - Time in seconds to clear the alert automatically.
 * @property {string} [id] - Unique ID of Alert Message, auto-populated in handler.
 */
interface AlertMessage {
  severity: AlertSeverity;
  subject: AlertSubjects;
  content: string;
  title?: string;
  autoClose?: number;
  id?: string;
}

export default AlertMessage;
