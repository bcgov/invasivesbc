import { IconButton, Tooltip } from '@mui/material';
import { useDispatch, useSelector } from 'utils/use_selector';
import { useHistory } from 'react-router-dom';
import 'UI/Global.css';
import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import Alerts from 'state/actions/alerts/Alerts';
import WhatsHere from 'state/actions/whatsHere/WhatsHere';
import { HourglassTop, TravelExplore } from '@mui/icons-material';
import { useState } from 'react';

export const WhatsHereButton = () => {
  const handleWhatsHere = () => {
    if (!whatsHere.toggle) {
      dispatch(
        Alerts.create({
          content: 'Outline a region on the map to view records in the area.',
          autoClose: 5,
          severity: AlertSeverity.Info,
          subject: AlertSubjects.Map
        })
      );
    } else if (history.location.pathname === '/WhatsHere') {
      history.goBack();
    }
    dispatch(WhatsHere.toggle());
  };

  const dispatch = useDispatch();
  const history = useHistory();
  const whatsHere = useSelector((state) => state.Map.whatsHere);
  const [show, setShow] = useState(false);
  return (
    <div className={whatsHere.toggle ? 'map-btn-selected' : 'map-btn'}>
      <Tooltip
        open={show}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        classes={{ tooltip: 'toolTip' }}
        title={`What's here?`}
        placement="top-end"
      >
        <span>
          <IconButton className={'button'} onClick={handleWhatsHere}>
            {(whatsHere.loadingActivities || whatsHere.loadingIAPP) && <HourglassTop />}
            <TravelExplore />
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
};
