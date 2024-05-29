import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconButton, Tooltip } from '@mui/material';
import { MAP_TOGGLE_TRACKING } from 'state/actions';
import 'UI/Global.css';
import MyLocationIcon from '@mui/icons-material/MyLocation';

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
