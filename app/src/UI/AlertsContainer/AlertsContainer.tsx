/**
 * @desc Main controller for the User Alert System
 * @external {@link https://github.com/bcgov/invasivesbc/wiki/User-Alert-System }
 */
import { Alert, AlertTitle, Button, Icon } from '@mui/material';
import { MapOutlined, Assignment, InsertPhoto } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import './AlertsContainer.css';
import AlertMessage from 'interfaces/AlertMessage';
import { AlertSubjects } from 'constants/alertEnums';
import { useEffect, useRef } from 'react';
import { useSelector } from 'utils/use_selector';
import { clearAlert, clearAllAlerts } from 'state/actions/userAlerts.ts/userAlerts';

const AlertsContainer = () => {
  const dispatch = useDispatch();
  const timeoutsRef = useRef<ReturnType<typeof setInterval>>({} as ReturnType<typeof setInterval>);
  const alerts = useSelector((state) => state.AlertsAndPrompts.alerts);

  /**
   * @desc Helper function, converts AlertSubjects to Icons
   */
  const getImageFromSubject = (subject: AlertSubjects) => {
    switch (subject) {
      case AlertSubjects.Map:
        return <MapOutlined />;
      case AlertSubjects.Form:
        return <Assignment />;
      case AlertSubjects.Photo:
        return <InsertPhoto />;
      default:
        break;
    }
  };

  const handleClose = (id: string) => {
    if (id) {
      clearTimeout(timeoutsRef.current[id]);
      delete timeoutsRef.current[id];
      dispatch(clearAlert(id));
    }
  };
  /**
   * @desc Handler for when autoClose parameter used
   * @param alert Alert to be cleared
   */
  const delayedClear = (alert: AlertMessage) => {
    if (!alert.autoClose) return;
    timeoutsRef.current[alert.id!] = setTimeout(() => handleClose(alert.id!), alert.autoClose * 1000);
  };

  const handleClearAll = () => {
    Object.values(timeoutsRef.current).forEach(clearTimeout);
    timeoutsRef.current = {} as ReturnType<typeof setInterval>;
    dispatch(clearAllAlerts());
  };

  useEffect(() => {
    alerts.forEach((alert) => {
      if (alert.autoClose && !timeoutsRef.current[alert.id!]) {
        delayedClear(alert);
      }
    });

    // Cleanup function to clear timeouts on unmount
    return () => {
      Object.values(timeoutsRef.current).forEach(clearTimeout);
      timeoutsRef.current = {} as ReturnType<typeof setInterval>;
    };
  }, [alerts]);

  return (
    <div className="alertsContainer">
      {alerts.length > 0 && (
        <Button
          variant="contained"
          onClick={handleClearAll}
          size="small"
          color="info"
          sx={{ width: '125pt', marginLeft: 'auto' }}
        >
          Clear All Alerts
        </Button>
      )}
      {alerts.map(({ id, severity, subject, title, content }) => (
        <Alert
          key={id}
          severity={severity}
          onClose={() => handleClose(id!)}
          className="alertsContainerAlert"
          icon={<Icon color={severity}>{getImageFromSubject(subject)}</Icon>}
        >
          {title && <AlertTitle>{title}</AlertTitle>}
          {content}
        </Alert>
      ))}
    </div>
  );
};

export default AlertsContainer;
