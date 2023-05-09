import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
// Offline dependencies
import RefreshIcon from '@mui/icons-material/Refresh';
import { IconButton, Tooltip } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { selectMap } from 'state/reducers/map';
import { useSelector } from 'state/utilities/use_selector';
import { toolStyles } from '../../Helpers/ToolStyles';
import { IAPP_EXTENT_FILTER_REQUEST } from 'state/actions';

export const IAPPExtentButton = (props) => {
  const map = useMap();

  const mapState = useSelector(selectMap);
  const dispatch = useDispatch();
  const toolClass = toolStyles();
  const [show, setShow] = React.useState(false);

  const divRef = useRef();
  useEffect(() => {
    try {
      L.DomEvent.disableClickPropagation(divRef?.current);
      L.DomEvent.disableScrollPropagation(divRef?.current);
    } catch (e) {}
  }, []);

  if (mapState && map) {
    return (
      <div
        ref={divRef}
        className="leaflet-bottom leaflet-right"
        style={{
          bottom: '380px',
          width: '50px',
          height: '50px'
        }}>
        <Tooltip
          open={show}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          title="Refresh IAPP points"
          placement="left-start">
          <span>
            <IconButton
              onClick={() => {
                const bounds = map.getBounds();
                dispatch({
                  type: IAPP_EXTENT_FILTER_REQUEST,
                  payload: {
                    minX: bounds.getWest(),
                    minY: bounds.getNorth(),
                    maxX: bounds.getEast(),
                    maxY: bounds.getSouth()
                  }
                });
              }}
              className={
                'leaflet-control-zoom leaflet-bar leaflet-control ' +
                ' ' + toolClass.notSelected
              }
              sx={{ color: '#000' }}>
              <RefreshIcon fontSize='small'/>
              <img src={'/assets/iapp_logo.gif'} style={{ maxWidth: '1rem', margin: '0 0.15rem' }} />
            </IconButton>
          </span>
        </Tooltip>
      </div>
    );
  } else {
    return <></>;
  }
};
