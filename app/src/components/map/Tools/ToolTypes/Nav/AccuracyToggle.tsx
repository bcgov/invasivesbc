import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import AttributionIcon from '@mui/icons-material/Attribution';
import { IconButton, Tooltip } from '@mui/material';
import 'leaflet-editable';
import 'leaflet.offline';
import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { MAP_TOGGLE_ACCURACY } from 'state/actions';
import { selectMap } from 'state/reducers/map';
import { useSelector } from 'state/utilities/use_selector';
import { toolStyles } from '../../Helpers/ToolStyles';

export const AccuracyToggle = (props) => {
    const mapState = useSelector(selectMap);
    const dispatch = useDispatch();

    const toolClass = toolStyles(); // Get the classes from the context

    const divRef = useRef();
    useEffect(() => {
      L.DomEvent.disableClickPropagation(divRef?.current);
      L.DomEvent.disableScrollPropagation(divRef?.current);
    }, []);
    if (!mapState) {
      return <></>;
    }
    return (
      <div
        ref={divRef}
        className="leaflet-bottom leaflet-right"
        style={{
          bottom: '130px',
          width: '50px',
          height: '40px'
        }}>
        <Tooltip 
          PopperProps={{ keepMounted: true }} 
          title={mapState?.accuracyToggle ? 'Hide Accuracy' : 'Show Accuracy'} 
          placement="left-start">
          <span>
            <IconButton
              onClick={() => {
                dispatch({type: MAP_TOGGLE_ACCURACY });
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