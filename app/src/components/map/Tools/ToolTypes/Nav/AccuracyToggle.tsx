import AttributionIcon from '@mui/icons-material/Attribution';
import { IconButton, Tooltip } from '@mui/material';
import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-editable';
import 'leaflet.offline';
import React, { useEffect, useRef } from 'react';
import { Circle, useMap } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { MAP_TOGGLE_ACCURACY } from 'state/actions';
import { selectMap } from 'state/reducers/map';
import { useSelector } from 'state/utilities/use_selector';
import { toolStyles } from '../../Helpers/ToolStyles';

export const AccuracyToggle = (props) => {
  const mapState = useSelector(selectMap);
  const dispatch = useDispatch();

  const [show, setShow] = React.useState(false);
  const toolClass = toolStyles(); // Get the classes from the context

  const divRef = useRef();
  useEffect(() => {
    try {
      L.DomEvent.disableClickPropagation(divRef?.current);
      L.DomEvent.disableScrollPropagation(divRef?.current);
    } catch (e) {}
  }, []);
  if (!mapState || !mapState?.positionTracking) {
    return <></>;
  } else {
    return (
      <div
        ref={divRef}
        className="leaflet-bottom leaflet-right"
        style={{
          bottom: '80px',
          width: '50px',
          height: '40px'
        }}>
        <Tooltip
          open={show}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          title={mapState?.accuracyToggle ? 'Hide Accuracy' : 'Show Accuracy'}
          placement="left-start">
          <span>
            <IconButton
              onClick={() => {
                dispatch({ type: MAP_TOGGLE_ACCURACY });
              }}
              className={
                'leaflet-control-zoom leaflet-bar leaflet-control ' +
                // toolClass.customHoverFocus +
                ' ' +
                (mapState?.accuracyToggle ? toolClass.selected : toolClass.notSelected)
              }
              sx={{ color: '#000' }}>
              <AttributionIcon />
            </IconButton>
          </span>
        </Tooltip>
      </div>
    );
  }
};

/**
 * @description Draws an accuracy indicating circle
 */

export const AccuracyMarker = (props) => {
  const mapState = useSelector(selectMap);
  const map = useMap();

  if (map && mapState?.accuracyToggle && mapState?.positionTracking && mapState?.userCoords?.long) {
    return (
      <Circle
        key={'circlekeyforaccuracymarker' + Math.random()}
        opacity={0.2}
        color={'#00FF00'}
        fillColor={'#00FF00'}
        fillOpacity={0.2}
        center={[mapState.userCoords.lat, mapState.userCoords.long]}
        radius={mapState.userCoords.accuracy}
      />
    );
  } else {
    return <></>;
  }
};
