import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import AlertMessage from 'interfaces/AlertMessage';

const cacheAlertMessages: Record<string, AlertMessage> = {
  recordsetCacheFailed: {
    content: 'Recordset failed to download.',
    severity: AlertSeverity.Error,
    subject: AlertSubjects.Cache,
    autoClose: 4
  },
  recordsetCacheSuccess: {
    content: 'Recordset downloaded successfully.',
    severity: AlertSeverity.Success,
    subject: AlertSubjects.Cache,
    autoClose: 4
  },
  recordsetDeleteCacheFailed: {
    content: 'Failed to delete Recordset.',
    severity: AlertSeverity.Error,
    subject: AlertSubjects.Cache,
    autoClose: 4
  },
  recordsetDeleteCacheSuccess: {
    content: 'Recordset has been deleted.',
    severity: AlertSeverity.Success,
    subject: AlertSubjects.Cache,
    autoClose: 4
  },
  recordSetDownloadStoppedEarly: {
    content: 'Recordset download stopped',
    severity: AlertSeverity.Success,
    subject: AlertSubjects.Cache,
    autoClose: 4
  },
  addedToQueue: {
    content: 'Download added to queue',
    severity: AlertSeverity.Info,
    subject: AlertSubjects.Cache,
    autoClose: 3
  },
  updateCaches: {
    content: 'Updating cached recordsets',
    severity: AlertSeverity.Info,
    subject: AlertSubjects.Cache,
    autoClose: 3
  },
  updateCachesSuccess: {
    content: 'Cached recordsets updated successfully',
    severity: AlertSeverity.Success,
    subject: AlertSubjects.Cache,
    autoClose: 3
  },
  updateCachesFailed: {
    content: 'Cached recordsets failed to update',
    severity: AlertSeverity.Error,
    subject: AlertSubjects.Cache,
    autoClose: 3
  }
};

export default cacheAlertMessages;
