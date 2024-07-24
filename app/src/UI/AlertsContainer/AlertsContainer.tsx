import { Alert, Icon } from "@mui/material";
import { MapOutlined, Assignment, InsertPhoto } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import './AlertsContainer.css';
import AlertMessage from "interfaces/AlertMessage";
import { CLEAR_ALERT } from "state/actions";
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
  const alerts = useSelector((state: any) => state.AlertsAndPrompts.alerts || [])

  return (
    <div className="alertsContainer">
      {alerts.map((alert: AlertMessage) => (
        <Alert
          key={alert.id}
          severity={alert.severity}
          onClose={() => handleClose(alert.id)}
          className="alertsContainerAlert"
          icon={<Icon color={alert.severity}>{getImageFromSubject(alert.subject)}</Icon>}
        >
          {alert.content}
        </Alert>
      ))}
    </div>
  )
};

export default AlertsContainer;
