import AdjustIcon from '@mui/icons-material/Adjust';
import FolderIcon from '@mui/icons-material/Folder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { BottomNavigation, BottomNavigationAction, Button, Grid, TableContainer } from '@mui/material';
// Removed Temporarily until we figure out databc Table:
// import StorageIcon from '@mui/icons-material/Storage';
import center from '@turf/center';
import L from 'leaflet';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Marker, Popup, useMap, useMapEvent } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { MAP_SET_WHATS_HERE_SECTION, MAP_TOGGLE_WHATS_HERE } from 'state/actions';
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
  const map = useMap();
  const position = center(bufferedGeo).geometry.coordinates;
  const utmResult = calc_utm(position[0], position[1]);
  const utmRows = [
    createDataUTM('Zone', utmResult[0]),
    createDataUTM('Easting', utmResult[1]),
    createDataUTM('Northing', utmResult[2])
  ];
  const dispatch = useDispatch();
  const mapState = useSelector(selectMap);

  // (NOSONAR)'d Temporarily until we figure out databc Table:
  // const [databc, setDataBC] = useState(null); // NOSONAR
  const popupOnClose = () => {
    dispatch({ type: MAP_TOGGLE_WHATS_HERE });
  };

  const hideElement = () => {
    //    map.closePopup();
  };

  const handleChange = (_event: React.ChangeEvent<{}>, newSection: string) => {
    dispatch({
      type: MAP_SET_WHATS_HERE_SECTION,
      payload: {
        section: newSection
      }
    });
  };

  return (
    <>{mapState?.whatsHere?.section?
    <div
      id="whatsherepopup"
      style={{ position: 'fixed', padding: 20, borderRadius: 20, backgroundColor: 'white', left: props.left, top: props.top, zIndex: 1000000 }}>
      <TableContainer>
        {mapState?.whatsHere?.section === 'position' ? <RenderTablePosition rows={utmRows} /> : <></>}
        {mapState?.whatsHere?.section === 'invasivesbc' && <RenderTableActivity bufferedGeo={bufferedGeo} map={map} />}
        {/*section == 'databc' && <RenderTableDataBC rows={databc} />*/}
        {mapState?.whatsHere?.section === 'iapp' && <RenderTablePOI bufferedGeo={bufferedGeo} map={map} />}
      </TableContainer>
      <Grid container>
        <BottomNavigation
          style={{ backgroundColor: darkTheme ? '#333' : null, width: 500 }}
          value={mapState?.whatsHere?.section}
          onChange={handleChange}>
          <BottomNavigationAction value="position" label="Position" icon={<LocationOnIcon />} />
          <BottomNavigationAction value="invasivesbc" label="InvasivesBC" icon={<FolderIcon />} />
          {/*<BottomNavigationAction value="databc" label="Data BC" icon={<StorageIcon />} />*/}
          <BottomNavigationAction value="iapp" label="IAPP" icon={<AdjustIcon />} />
        </BottomNavigation>
      </Grid>
      <Grid container>
        <Grid item>
          <Button onClick={popupOnClose}>Close</Button>
        </Grid>
      </Grid>
    </div>
    : <></>}</>
  );
};

export const WhatsHereMarker = (props) => {
  const map = useMap();
  const mapState = useSelector(selectMap);
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
      //console.log('whoops closing already')
      //map?.closePopup();
    };
  }, [refReady]);

  const refCallback = (r) => {
    popupRef = r;
    r === null ? setRefReady(false) : setRefReady(true);
  };

  const PopupMemo = (props) => {
    const [DOMXY, setDOMXY] = useState([]);

    const getDOMXY = () => {
      const markerElement = document.getElementsByClassName('whatsHereMarkerClass')[0];
      const boundingRect = markerElement?.getBoundingClientRect();
      setDOMXY([(boundingRect.x - 250), (boundingRect.top - 100)]);
    };
    useEffect(() => {
      getDOMXY();
    }, []);

    const map = useMapEvent('drag', getDOMXY);

    return (
      <>
        {position?.lat && DOMXY.length > 0 ? (
          <WhatsHerePopUpContent left={DOMXY[0]} top={DOMXY[1]} bufferedGeo={mapState?.whatsHere?.feature} />
        ) : (
          <></>
        )}
      </>
    );
  };

  const icon = new L.DivIcon({
    html: renderToStaticMarkup(
      <svg
        width="40"
        height="40"
        viewBox="0 0 100 100"
        version="1.1"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M45 0C27.677 0 13.584 14.093 13.584 31.416a31.13 31.13 0 0 0 3.175 13.773c2.905 5.831 11.409 20.208 20.412 35.428l4.385 7.417a4 4 0 0 0 6.888 0l4.382-7.413c8.942-15.116 17.392-29.4 20.353-35.309.027-.051.055-.103.08-.155a31.131 31.131 0 0 0 3.157-13.741C76.416 14.093 62.323 0 45 0zm0 42.81c-6.892 0-12.5-5.607-12.5-12.5s5.608-12.5 12.5-12.5 12.5 5.608 12.5 12.5-5.608 12.5-12.5 12.5z"
          style={{
            stroke: 'none',
            strokeWidth: 1,
            strokeDasharray: 'none',
            strokeLinecap: 'butt',
            strokeLinejoin: 'miter',
            strokeMiterlimit: 10,
            fill: '#00008B',
            fillRule: 'nonzero',
            opacity: 1
          }}
          transform="matrix(1 0 0 1 0 0)"
        />
      </svg>
    ),
    className: 'whatsHereMarkerClass',
    iconSize: [50, 50],
    iconAnchor: [50 / 2, 50 / 2]
  });

  return (
    <>
      {position?.lat && map ? (
        <>
          <Marker icon={icon} ref={markerRef} position={[position?.lat, position?.lng]}></Marker>
          <PopupMemo />
        </>
      ) : (
        <></>
      )}
    </>
  );
};
