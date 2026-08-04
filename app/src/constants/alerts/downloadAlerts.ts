import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import AlertMessage from 'interfaces/AlertMessage';

const downloadAlertMessages: Record<string, AlertMessage> = {
  csvDownloadStarted: {
    severity: AlertSeverity.Info,
    subject: AlertSubjects.Download,
    content: 'Recordset CSV export started.',
    autoClose: 5
  },
  csvDownloadComplete: {
    severity: AlertSeverity.Success,
    subject: AlertSubjects.Download,
    content: 'Recordset CSV Export downloaded.',
    autoClose: 5
  },
  csvDownloadReady: {
    severity: AlertSeverity.Info,
    subject: AlertSubjects.Download,
    content: 'Recordset CSV Export is ready. You may now start the download button.',
    autoClose: 5
  }
};

export default downloadAlertMessages;
