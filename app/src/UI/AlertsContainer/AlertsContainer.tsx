import { Alert, Icon } from "@mui/material";
import { MapOutlined, Assignment, InsertPhoto } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import './AlertsContainer.css';
import AlertMessage from "interfaces/AlertMessage";
import { CLEAR_ALERT } from "state/actions";

const AlertsContainer = () => {
  const dispatch = useDispatch();
  const getImageFromSubject = (subject: string) => {
    switch (subject) {
      case 'map':
        return <MapOutlined />
      case 'form':
        return <Assignment />
      case 'photo':
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
    <div className="snackBarCont">
      {alerts.map((alert: AlertMessage) => (
        <Alert
          key={alert.id}
          severity={alert.severity}
          onClose={() => handleClose(alert.id)}
          className="snackBarAlert"
          icon={<Icon color={alert.severity}>{getImageFromSubject(alert.subject)}</Icon>}
        >
          {alert.content}
        </Alert>
      ))}
    </div>
  )
};

export default AlertsContainer;
