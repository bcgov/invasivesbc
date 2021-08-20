import React, { useState, useEffect, useRef, useContext } from 'react';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import { Geolocation } from '@capacitor/geolocation';
import { CircularProgress, IconButton, makeStyles } from '@material-ui/core';
import proj4 from 'proj4';
import L from 'leaflet';
import { ThemeContext } from 'contexts/themeContext';

export const utm_zone = (longitude: any, latitude: any) => {
  let utmZone = ((Math.floor((longitude + 180) / 6) % 60) + 1).toString(); //getting utm zone
  proj4.defs([
    ['EPSG:4326', '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'],
    ['EPSG:AUTO', `+proj=utm +zone=${utmZone} +datum=WGS84 +units=m +no_defs`]
  ]);
  const en_m = proj4('EPSG:4326', 'EPSG:AUTO', [longitude, latitude]); // conversion from (long/lat) to UTM (E/N)
  let utmEasting = Number(en_m[0].toFixed(4));
  let utmNorthing = Number(en_m[1].toFixed(4));
  return 'UTM  Zone:' + utmZone + ' UTM Easting:' + utmEasting + ' UTM Northing:' + utmNorthing;
};

const useStyles = makeStyles((theme) => ({
  iconButton: {
    width: 48,
    height: 48,
    margin: '5px',
    zIndex: 1500,
    background: 'white',
    borderRadius: '15%',
    '&:hover': {
      background: 'white'
    }
  },
  iconButtonDark: {
    width: 48,
    height: 48,
    margin: '5px',
    zIndex: 1500,
    background: '#424242',
    borderRadius: '15%',
    '&:hover': {
      background: '#424242'
    }
  }
}));

export default function DisplayPosition({ map }) {
  const classes = useStyles();
  const themeContext = useContext(ThemeContext);
  //updated for capacitor 3
  const watchPosition = Geolocation.watchPosition;
  const startWatch = watchPosition;
  const clearWatch = Geolocation.clearWatch;
  const getPosition = Geolocation.getCurrentPosition;
  const divRef = useRef();

  useEffect(() => {
    L.DomEvent.disableClickPropagation(divRef?.current);
    L.DomEvent.disableScrollPropagation(divRef?.current);
  });

  useEffect(() => {
    try {
      //shouldnt assume the user doenst want to look at something somewhere else
      //getPosition();
    } catch (e) {
      console.log('unable to get position');
    }
  }, []);

  const startThing = async () => {
    try {
      // startWatch({ enableHighAccuracy: true });
    } catch (e) {
      console.log('error starting track');
    }
  };

  const [isWatchingPosition, setIsWatchingPosition] = useState(false);
  const [lastFlyToTimeStamp, setLastFlyToTimestamp] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [newPosition, setNewPosition] = useState(null);

  const [initialTime, setInitialTime] = useState(0);
  const [startTimer, setStartTimer] = useState(false);

  useEffect(() => {
    if (initialTime > 0) {
      setTimeout(() => {
        setInitialTime(initialTime - 1);
      }, 1000);
    }
    if (initialTime === 0 && startTimer) {
      setStartTimer(false);
    }
  }, [initialTime, startTimer]);

  const getLocation = async () => {
    setInitialTime(5);
    setStartTimer(true);
    const position = await Geolocation.getCurrentPosition();
    //const coords = position.coords;
    setNewPosition(position);
  };

  useEffect(() => {
    if (newPosition) {
      map.flyTo([newPosition.coords.latitude, newPosition.coords.longitude], 17);
    }
  }, [newPosition]);

  return (
    <div>
      {newPosition && newPosition?.coords && newPosition?.coords?.latitude ? (
        <Marker position={[newPosition.coords.latitude, newPosition.coords.longitude]}>
          <Popup>
            {/*position.lat.toFixed(4)}&ensp;{position.lng.toFixed(4)*/}
            <br />
            {utm_zone(newPosition.coords.longitude, newPosition.coords.latitude)}
          </Popup>
        </Marker>
      ) : null}
      <IconButton
        ref={divRef}
        className={themeContext.themeType ? classes.iconButtonDark : classes.iconButton}
        disabled={startTimer}
        aria-label="my position"
        onClick={getLocation}>
        {initialTime > 0 ? <CircularProgress size={24} /> : <LocationOnIcon />}
      </IconButton>
    </div>
  );
}
