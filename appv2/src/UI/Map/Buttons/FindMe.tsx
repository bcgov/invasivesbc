import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import * as L from "leaflet";
import { Marker, Popup, useMap } from "react-leaflet";
import { Divider, IconButton, Tooltip } from "@mui/material";
import { toolStyles } from "UI/Styles/ToolStyles";
import { useSelector } from "util/use_selector";
import { selectMap } from "state/reducers/map";
import { calc_utm } from "util/utm";
import { MAP_TOGGLE_PANNED, MAP_TOGGLE_TRACKING } from "state/actions";

import MyLocationIcon from '@mui/icons-material/MyLocation';

const baseUrl = window.location.href.split('/home')[0];

export const FindMeToggle = (props) => {
  const dispatch = useDispatch();
  /**
   * TrackMeButton
   * @description Component to handle the functionality of the find me button
   * @returns {void}
   */
  const mapState = useSelector(selectMap);
  const map = useMap();
  const toolClass = toolStyles();
  const [show, setShow] = React.useState(false);
  const divRef = useRef();
  useEffect(() => {
    L.DomEvent.disableClickPropagation(divRef?.current);
    L.DomEvent.disableScrollPropagation(divRef?.current);
  }, []);
  if (mapState?.panned && map) {
    // this is to stop user from clicking it again while things are happening
    return (
      <div
        ref={divRef}
        className="map-btn">
        <Tooltip
          open={show}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          title="Find Me"
          placement="top-end">
          <span>
            {mapState?.panned ? (
              <IconButton
                onClick={() => {
                  setShow(false);
                  dispatch({ type: MAP_TOGGLE_TRACKING });
                }}
                className={
                  'leaflet-control-zoom leaflet-bar leaflet-control ' +
                  ' ' +
                  (mapState.positionTracking ? toolClass.selected : toolClass.notSelected)
                }
                sx={{ color: '#000' }}>
                <MyLocationIcon />
              </IconButton>
            ) : (
              <></>
            )}
          </span>
        </Tooltip>
      </div>
    );
  } else {
    return <></>;
  }
};

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
        position={[mapState.userCoords.lat, mapState.userCoords.long]}
        key={'locationmarkerforbluedot'}
        icon={L.icon({
          iconUrl: '/assets/icon/circle.png',
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

export const PanToMe = (props) => {
  const mapState = useSelector(selectMap);
  const map = useMap();
  const dispatch = useDispatch();

  useEffect(() => {
    if (map && mapState?.userCoords?.lat && mapState?.panned === false && mapState?.positionTracking) {
      map.flyTo([mapState.userCoords.lat, mapState.userCoords.long]);
      dispatch({ type: MAP_TOGGLE_PANNED });
    }
  }, [mapState?.panned, mapState?.positionTracking, mapState?.userCoords]);

  return <></>;
};