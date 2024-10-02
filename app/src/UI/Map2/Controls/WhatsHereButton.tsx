import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { IconButton, Tooltip } from '@mui/material';
import { useSelector } from 'utils/use_selector';
import { MAP_TOGGLE_WHATS_HERE } from 'state/actions';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';

import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import { useHistory } from 'react-router-dom';
import 'UI/Global.css';
import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import Alerts from 'state/actions/alerts/Alerts';

export const WhatsHereButton = (props) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const whatsHere = useSelector((state: any) => state.Map.whatsHere);
  const [show, setShow] = React.useState(false);

  const divRef = useRef();

  if (whatsHere) {
    return (
      <div ref={divRef} className={(whatsHere as any)?.toggle ? 'map-btn-selected' : 'map-btn'}>
        <Tooltip
          open={show}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          classes={{ tooltip: 'toolTip' }}
          title={`What's here?`}
          placement="top-end"
        >
          <span>
            <IconButton
              className={'button'}
              onClick={() => {
                if ((whatsHere as any)?.toggle == false) {
                  dispatch({ type: MAP_TOGGLE_WHATS_HERE });
                  dispatch(
                    Alerts.create({
                      content: 'Outline a region on the map to view records in the area.',
                      autoClose: 5,
                      severity: AlertSeverity.Info,
                      subject: AlertSubjects.Map
                    })
                  );
                } else {
                  history.goBack();
                }
              }}
            >
              {(whatsHere as any)?.loadingActivities || (whatsHere as any)?.loadingIAPP ? <HourglassTopIcon /> : <></>}
              <DocumentScannerIcon />
            </IconButton>
          </span>
        </Tooltip>
      </div>
    );
  } else {
    return <></>;
  }
};

//temporary fix to type is undefined error
(window as any).type = undefined;

export const WhatsHereDrawComponent = (props) => {
  const ref = useRef();
  const whatsHere = useSelector((state: any) => state.Map?.whatsHere);

  useEffect(() => {
    if ((whatsHere as any)?.toggle == true && (whatsHere as any)?.feature == null) {
      //      ref.current = new (L as any).Draw.Rectangle(map);
      //     (ref.current as any).enable();
    }

    return () => {
      if (ref.current) (ref.current as any).disable();
    };
  }, [whatsHere]);

  /*
  useMapEvent('draw:created' as any, (e) => {
    if ((whatsHere as any).toggle && (whatsHere as any)?.feature === null) {
      history.push('/WhatsHere');
      dispatch({ type: MAP_WHATS_HERE_FEATURE, payload: { feature: e.layer.toGeoJSON() } });
    }
  });
  */

  return <></>;
};
