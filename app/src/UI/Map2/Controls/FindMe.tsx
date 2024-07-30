import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconButton, Tooltip } from '@mui/material';
import { MAP_TOGGLE_TRACKING, MAP_TOGGLE_TRACK_ME_DRAW_GEO_START, MAP_TOGGLE_TRACK_ME_DRAW_GEO_STOP } from 'state/actions';
import 'UI/Global.css';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import PolylineIcon from '@mui/icons-material/Polyline';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';

export const FindMeToggle = (props) => {
  const positionTracking = useSelector((state: any) => state.Map?.positionTracking);
  const dispatch = useDispatch();
  /**
   * TrackMeButton
   * @description Component to handle the functionality of the find me button
   * @returns {void}
   */
  const [show, setShow] = React.useState(false);
  const divRef = useRef();
  // this is to stop user from clicking it again while things are happening
  return (
    <div ref={divRef} className={positionTracking ? 'map-btn-selected' : 'map-btn'}>
      <Tooltip
        open={show}
        classes={{ tooltip: 'toolTip' }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        title="Find Me"
        placement="top-end"
      >
        <span>
          <IconButton
            className={'button'}
            onClick={() => {
              setShow(false);
              dispatch({ type: MAP_TOGGLE_TRACKING });
            }}
          >
            <MyLocationIcon />
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
};
/**
 * TrackMeButton
 * @description Component to handle the functionality of the find me button
 * @returns {void}
 */
export const TrackMeToggle = (props) => {
  const positionTracking = useSelector((state: any) => state.Map?.positionTracking);
  const drawGeometryTracking = useSelector((state: any) => state.Map?.track_me_draw_geo);
  const dispatch = useDispatch();
  const [show, setShow] = React.useState(false);
  const divRef = useRef();

  const clickHandler = () => {
    const startTrackingConfirmation = 'Are you sure you want to track your path? On the Activity Page this will edit your geometry for the record, and create a polygon once complete.'
    setShow(false);
    if (drawGeometryTracking) {
      dispatch({ type: MAP_TOGGLE_TRACK_ME_DRAW_GEO_STOP });
    } else if (!drawGeometryTracking && confirm(startTrackingConfirmation)) {
      dispatch({ type: MAP_TOGGLE_TRACK_ME_DRAW_GEO_START });
    } else {
      return;
    }
  }
  // this is to stop user from clicking it again while things are happening
  return (
    <>
      {positionTracking ? (
        <div
          ref={divRef}
          className={drawGeometryTracking ? 'map-btn-selected' : 'map-btn'}>
          <Tooltip
            open={show}
            classes={{ tooltip: 'toolTip' }}
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
            title="Track My Path"
            placement="top-end">
            <span>
              <IconButton
                className="button"
                onClick={clickHandler}>
                <PolylineIcon /> <DirectionsWalkIcon />
              </IconButton>
            </span>
          </Tooltip>
        </div>
      ) : (
        <> </>
      )}
    </>
  );
};
/**
 * LocationMarker
 * @description Component to handle the moving blue dot on the map
 * @returns {void}
 */
export const LocationMarker = (props) => {
  const userCoords = useSelector((state: any) => state.Map?.userCoords);
  const positionTracking = useSelector((state: any) => state.Map?.positionTracking);
  const [UTM, setUTM] = useState([]);

  /*
  useEffect(() => {
    if (!userCoords?.lat) {
      return;
    }
    const aUTM: any = calc_utm(userCoords.long, userCoords.lat);
    setUTM([...aUTM]);

    return () => {
      setUTM([]);
    };
  }, [userCoords]);

  if (!userCoords?.lat) {
    return <></>;
  }

  const couldNotCalcString = 'UTM calculation failed.';
  if (positionTracking) {
    return (
      <Marker
        position={[userCoords.lat, userCoords.long]}
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
            {userCoords.lat}
          </p>
          <p>
            <b>Longitude: </b>
            {userCoords.long}
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
            <b>Accuracy</b>: {Math.round(userCoords.accuracy * 10) / 10}
          </p>
        </Popup>
      </Marker>
    );
  } else {
    return <></>;
  }
  */
  return <> </>;
};
