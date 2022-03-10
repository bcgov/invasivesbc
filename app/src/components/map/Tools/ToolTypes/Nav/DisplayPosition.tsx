import { Geolocation } from '@capacitor/geolocation';
import { CircularProgress, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import L from 'leaflet';
import proj4 from 'proj4';
import React, { useEffect, useRef, useState } from 'react';
import { createDataUTM } from '../../Helpers/StyledTable';
import { toolStyles } from '../../Helpers/ToolStyles';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import { ListItemButton } from '@mui/material';

const timer = ({ initialTime, setInitialTime }, { startTimer, setStartTimer }) => {
  if (initialTime > 0) {
    setTimeout(() => {
      setInitialTime(initialTime - 1);
    }, 1000);
  }
  if (initialTime === 0 && startTimer) {
    setStartTimer(false);
  }
};

export const calc_lat_long_from_utm = (zone: number, easting: number, northing: number) => {
  proj4.defs([
    ['EPSG:4326', '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'],
    ['EPSG:AUTO', `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs`]
  ]);
  const en_m = proj4('EPSG:AUTO', 'EPSG:4326', [easting, northing, zone]); // conversion from (long/lat) to UTM (E/N)
  return en_m;
};

export const calc_utm = (longitude: number, latitude: number) => {
  let utmZone = ((Math.floor((longitude + 180) / 6) % 60) + 1).toString(); //getting utm zone
  proj4.defs([
    ['EPSG:4326', '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'],
    ['EPSG:AUTO', `+proj=utm +zone=${utmZone} +datum=WGS84 +units=m +no_defs`]
  ]);
  const en_m = proj4('EPSG:4326', 'EPSG:AUTO', [longitude, latitude]); // conversion from (long/lat) to UTM (E/N)
  let utmEasting = Number(en_m[0].toFixed(0));
  let utmNorthing = Number(en_m[1].toFixed(0));
  return [utmZone, utmEasting, utmNorthing];
};

export default function DisplayPosition({ map }) {
  const toolClass = toolStyles();
  const [newPosition, setNewPosition] = useState(null);
  const [initialTime, setInitialTime] = useState(0);
  // const [recordGeo, setRecordGeo] = useState(null); // NOSONAR
  const [startTimer, setStartTimer] = useState(false);
  // const [utm, setUTM] = useState([]); // NOSONAR
  // const [key] = useState(Math.random()); // NOSONAR
  const divRef = useRef(null);

  useEffect(() => {
    if (map) {
      getLocation();
    }
  }, [map]);

  useEffect(() => {
    L.DomEvent.disableClickPropagation(divRef?.current);
    L.DomEvent.disableScrollPropagation(divRef?.current);
  });

  useEffect(() => {
    timer({ initialTime, setInitialTime }, { startTimer, setStartTimer });
  }, [initialTime, startTimer]);

  // Removed for now:
  // useEffect(() => {
  //   if (newPosition) {
  //     const result = calc_utm(newPosition.coords.longitude, newPosition.coords.latitude);
  //     setUTM([
  //       createDataUTM('Zone', result[0]),
  //       createDataUTM('Easting', result[1]),
  //       createDataUTM('Northing', result[2])
  //     ]);
  //   }
  // }, [newPosition]);

  const getLocation = async () => {
    setInitialTime(3);
    setStartTimer(true);
    const position = await Geolocation.getCurrentPosition();
    setNewPosition(position);
  };

  return (
    <ListItem disableGutters className={toolClass.listItem}>
      <ListItemButton
        ref={divRef}
        disabled={startTimer}
        aria-label="my position"
        onClick={() => {
          try {
            map.setView([newPosition.coords.latitude, newPosition.coords.longitude], 16);
          } catch (e) {
            console.log('Map SetView error', e);
          }
        }}>
        <ListItemIcon>{initialTime > 0 ? <CircularProgress size={24} /> : <GpsFixedIcon />}</ListItemIcon>
        <ListItemText>
          <Typography className={toolClass.Font}>Where am I?</Typography>{' '}
        </ListItemText>
      </ListItemButton>
    </ListItem>
  );
}
