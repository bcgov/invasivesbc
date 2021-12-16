import { Geolocation } from '@capacitor/geolocation';
import { CircularProgress, IconButton, Typography } from '@material-ui/core';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import { ThemeContext } from 'contexts/themeContext';
import L from 'leaflet';
import proj4 from 'proj4';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { GeoJSON, Marker, Tooltip } from 'react-leaflet';
import { createDataUTM } from '../../Helpers/StyledTable';
import { toolStyles } from '../../Helpers/ToolStyles';
import { generateGeo, GeneratePopup } from '../Data/InfoAreaDescription';
import marker from '../../../Icons/POImarker.png';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';

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
  const themeContext = useContext(ThemeContext);
  const [newPosition, setNewPosition] = useState(null);
  const [initialTime, setInitialTime] = useState(0);
  const [activityGeo, setActivityGeo] = useState(null);
  const [poiMarker, setPoiMarker] = useState(null);
  const [startTimer, setStartTimer] = useState(false);
  const [geoPoint, setGeoPoint] = useState(null);
  const [utm, setUTM] = useState([]);
  const [rows, setRows] = useState(null);
  const [key] = useState(Math.random()); // NOSONAR
  const divRef = useRef(null);

  useEffect(() => {
    if (map) {
      getLocation();
    }
  }, map);

  useEffect(() => {
    if (newPosition) {
      generateGeo(newPosition.coords.latitude, newPosition.coords.longitude, { setGeoPoint });
    }
  }, [newPosition]);

  useEffect(() => {
    L.DomEvent.disableClickPropagation(divRef?.current);
    L.DomEvent.disableScrollPropagation(divRef?.current);
  });

  useEffect(() => {
    if (utm) {
      setRows([createDataUTM('UTM', utm[0]), createDataUTM('Northing', utm[2]), createDataUTM('Easting', utm[1])]);
    }
  }, [utm]);

  useEffect(() => {
    timer({ initialTime, setInitialTime }, { startTimer, setStartTimer });
  }, [initialTime, startTimer]);

  useEffect(() => {
    if (newPosition) {
      setUTM(calc_utm(newPosition.coords.longitude, newPosition.coords.latitude));
    }
  }, [newPosition]);

  const markerIcon = L.icon({
    iconUrl: marker,
    iconSize: [24, 24]
  });

  const getLocation = async () => {
    setInitialTime(3);
    setStartTimer(true);
    const position = await Geolocation.getCurrentPosition();
    setNewPosition(position);
  };

  return (
    <>
      {
        activityGeo && <GeoJSON data={activityGeo} key={Math.random()} /> //NOSONAR
      }
      {poiMarker && (
        <Marker
          position={[poiMarker.geometry.geometry.coordinates[1], poiMarker.geometry.geometry.coordinates[0]]}
          icon={markerIcon}>
          <Tooltip direction="top" opacity={0.5} permanent>
            <div style={{ display: 'flex', flexFlow: 'row nowrap' }}>
              {poiMarker.species.map((s) => (
                <>{s} </>
              ))}
            </div>
          </Tooltip>
        </Marker>
      )}
      {geoPoint && (
        <GeoJSON data={geoPoint} key={key}>
          <GeneratePopup
            utmRows={rows}
            map={map}
            lat={newPosition.coords.latitude}
            lng={newPosition.coords.longitude}
            setPoiMarker={setPoiMarker}
            setActivityGeo={setActivityGeo}
          />
        </GeoJSON>
      )}
      <IconButton
        ref={divRef}
        className={themeContext.themeType ? toolClass.toolBtnDark : toolClass.toolBtnLight}
        disabled={startTimer}
        aria-label="my position"
        onClick={() => {
          if (newPosition) {
            map.flyTo([newPosition.coords.latitude, newPosition.coords.longitude], 17);
          }
        }}>
        {initialTime > 0 ? <CircularProgress size={24} /> : <GpsFixedIcon />}
        <Typography className={toolClass.Font}>Where am I?</Typography>{' '}
      </IconButton>
    </>
  );
}
