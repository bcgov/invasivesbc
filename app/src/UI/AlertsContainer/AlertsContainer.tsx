import { Alert, AlertTitle, Button, Icon } from "@mui/material";
import { MapOutlined, Assignment, InsertPhoto } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import './AlertsContainer.css';
import AlertMessage from "interfaces/AlertMessage";
import { CLEAR_ALERT, CLEAR_ALERTS } from "state/actions";
import { AlertSubjects } from "constants/alertEnums";
import { useEffect, useRef } from "react";

const AlertsContainer = () => {
  const dispatch = useDispatch();
  const timeoutsRef = useRef<ReturnType<typeof setInterval>>({} as ReturnType<typeof setInterval>);
  const alerts = useSelector((state: any) => state.AlertsAndPrompts.alerts || [])

  /**
   * @desc Helper function, converts AlertSubjects to Icons
   */
  const getImageFromSubject = (subject: AlertSubjects) => {
    switch (subject) {
      case AlertSubjects.Map:
        return <MapOutlined />
      case AlertSubjects.Form:
        return <Assignment />
      case AlertSubjects.Photo:
        return <InsertPhoto />
      default:
        break;
    }
  }

  const handleClose = (alert) => {
    if (alert.id) {
      clearTimeout(timeoutsRef.current[alert.id]);
      delete timeoutsRef.current[alert.id];
      dispatch({
        type: CLEAR_ALERT,
        payload: { id: alert.id }
      });
    }
  };
  /**
   * @desc Handler for when autoClose parameter used
   * @param alert Alert to be cleared
   */
  const delayedClear = (alert) => {
    if (!alert.autoClose) return;
    timeoutsRef.current[alert.id] = setTimeout(() => handleClose(alert), alert.autoClose * 1000);
  };
  const handleClearAll = () => {
    Object.values(timeoutsRef.current).forEach(clearTimeout);
    timeoutsRef.current = {} as ReturnType<typeof setInterval>;
    dispatch({ type: CLEAR_ALERTS });
  };
  useEffect(() => {
    alerts.forEach(alert => {
      if (alert.autoClose && !timeoutsRef.current[alert.id]) {
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
      {
        alerts.length > 0 &&
        <Button
          variant="contained"
          onClick={handleClearAll}
          size="small"
          color="info"
          sx={{ width: '125pt', marginLeft: 'auto' }}
        >
          Clear All Alerts
        </Button>
      }
      {alerts.map((alert: AlertMessage) => (
        <Alert
          key={alert.id}
          severity={alert.severity}
          onClose={() => handleClose(alert)}
          className="alertsContainerAlert"
          icon={<Icon color={alert.severity}>{getImageFromSubject(alert.subject)}</Icon>}
        >
          {alert.title && <AlertTitle>{alert.title}</AlertTitle>}
          {alert.content}
        </Alert>
      ))}
    </div>
  )
};

export default AlertsContainer;
