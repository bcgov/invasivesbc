interface AlertMessage {
  severity: 'error' | 'info' | 'success' | 'warning';
  subject: 'map' | 'form' | 'photo';
  content: string;
  autoClose?: number;
  id: string;
}

export default AlertMessage;
