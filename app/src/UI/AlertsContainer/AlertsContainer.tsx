import { Alert, AlertTitle, Button, Icon } from "@mui/material";
import { MapOutlined, Assignment, InsertPhoto } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import './AlertsContainer.css';
import AlertMessage from "interfaces/AlertMessage";
import { CLEAR_ALERT, CLEAR_ALERTS } from "state/actions";
import { AlertSubjects } from "constants/alertEnums";

const AlertsContainer = () => {
  const dispatch = useDispatch();
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
  const handleClose = (id: string) => {
    dispatch({
      type: CLEAR_ALERT,
      payload: { id }
    })
  }
  const handleClearAll = () => dispatch({ type: CLEAR_ALERTS })
  const alerts = useSelector((state: any) => state.AlertsAndPrompts.alerts || [])

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
          onClose={() => handleClose(alert.id)}
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
