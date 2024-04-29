import { IconButton, Tooltip } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { MAP_TOGGLE_GEOJSON_CACHE } from 'state/actions';
import { useSelector } from 'util/use_selector';
import 'UI/Global.css';
import SpeedIcon from '@mui/icons-material/Speed';

export const MapModeToggle = (props) => {
  const mapModeToggle = useSelector((state: any) => state.Map?.MapMode);
  const dispatch = useDispatch();
  const [show, setShow] = React.useState(false);
  const divRef = useRef();


  return (
    <div ref={divRef} className={mapModeToggle !== 'VECTOR_ENDPOINT'  ? 'map-btn-selected' : 'map-btn'}>
      <Tooltip
        open={show}
        classes={{ tooltip: 'toolTip' }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        title={mapModeToggle !== 'VECTOR_ENDPOINT' ? 'Use server to render tiles.  Faster initial page load, slower to update layers.  Slower layer load on zoom and pan.  Better for older machines or devices with less memory.  ' : 'Download shapes & render tiles in browser.  Slower initial page load, but faster to update layers and see shapes when panning and zooming.  Better for newer machines or devices with more memory.'}
        placement="top-end">
        <span>
          <IconButton
            onClick={() => {
              dispatch({ type: MAP_TOGGLE_GEOJSON_CACHE });
            }}>
             <SpeedIcon/> 
            
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
};
