import AdjustIcon from '@mui/icons-material/Adjust';
import FolderIcon from '@mui/icons-material/Folder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { BottomNavigation, BottomNavigationAction, Button, Grid, TableContainer } from '@mui/material';
// Removed Temporarily until we figure out databc Table:
// import StorageIcon from '@mui/icons-material/Storage';
import center from '@turf/center';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { MAP_TOGGLE_WHATS_HERE } from 'state/actions';
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
    map.closePopup();
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
  const markerRef = useRef();
  const { darkTheme } = useSelector(selectUserSettings);
  const theme = darkTheme ? 'leaflet-popup-content-wrapper-dark' : 'leaflet-popup-content-wrapper-light';
  const [refReady, setRefReady] = useState(false);
  let popupRef = useRef();
  const [position, setPosition] = useState(null);

  useEffect(() => {
    let lat = null;
    let lng = null;

    if (mapState?.whatsHere?.feature?.geometry) {
      lat = JSON.parse(JSON.stringify(center(mapState?.whatsHere?.feature)?.geometry?.coordinates[1]));
      lng = JSON.parse(JSON.stringify(center(mapState?.whatsHere?.feature)?.geometry?.coordinates[0]));
      setPosition({ lat: lat, lng: lng });
    }

    return () => {
      setPosition(null);
    };
  }, [JSON.stringify(mapState?.whatsHere?.feature)]);

  useEffect(() => {
    if (
      markerRef.current &&
      popupRef &&
      mapState?.whatsHere?.toggle &&
      mapState?.whatsHere?.feature &&
      refReady &&
      map &&
      position?.lat
    ) {
      try {
        popupRef?.openOn(map);
      } catch (e) {
        console.log('the error!', e);
      }
    }

    return () => {
      map?.closePopup();
    };
  }, [refReady]);

  const popupOnClose = () => {
    dispatch({ type: MAP_TOGGLE_WHATS_HERE });
  };

  const refCallback = (r) => {
    popupRef = r;
    r === null ? setRefReady(false) : setRefReady(true);
  };

  const PopupMemo = (props) => {
    return useMemo(() => {
      return (
        <Popup
          ref={refCallback}
          className={theme}
          onClose={popupOnClose}
          autoClose={false}
          closeOnClick={true}
          closeButton={false}>
          <WhatsHerePopUpContent popupOnClose={popupOnClose} bufferedGeo={mapState?.whatsHere?.feature} />
        </Popup>
      );
    }, [JSON.stringify(position)]);
  };

  return (
    <>
      {position?.lat && map ? (
        <Marker ref={markerRef} position={[position?.lat, position?.lng]}>
          <PopupMemo />
        </Marker>
      ) : (
        <></>
      )}
    </>
  );
};
