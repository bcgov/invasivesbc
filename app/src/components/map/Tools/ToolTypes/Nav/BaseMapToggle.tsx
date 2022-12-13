import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
// Offline dependencies
import LayersIcon from '@mui/icons-material/Layers';
import LayersClearIcon from '@mui/icons-material/LayersClear';
import { IconButton, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Feature } from 'geojson';
import 'leaflet-editable';
import 'leaflet.offline';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { MAP_TOGGLE_BASEMAP } from 'state/actions';
import { selectMap } from 'state/reducers/map';
import { useSelector } from 'state/utilities/use_selector';

const useStyles = makeStyles((theme) => ({
  /*customHoverFocus: {
    backgroundColor: 'white',
    '&:hover, &.Mui-focusVisible': { backgroundColor: 'skyblue' }
  },*/
  selected: {
    backgroundColor: '#2196f3',
    color: 'white'
  },
  notSelected: {
    backgroundColor: 'white',
    color: 'black'
  }
}));

export interface IMapLocationControlGroupProps {
  classes?: any;
  mapId: string;
  showDrawControls: boolean;
  geometryState: { geometry: any[]; setGeometry: (geometry: Feature[]) => void };
  setMapMaxNativeZoom?: React.Dispatch<React.SetStateAction<number>>;
}

export const BaseMapToggle = (props) => {
  //refactor stuff for topo button
  const mapState = useSelector(selectMap);
  const dispatch = useDispatch();

  // const map = useMap(); // Get the map from the context
  // const group = ; // Create a group to hold the drawn features
  const classes = useStyles(); // Get the classes from the context

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
        bottom: '180px',
        width: '40px',
        height: '40px'
      }}>
      <Tooltip title={mapState.baseMapToggle ? 'Imagery Map' : 'Topographical Map'} placement="right-start">
        <span>
          <IconButton
            onClick={() => {
              dispatch({ type: MAP_TOGGLE_BASEMAP });
            }}
            className={
              'leaflet-control-zoom leaflet-bar leaflet-control ' +
              //classes.customHoverFocus +
              ' ' +
              (mapState.baseMapToggle ? classes.selected : classes.notSelected)
            }
            sx={{ color: '#000' }}>
            {mapState.baseMapToggle ? <LayersClearIcon /> : <LayersIcon />}
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
};
