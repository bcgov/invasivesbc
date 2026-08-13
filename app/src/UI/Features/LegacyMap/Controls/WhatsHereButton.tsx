import { IconButton } from '@mui/material';
import { useDispatch, useSelector } from 'utils/use_selector';
import 'UI/Global.css';
import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import Alerts from 'state/actions/alerts/Alerts';
import WhatsHere from 'state/actions/whatsHere/WhatsHere';
import { HourglassTop, TravelExplore } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router';
import HoverTooltip from 'UI/Reusable/HoverTooltip/HoverTooltip';

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
    } else if (location.pathname === '/WhatsHere') {
      navigate(-1);
    }
    dispatch(WhatsHere.toggle());
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const whatsHere = useSelector((state) => state.Map.whatsHere);

  return (
    <div className={whatsHere.toggle ? 'map-btn-selected' : 'map-btn'}>
      <HoverTooltip tooltipText={"What's Here?"}>
        <IconButton className={'button'} onClick={handleWhatsHere}>
          {(whatsHere.loadingActivities || whatsHere.loadingIAPP) && <HourglassTop />}
          <TravelExplore />
        </IconButton>
      </HoverTooltip>
    </div>
  );
};
