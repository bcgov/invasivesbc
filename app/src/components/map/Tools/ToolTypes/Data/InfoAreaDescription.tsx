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
  TableContainer,
  Typography
} from '@mui/material';
import AdjustIcon from '@mui/icons-material/Adjust';
import FolderIcon from '@mui/icons-material/Folder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
// Removed Temporarily until we figure out databc Table:
// import StorageIcon from '@mui/icons-material/Storage';
import * as turf from '@turf/helpers';
import buffer from '@turf/buffer';
import { ThemeContext } from 'utils/CustomThemeProvider';
import L, { DomEvent } from 'leaflet';
import React, { useContext, useEffect, useRef, useState } from 'react';
// Leaflet and React-Leaflet
import { GeoJSON, Popup, useMapEvent } from 'react-leaflet';
import binoculars from '../../../Icons/binoculars.png';
import {
  createDataUTM,
  RenderTableActivity,
  // Removed Temporarily until we figure out databc Table:
  // RenderTableDataBC,
  RenderTablePOI,
  RenderTablePosition
} from '../../Helpers/StyledTable';
import { toolStyles } from '../../Helpers/ToolStyles';
// App Imports
import { calc_utm } from '../Nav/DisplayPosition';
import { polygon } from '@turf/helpers';
import center from '@turf/center';

export const generateGeo = (lat, lng, { setGeoPoint }) => {
  if (lat && lng) {
    var point = turf.point([lng, lat]);
    var buffer2 = buffer(point, 50, { units: 'meters' });
    setGeoPoint(buffer2);
  }
};

export const GeneratePopup = (props) => {
  const { map, bufferedGeo } = props;
  const themeContext = useContext(ThemeContext);
  const { themeType } = themeContext;
  const theme = themeType ? 'leaflet-popup-content-wrapper-dark' : 'leaflet-popup-content-wrapper-light';
  const [section, setSection] = useState('position');
  // const [showRadius, setShowRadius] = useState(false); // NOSONAR
  // (NOSONAR)'d Temporarily until we figure out databc Table:
  // const [databc, setDataBC] = useState(null); // NOSONAR
  // const [radius, setRadius] = useState(3);
  const popupElRef = useRef(null);

  const position = center(bufferedGeo).geometry.coordinates;
  const utmResult = calc_utm(position[0], position[1]);
  const utmRows = [
    createDataUTM('Zone', utmResult[0]),
    createDataUTM('Easting', utmResult[1]),
    createDataUTM('Northing', utmResult[2])
  ];

  useEffect(() => {
    if (popupElRef?.current) {
      DomEvent.disableClickPropagation(popupElRef?.current);
      DomEvent.disableScrollPropagation(popupElRef?.current);
    }
  }, []);

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
  };

  const handleChange = (event: React.ChangeEvent<{}>, newSection: string) => {
    setSection(newSection);
  };

  return (
    <>
      <Popup className={theme} ref={popupElRef} autoClose={false} closeOnClick={false} closeButton={false}>
        <div>
          <TableContainer>
            {section == 'position' && <RenderTablePosition rows={utmRows} />}
            {section == 'invasivesbc' && <RenderTableActivity bufferedGeo={bufferedGeo} map={map} />}
            {/*section == 'databc' && <RenderTableDataBC rows={databc} />*/}
            {section == 'iapp' && <RenderTablePOI bufferedGeo={bufferedGeo} map={map} />}
          </TableContainer>
          <Grid container>
            <BottomNavigation
              style={{ backgroundColor: themeType ? '#333' : null, width: 500 }}
              value={section}
              onChange={handleChange}>
              <BottomNavigationAction value="position" label="Position" icon={<LocationOnIcon />} />
              <BottomNavigationAction value="invasivesbc" label="InvasivesBC" icon={<FolderIcon />} />
              {/*<BottomNavigationAction value="databc" label="Data BC" icon={<StorageIcon />} />*/}
              <BottomNavigationAction value="iapp" label="IAPP" icon={<AdjustIcon />} />
            </BottomNavigation>
          </Grid>
          <Grid container>
            {/* <Stack direction="row" spacing={1} style={{ width: 500 }} alignItems="center">
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
            </Stack> */}
            <Grid item>
              <Button onClick={hideElement}>Close</Button>
            </Grid>
          </Grid>
        </div>
      </Popup>
    </>
  );
};

function SetPointOnClick({ map }: any) {
  const themeContext = useContext(ThemeContext);
  const [positionOne, setPositionOne] = useState(null);
  const [drawnGeo, setDrawnGeo] = useState(null);
  const [clickMode, setClickMode] = useState(false);
  const [drawnOpacity, setDrawnOpacity] = useState({
    opacity: 0,
    fillOpacity: 0
  });
  const drawnGeoKey = Math.random(); // NOSONAR
  // Removed for redundancy
  // const recordGeoKey = Math.random(); // NOSONAR
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
    try {
      // Start drawing a box
      if (clickMode) {
        if (positionOne === null) {
          setPositionOne(e.latlng);
          setDrawnOpacity(null);
        } else {
          setPositionOne(null);
          setClickMode(false);
          setDrawnOpacity(null);
        }
      }
      // else {
      //   // just click to create invisible small box
      //   const temp = e.latlng;
      //   const val = 0.001;
      //   const latlng1 = [temp.lng + val, temp.lat - val / 2];
      //   const latlng3 = [temp.lng - val, temp.lat + val / 2];
      //   const latlng2 = [temp.lng + val, temp.lat + val / 2];
      //   const latlng4 = [temp.lng - val, temp.lat - val / 2];
      //   setDrawnGeo(polygon([[latlng1, latlng2, latlng3, latlng4, latlng1]]));
      //   const result = calc_utm(temp.lng, temp.lat);
      //   setUTM([
      //     createDataUTM('Zone', result[0]),
      //     createDataUTM('Easting', result[1]),
      //     createDataUTM('Northing', result[2])
      //   ]);
      //   setDrawnOpacity({
      //     opacity: 0,
      //     fillOpacity: 0
      //   });
      // }
    } catch (_e) {
      console.log('Info Area Description click error', _e);
    }
  });

  // get mouse location on map to draw temporary geometry
  useMapEvent('mousemove', (e) => {
    if (positionOne && clickMode) {
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

  return (
    <ListItem disableGutters className={toolClass.listItem}>
      <ListItemButton
        ref={divRef}
        onClick={() => {
          if (!clickMode) {
            setDrawnGeo(null);
          }
          setClickMode(!clickMode);
        }}
        style={{
          backgroundColor: clickMode ? 'lightgray' : null,
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
        <GeoJSON style={() => drawnOpacity} data={drawnGeo} key={drawnGeoKey}>
          {!clickMode && <GeneratePopup map={map} bufferedGeo={drawnGeo} setClickMode={setClickMode} />}
        </GeoJSON>
      )}
    </ListItem>
  );
}

// Circle Icon: <div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
// Binoculars: <div>Icons made by <a href="" title="Victoruler">Victoruler</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
export { SetPointOnClick };
