import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as L from 'leaflet';
import { Marker, Popup, useMap } from 'react-leaflet';
import { Divider, IconButton, Tooltip } from '@mui/material';
//import { toolStyles } from 'UI/Styles/ToolStyles';
import { useSelector } from 'react-redux';
import { calc_utm } from 'util/utm';
import { IAPP_PAN_AND_ZOOM, MAP_TOGGLE_PANNED, MAP_TOGGLE_TRACKING, PAN_AND_ZOOM_TO_ACTIVITY } from 'state/actions';
import 'UI/Global.css';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { handle_IAPP_PAN_AND_ZOOM } from 'state/sagas/iappsite/dataAccess';

const baseUrl = window.location.href.split('/home')[0];

export const CenterCurrentRecord = (props) => {
  const panned = useSelector((state: any) => state.Map?.panned);
  const positionTracking = useSelector((state: any) => state.Map?.positionTracking);
  const dispatch = useDispatch();
  /**
   * TrackMeButton
   * @description Component to handle the functionality of the find me button
   * @returns {void}
   */
  const map = useMap();
 // const toolClass = toolStyles();
  const [show, setShow] = React.useState(false);
  const divRef = useRef();
  useEffect(() => {
    L.DomEvent.disableClickPropagation(divRef?.current);
    L.DomEvent.disableScrollPropagation(divRef?.current);
  }, []);
  if (map) {
    // this is to stop user from clicking it again while things are happening
    return (
      <div ref={divRef} className="map-btn">
        <Tooltip
          open={show}
          classes={{ tooltip: 'toolTip' }}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          title={props.type === 'Activity'? "Center Current Activity" : "Center Current IAPP"}
          placement="top-end">
          <span>
              <IconButton
                onClick={() => {
                  setShow(false);
              //    dispatch({ type: MAP_TOGGLE_TRACKING });
                    {props.type=== 'Activity'? dispatch({type: PAN_AND_ZOOM_TO_ACTIVITY}) : dispatch({type: IAPP_PAN_AND_ZOOM})}
                }}
                className={
                  'leaflet-control-zoom leaflet-bar leaflet-control ' +
                  ' ' //+
            //      toolClass.notSelected
                }
                sx={{ color: '#000' }}>
                {props.type === 'Activity'? <AssignmentIcon /> :  <img alt="iapp logo" src={'/assets/iapp_logo.gif'} style={{ maxWidth: '1rem', marginBottom: '0px' }} />}
              </IconButton>
          </span>
        </Tooltip>
      </div>
    );
  } else {
    return <></>;
  }
};

