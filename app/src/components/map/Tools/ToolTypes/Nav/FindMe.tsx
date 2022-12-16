import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
// Offline dependencies
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { Divider, IconButton, Tooltip } from '@mui/material';
import 'leaflet-editable';
import 'leaflet.offline';
import React, { useEffect, useRef, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { MAP_TOGGLE_TRACKING } from 'state/actions';
import { selectMap } from 'state/reducers/map';
import { useSelector } from 'state/utilities/use_selector';
import { toolStyles } from '../../Helpers/ToolStyles';
import { calc_utm } from './DisplayPosition';

const baseUrl = window.location.href.split('/home')[0]; // Base URL of application for hosted image

export const FindMeToggle = (props) => {
  const dispatch = useDispatch();
  /**
   * TrackMeButton
   * @description Component to handle the functionality of the find me button
   * @returns {void}
   */
  const mapState = useSelector(selectMap);
  const toolClass = toolStyles();
  const [show, setShow] = React.useState(false);
  const divRef = useRef();
  useEffect(() => {
    L.DomEvent.disableClickPropagation(divRef?.current);
    L.DomEvent.disableScrollPropagation(divRef?.current);
  }, []);
  return (
    <div
      ref={divRef}
      className="leaflet-bottom leaflet-right"
      style={{
        bottom: '30px',
        width: '40px',
        height: '40px'
      }}>
      <Tooltip
        open={show}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        title="Find Me"
        placement="left-start">
        <span>
          <IconButton
            onClick={() => {
              try {
                dispatch({ type: MAP_TOGGLE_TRACKING });
                setShow(false);
                //zoomToLocation();
              } catch (e) {
                console.log('Map SetView error', e);
              }
            }}
            className={
              'leaflet-control-zoom leaflet-bar leaflet-control ' +
              ' ' +
              (mapState.positionTracking ? toolClass.selected : toolClass.notSelected)
            }
            sx={{ color: '#000' }}>
            <MyLocationIcon />
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
};

//map.setView(pos, map.getZoom());

//drawCircle(foundPosition, pos.coords.accuracy);

/**
 * LocationMarker
 * @description Component to handle the moving blue dot on the map
 * @returns {void}
 */
export const LocationMarker = (props) => {
  const mapState = useSelector(selectMap);
  const [UTM, setUTM] = useState([]);

  useEffect(() => {
    if (!mapState?.userCoords?.lat) {
      return;
    }
    const aUTM: any = calc_utm(mapState.userCoords.long, mapState.userCoords.lat);
    setUTM([...aUTM]);

    return () => {
      setUTM([]);
    };
  }, [mapState.userCoords]);

  if (!mapState?.userCoords?.lat) {
    return <></>;
  }

  const couldNotCalcString = 'UTM calculation failed.';
  if (mapState?.positionTracking) {
    return (
      <Marker
        position={[mapState.userCoords.long, mapState.userCoords.lat]}
        key={'locationmarkerforbluedot'}
        icon={L.icon({
          iconUrl: baseUrl + '/assets/icon/circle.png',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
          popupAnchor: [0, -20]
        })}>
        <Popup closeButton={false}>
          <h2>You are here:</h2>
          <p>
            <b>Latitude: </b>
            {mapState.userCoords.lat}
          </p>
          <p>
            <b>Longitude: </b>
            {mapState.userCoords.long}
          </p>
          <Divider />
          <p>
            <b>UTM Zone: </b>
            {UTM[0] ? UTM[0] : couldNotCalcString}
          </p>
          <p>
            <b>UTM Easting: </b>
            {UTM[1] ? UTM[1] : couldNotCalcString}
          </p>
          <p>
            <b>UTM Northing: </b>
            {UTM[2] ? UTM[2] : couldNotCalcString}
          </p>
          <p>
            <b>Accuracy</b>: {Math.round(mapState.userCoords.accuracy * 10) / 10}
          </p>
        </Popup>
      </Marker>
    );
  } else {
    return <></>;
  }
};
