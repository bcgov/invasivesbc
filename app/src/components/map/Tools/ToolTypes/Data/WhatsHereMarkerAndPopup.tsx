import AdjustIcon from '@mui/icons-material/Adjust';
import FolderIcon from '@mui/icons-material/Folder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { BottomNavigation, BottomNavigationAction, Button, Grid, TableContainer } from '@mui/material';
// Removed Temporarily until we figure out databc Table:
// import StorageIcon from '@mui/icons-material/Storage';
import center from '@turf/center';
import L from 'leaflet';
import React, { useEffect, useRef, useState } from 'react';
import { Marker, Popup, useMap, useMapEvent } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { MAP_TOGGLE_WHATS_HERE, MAP_WHATS_HERE_FEATURE } from 'state/actions';
import { selectMap } from 'state/reducers/map';
import { selectUserSettings } from 'state/reducers/userSettings';
import {
  createDataUTM,
  RenderTableActivity,
  // Removed Temporarily until we figure out databc Table:
  // RenderTableDataBC,
  RenderTablePOI,
  RenderTablePosition
} from '../../Helpers/StyledTable';
import { toolStyles } from '../../Helpers/ToolStyles';
import { calc_utm } from '../Nav/DisplayPosition';

export const WhatsHerePopUpContent = (props) => {
  const { bufferedGeo, onCloseCallback = null } = props;
  const { darkTheme } = useSelector(selectUserSettings);
  const theme = darkTheme ? 'leaflet-popup-content-wrapper-dark' : 'leaflet-popup-content-wrapper-light';
  const [section, setSection] = useState('position');
  const map = useMap();
  const position = center(bufferedGeo).geometry.coordinates;

  // (NOSONAR)'d Temporarily until we figure out databc Table:
  // const [databc, setDataBC] = useState(null); // NOSONAR

  const utmResult = calc_utm(position[0], position[1]);
  const utmRows = [
    createDataUTM('Zone', utmResult[0]),
    createDataUTM('Easting', utmResult[1]),
    createDataUTM('Northing', utmResult[2])
  ];

  const hideElement = () => {
    //onCloseCallback();
    map.closePopup();
    /*setSection('position');
    if (onCloseCallback) {
      setTimeout(() => {
        onCloseCallback();
      }, 500);
    }
    */
  };

  const handleChange = (_event: React.ChangeEvent<{}>, newSection: string) => {
    setSection(newSection);
  };

  return (
    <div>
      <TableContainer>
        {section === 'position' && <RenderTablePosition rows={utmRows} />}
        {section === 'invasivesbc' && <RenderTableActivity bufferedGeo={bufferedGeo} map={map} />}
        {/*section == 'databc' && <RenderTableDataBC rows={databc} />*/}
        {section === 'iapp' && <RenderTablePOI bufferedGeo={bufferedGeo} map={map} />}
      </TableContainer>
      <Grid container>
        <BottomNavigation
          style={{ backgroundColor: darkTheme ? '#333' : null, width: 500 }}
          value={section}
          onChange={handleChange}>
          <BottomNavigationAction value="position" label="Position" icon={<LocationOnIcon />} />
          <BottomNavigationAction value="invasivesbc" label="InvasivesBC" icon={<FolderIcon />} />
          {/*<BottomNavigationAction value="databc" label="Data BC" icon={<StorageIcon />} />*/}
          <BottomNavigationAction value="iapp" label="IAPP" icon={<AdjustIcon />} />
        </BottomNavigation>
      </Grid>
      <Grid container>
        <Grid item>
          <Button onClick={hideElement}>Close</Button>
        </Grid>
      </Grid>
    </div>
  );
};

export const WhatsHereMarker = (props) => {
  const map = useMap();
  const mapState = useSelector(selectMap);
  const dispatch = useDispatch();
  const markerRef = useRef(null);
  const { darkTheme } = useSelector(selectUserSettings);
  const theme = darkTheme ? 'leaflet-popup-content-wrapper-dark' : 'leaflet-popup-content-wrapper-light';
  const [refReady, setRefReady] = useState(false);
  let popupRef = useRef();

  useEffect(() => {
    if (refReady && map && (mapState?.whatsHere as any)?.toggle && (mapState?.whatsHere as any)?.feature) {
      popupRef?.openOn(map);
    }

    return () => {
      setRefReady(false);
    };
  }, [refReady, map, mapState?.whatsHere]);

  return (
    <>
      {(mapState?.whatsHere as any)?.feature && map ? (
        <Marker
          ref={markerRef}
          position={{
            lat: center((mapState?.whatsHere as any)?.feature)?.geometry.coordinates[1],
            lng: center((mapState?.whatsHere as any)?.feature)?.geometry.coordinates[0]
          }}>
          <Popup
            ref={(r) => {
              popupRef = r;
              setRefReady(true);
            }}
            className={theme}
            onClose={() => {
              dispatch({ type: MAP_TOGGLE_WHATS_HERE });
            }}
            autoClose={false}
            closeOnClick={true}
            closeButton={false}>
            <WhatsHerePopUpContent bufferedGeo={(mapState?.whatsHere as any)?.feature} />
          </Popup>
        </Marker>
      ) : (
        <></>
      )}
    </>
  );
};
