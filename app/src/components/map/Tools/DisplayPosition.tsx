import React, { useState, useEffect, useRef, useContext } from 'react';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import { Marker, Popup } from 'react-leaflet';
import { Geolocation } from '@capacitor/geolocation';
import { CircularProgress, IconButton } from '@material-ui/core';
import proj4 from 'proj4';
import L from 'leaflet';
import { ThemeContext } from 'contexts/themeContext';
import { toolStyles } from './ToolBtnStyles';

export const utm_zone = (longitude: number, latitude: number) => {
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

export default function DisplayPosition({ map }) {
  const toolClass = toolStyles();
  const themeContext = useContext(ThemeContext);
  const [newPosition, setNewPosition] = useState(null);
  const [initialTime, setInitialTime] = useState(0);
  const [startTimer, setStartTimer] = useState(false);
  const divRef = useRef();

  useEffect(() => {
    L.DomEvent.disableClickPropagation(divRef?.current);
    L.DomEvent.disableScrollPropagation(divRef?.current);
  });

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

  useEffect(() => {
    if (newPosition) {
      map.flyTo([newPosition.coords.latitude, newPosition.coords.longitude], 17);
    }
  }, [newPosition]);

  const getLocation = async () => {
    setInitialTime(5);
    setStartTimer(true);
    const position = await Geolocation.getCurrentPosition();
    setNewPosition(position);
  };

  return (
    <div>
      {newPosition && newPosition?.coords && newPosition?.coords?.latitude ? (
        <Marker position={[newPosition.coords.latitude, newPosition.coords.longitude]}>
          <Popup>
            {/*position.lat.toFixed(4)}&ensp;{position.lng.toFixed(4)*/}
            {utm_zone(newPosition.coords.longitude, newPosition.coords.latitude)}
          </Popup>
        </Marker>
      ) : null}
      <IconButton
        ref={divRef}
        className={themeContext.themeType ? toolClass.toolBtnDark : toolClass.toolBtnLight}
        disabled={startTimer}
        aria-label="my position"
        onClick={getLocation}>
        {initialTime > 0 ? <CircularProgress size={24} /> : <LocationOnIcon />}
      </IconButton>
    </div>
  );
}
