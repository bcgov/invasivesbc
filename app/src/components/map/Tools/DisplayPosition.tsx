import React, { useState, useEffect, useRef, useContext } from 'react';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import { Marker, GeoJSON, Tooltip } from 'react-leaflet';
import { Geolocation } from '@capacitor/geolocation';
import { CircularProgress, IconButton } from '@material-ui/core';
import proj4 from 'proj4';
import L from 'leaflet';
import { ThemeContext } from 'contexts/themeContext';
import { toolStyles } from './Helpers/ToolBtnStyles';
import { GeneratePopup } from './InfoAreaDescription';
import { createDataUTM } from './Helpers/StyledTable';
import marker from '../Icons/POImarker.png';

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
  const [utm, setUTM] = useState([]);
  const [rows, setRows] = useState(null);
  const divRef = useRef(null);

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
      map.flyTo([newPosition.coords.latitude, newPosition.coords.longitude], 17);
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
      {newPosition && (
        <Marker position={[newPosition.coords.latitude, newPosition.coords.longitude]}>
          <GeneratePopup
            utmRows={rows}
            map={map}
            lat={newPosition.coords.latitude}
            lng={newPosition.coords.longitude}
            setPoiMarker={setPoiMarker}
            setActivityGeo={setActivityGeo}
          />
        </Marker>
      )}
      <IconButton
        ref={divRef}
        className={themeContext.themeType ? toolClass.toolBtnDark : toolClass.toolBtnLight}
        disabled={startTimer}
        aria-label="my position"
        onClick={getLocation}>
        {initialTime > 0 ? <CircularProgress size={24} /> : <LocationOnIcon />}
      </IconButton>
    </>
  );
}
