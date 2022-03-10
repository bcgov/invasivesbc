//Material UI
import {
  BottomNavigation,
  BottomNavigationAction,
  Button,
  Grid,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Slider,
  Switch,
  TableContainer,
  Typography
} from '@mui/material';
import AdjustIcon from '@mui/icons-material/Adjust';
import FolderIcon from '@mui/icons-material/Folder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
// Removed Temporarily until we figure out databc Table:
// import StorageIcon from '@mui/icons-material/Storage';
import { Stack } from '@mui/material';
import * as turf from '@turf/helpers';
import buffer from '@turf/buffer';
import { ThemeContext } from 'utils/CustomThemeProvider';
import L, { DomEvent } from 'leaflet';
import React, { useContext, useEffect, useRef, useState } from 'react';
// Leaflet and React-Leaflet
import { GeoJSON, Marker, Popup, Tooltip, useMapEvent } from 'react-leaflet';
import binoculars from '../../../Icons/binoculars.png';
import {
  createDataUTM,
  RenderTableActivity,
  // Removed Temporarily until we figure out databc Table:
  // RenderTableDataBC,
  RenderTablePOI,
  RenderTablePosition
} from '../../Helpers/StyledTable';
import {
  assignPointModeTheme,
  assignPtDefaultTheme,
  assignTextDefaultTheme,
  toolStyles
} from '../../Helpers/ToolStyles';
// App Imports
import { calc_utm } from '../Nav/DisplayPosition';
import { polygon } from '@turf/helpers';

export const generateGeo = (lat, lng, { setGeoPoint }) => {
  if (lat && lng) {
    var point = turf.point([lng, lat]);
    var buffer2 = buffer(point, 50, { units: 'meters' });
    setGeoPoint(buffer2);
  }
};

export const GeneratePopup = (props) => {
  const { utmRows, map, lat, lng, setRecordGeo, setClickMode } = props;
  const themeContext = useContext(ThemeContext);
  const { themeType } = themeContext;
  const theme = themeType ? 'leaflet-popup-content-wrapper-dark' : 'leaflet-popup-content-wrapper-light';
  const [bufferedGeo, setBufferedGeo] = useState(null);
  const [section, setSection] = useState('position');
  const [pointMode, setPointMode] = useState(true);
  const [showRadius, setShowRadius] = useState(false);
  // (NOSONAR)'d Temporarily until we figure out databc Table:
  // const [databc, setDataBC] = useState(null); // NOSONAR
  const [radius, setRadius] = useState(3);
  const popupElRef = useRef(null);

  useEffect(() => {
    if (popupElRef?.current) {
      DomEvent.disableClickPropagation(popupElRef?.current);
      DomEvent.disableScrollPropagation(popupElRef?.current);
    }
  }, []);

  useEffect(() => {
    if (lat && lng) {
      var point = turf.point([lng, lat]);
      if (pointMode) {
        setBufferedGeo(point);
      } else {
        setBufferedGeo(buffer(point, radius, { units: 'kilometers' }));
      }
    }
  }, [radius, pointMode]);
  // Removed for now:
  // useEffect(() => {
  //   if (bufferedGeo) {
  //     getDataFromDataBC(
  //       'WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW',
  //       bufferedGeo,
  //       invasivesApi.getSimplifiedGeoJSON
  //     ).then((returnVal) => {
  //       setDataBC(returnVal);
  //     }, []);
  //   }
  // }, [bufferedGeo]);

  const hideElement = () => {
    if (!popupElRef?.current || !map) return;
    map.closePopup();
    setRecordGeo(null);
    if (setClickMode) {
      setClickMode(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<{}>, newSection: string) => {
    setSection(newSection);
  };

  function valueText(value: number) {
    return `${value}km`;
  }

  return (
    <>
      <Popup className={theme} ref={popupElRef} autoClose={false} closeOnClick={false} closeButton={false}>
        <div>
          <TableContainer>
            {section == 'position' && <RenderTablePosition rows={utmRows} />}
            {section == 'activity' && (
              <RenderTableActivity setActivityGeo={setRecordGeo} map={map} bufferedGeo={bufferedGeo} />
            )}
            {/*section == 'databc' && <RenderTableDataBC rows={databc} />*/}
            {section == 'poi' && <RenderTablePOI map={map} setPoiMarker={setRecordGeo} bufferedGeo={bufferedGeo} />}
          </TableContainer>
          <Grid container>
            <BottomNavigation
              style={{ backgroundColor: themeType ? '#333' : null, width: 500 }}
              value={section}
              onChange={handleChange}>
              <BottomNavigationAction value="position" label="Position" icon={<LocationOnIcon />} />
              <BottomNavigationAction value="activity" label="Activity" icon={<FolderIcon />} />
              {/*<BottomNavigationAction value="databc" label="Data BC" icon={<StorageIcon />} />*/}
              <BottomNavigationAction value="poi" label="POI" icon={<AdjustIcon />} />
            </BottomNavigation>
          </Grid>
          <Grid container>
            <Stack direction="row" spacing={1} style={{ width: 500 }} alignItems="center">
              <Typography
                className={assignPointModeTheme(!pointMode, themeType)}
                style={assignPtDefaultTheme(pointMode, themeType)}>
                Within Radius
              </Typography>
              <Switch
                checked={pointMode}
                onChange={(event: any) => setPointMode(event.target.checked)}
                color="primary"
              />
              <Typography
                className={assignPointModeTheme(pointMode, themeType)}
                style={assignPtDefaultTheme(!pointMode, themeType)}>
                Just This Point
              </Typography>
            </Stack>
            {!pointMode && (
              <Grid container>
                <Grid item style={{ display: 'flex', flexFlow: 'nowrap', marginTop: -30 }}>
                  <Typography style={assignTextDefaultTheme(themeType)}>{radius} km</Typography>
                  <Slider
                    style={{ width: 225, alignSelf: 'center', marginLeft: 10 }}
                    aria-label="Kilometers"
                    defaultValue={radius}
                    onChange={(event: any, newRadius: number) => {
                      setRadius(newRadius);
                    }}
                    getAriaValueText={valueText}
                    step={1}
                    marks
                    min={1}
                    max={10}
                  />
                </Grid>
                <Grid item style={{ marginTop: -30 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography style={assignTextDefaultTheme(themeType)}>Show Area</Typography>
                    <Switch onChange={(event: any) => setShowRadius(event.target.checked)} color="primary" />
                  </Stack>
                </Grid>
              </Grid>
            )}
            <Grid item>
              <Button onClick={hideElement}>Close</Button>
            </Grid>
          </Grid>
        </div>
      </Popup>
      {
        bufferedGeo && showRadius && <GeoJSON data={bufferedGeo} key={Math.random()} /> //NOSONAR
      }
    </>
  );
};

function SetPointOnClick({ map }: any) {
  const themeContext = useContext(ThemeContext);
  const [positionOne, setPositionOne] = useState(null);
  const [drawnGeo, setDrawnGeo] = useState(null);
  const [clickMode, setClickMode] = useState(false);
  const [recordGeo, setRecordGeo] = useState(null);
  const [utm, setUTM] = useState(null);
  const divRef = useRef();
  const toolClass = toolStyles();

  useEffect(() => {
    L.DomEvent.disableClickPropagation(divRef?.current);
    L.DomEvent.disableScrollPropagation(divRef?.current);
  });

  // useEffect(() => {
  //   if (isFinite(position?.lng) && isFinite(position?.lat) && clickMode) {
  //     const result = calc_utm(position?.lng as number, position?.lat as number);
  //     setUTM([
  //       createDataUTM('UTM', result[0]),
  //       createDataUTM('Easting', result[1]),
  //       createDataUTM('Northing', result[2])
  //     ]);
  //     generateGeo(position.lat, position.lng, { setGeoPoint });
  //   }
  // }, [position]);

  useMapEvent('click', (e) => {
    if (clickMode) {
      console.log('mousedown ding');
      if (positionOne === null) {
        setPositionOne(e.latlng);
      } else {
        setClickMode(false);
        setPositionOne(null);
      }
    } else {
      const temp = e.latlng;
      const val = 0.003;
      const latlng1 = [temp.lng + val, temp.lat - val / 2];
      const latlng3 = [temp.lng - val, temp.lat + val / 2];
      const latlng2 = [temp.lng + val, temp.lat + val / 2];
      const latlng4 = [temp.lng - val, temp.lat - val / 2];
      setDrawnGeo(polygon([[latlng1, latlng2, latlng3, latlng4, latlng1]]));
    }
  });

  //get mouse location on map
  useMapEvent('mousemove', (e) => {
    if (positionOne) {
      const temp = e.latlng;
      const latlng1 = [positionOne.lng, positionOne.lat];
      const latlng3 = [temp.lng, temp.lat];
      const latDiff = positionOne.lat - temp.lat;
      const lngDiff = positionOne.lng - temp.lng;
      const latlng2 = [positionOne.lng, positionOne.lat - latDiff];
      const latlng4 = [positionOne.lng - lngDiff, positionOne.lat];
      setDrawnGeo(polygon([[latlng1, latlng2, latlng3, latlng4, latlng1]]));
    }
  });

  const markerIcon = L.icon({
    iconUrl: binoculars,
    iconSize: [24, 24]
  });

  return (
    <ListItem disableGutters className={toolClass.listItem}>
      {/*
        activityGeo && <GeoJSON data={activityGeo} key={Math.random()} /> //NOSONAR
      }
      {poiMarker && (
        <Marker
          position={[poiMarker.geometry.geometry.coordinates[1], poiMarker.geometry.geometry.coordinates[0]]}
          //  icon={markerIcon}>
        >
          <Tooltip direction="top" opacity={0.5} permanent>
            <div style={{ display: 'flex', flexFlow: 'row nowrap' }}>
              {poiMarker.species.map((s) => (
                <>{s} </>
              ))}
            </div>
          </Tooltip>
        </Marker>
      )*/}
      {recordGeo && <GeoJSON data={recordGeo} key={Math.random()} />}

      <ListItemButton
        ref={divRef}
        onClick={() => {
          if (!clickMode) {
            setDrawnGeo(null);
          }
          setClickMode(!clickMode);
        }}
        style={{
          backgroundColor: clickMode ? '#006ee6' : null,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
          marginTop: 5
        }}>
        <ListItemIcon>
          <img
            style={{ width: 32, height: 32 }}
            color={themeContext.themeType ? '#000' : 'white'}
            src={binoculars}
            aria-label="create-pin"
          />
        </ListItemIcon>
        <ListItemText>
          <Typography className={toolClass.Font}>What's here?</Typography>
        </ListItemText>
      </ListItemButton>
      {drawnGeo && (
        <GeoJSON
          style={() =>
            !clickMode && {
              opacity: 0,
              fillOpacity: 0
            }
          }
          data={drawnGeo}
          key={Math.random()}>
          {/* <GeneratePopup
            utmRows={utm}
            map={map}
            lat={position.lat}
            lng={position.lng}
            setRecordGeo={setRecordGeo}
            setClickMode={setClickMode}
          /> */}
        </GeoJSON>
      )}
    </ListItem>
  );
}

// Circle Icon: <div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
// Binoculars: <div>Icons made by <a href="" title="Victoruler">Victoruler</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
export { SetPointOnClick };
