import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { IconButton, Tooltip } from '@mui/material';
import 'leaflet-editable';
import 'leaflet.offline';
import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { selectActivity } from 'state/reducers/activity';
import { selectMap } from 'state/reducers/map';
import { selectTabs } from 'state/reducers/tabs';
import { useSelector } from 'state/utilities/use_selector';
import { toolStyles } from '../../Helpers/ToolStyles';
import { FlyToAndFadeItemTransitionType, useFlyToAndFadeContext } from './FlyToAndFade';

export const JumpToRecord = (props) => {
  const map = useMap();

  const mapState = useSelector(selectMap);
  const activityState = useSelector(selectActivity);
  const toolClass = toolStyles();
  const flyToContext = useFlyToAndFadeContext();

  const tabsState = useSelector(selectTabs);
  const [show, setShow] = React.useState(false);
  const divRef = useRef();

  useEffect(() => {
    try {
      L.DomEvent.disableClickPropagation(divRef?.current);
      L.DomEvent.disableScrollPropagation(divRef?.current);
    } catch (e) {}
  }, []);

  const jumpToActivity = async () => {
    const activityObject = activityState.activity;

    if (activityObject?.geometry) {
      const item = {
        //          name: 'Activity : ' + activity.name,
        geometries: activityObject.geometry,
        colour: 'red',
        transitionType: FlyToAndFadeItemTransitionType.zoomToGeometries
      };
      flyToContext.go([item]);
    }
  };

  if (mapState && map && tabsState && tabsState.tabConfig[tabsState.activeTab].label === 'Current Activity') {
    return (
      <div
        ref={divRef}
        className="leaflet-bottom leaflet-right"
        style={{
          bottom: '430px',
          width: '50px',
          height: '40px'
        }}>
        <Tooltip
          open={show}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          title={`Jump to Record`}
          placement="left-start">
          <span>
            <IconButton
              //disabled={startTimer}
              onClick={() => {
                jumpToActivity();
              }}
              className={'leaflet-control-zoom leaflet-bar leaflet-control ' + ' ' + toolClass.notSelected}
              sx={{ color: '#000' }}>
              <KeyboardReturnIcon />
            </IconButton>
          </span>
        </Tooltip>
      </div>
    );
  } else {
    return <></>;
  }
};
