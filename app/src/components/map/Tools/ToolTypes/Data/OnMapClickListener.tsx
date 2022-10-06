import { BottomNavigation, BottomNavigationAction, Button, Grid, TableContainer, Typography } from '@mui/material';
import AdjustIcon from '@mui/icons-material/Adjust';
import FolderIcon from '@mui/icons-material/Folder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import L from 'leaflet';
import React, { useContext, useRef, useState } from 'react';
import { Marker, Popup, useMap, useMapEvent } from 'react-leaflet';
import dotMarker from '../../../Icons/dotMarker.png';
import { createDataUTM, RenderTableActivity, RenderTablePOI, RenderTablePosition } from '../../Helpers/StyledTable';
import { calc_utm } from '../Nav/DisplayPosition';
import * as turf from '@turf/turf';
import { useSelector } from 'state/utilities/use_selector';
import { selectUserSettings } from 'state/reducers/userSettings';

export const GeneratePopup = (props) => {
  const { position, onCloseCallback = null } = props;
  const { darkTheme } = useSelector(selectUserSettings);
  const theme = darkTheme ? 'leaflet-popup-content-wrapper-dark' : 'leaflet-popup-content-wrapper-light';
  const [section, setSection] = useState('position');
  const map = useMap();
  const popupRef = useRef(null);
  const utmResult = calc_utm(position[1], position[0]);
  const utmRows = [
    createDataUTM('Zone', utmResult[0]),
    createDataUTM('Easting', utmResult[1]),
    createDataUTM('Northing', utmResult[2])
  ];

  const generateGeo = (position) => {
    const lat = position[0];
    const lng = position[1];
    if (lat && lng) {
      const point = turf.point([lng, lat]);
      const buffer = turf.buffer(point, 1, { units: 'meters' });
      return buffer;
    }
  };

  const hideElement = () => {
    map.closePopup();
    if (onCloseCallback) {
      setTimeout(() => {
        onCloseCallback();
      }, 500);
    }
  };

  const handleChange = (_event: React.ChangeEvent<{}>, newSection: string) => {
    setSection(newSection);
  };

  return (
    <>
      <Popup className={theme} autoClose={false} closeOnClick={true} closeButton={false} ref={popupRef}>
        <div>
          <Grid container justifyContent={'space-between'} alignItems={'center'}>
            <Grid item>
              <Typography variant="h5">Current Position</Typography>
            </Grid>
            <Grid item>
              <Button onClick={hideElement}>Close</Button>
            </Grid>
          </Grid>
          <TableContainer>
            {section === 'position' && <RenderTablePosition rows={utmRows} />}
            {section === 'invasivesbc' && <RenderTableActivity bufferedGeo={generateGeo(position)} map={map} />}
            {section === 'iapp' && <RenderTablePOI bufferedGeo={generateGeo(position)} map={map} />}
          </TableContainer>
          <Grid container>
            <BottomNavigation
              style={{ backgroundColor: darkTheme ? '#333' : null, width: 500 }}
              value={section}
              onChange={handleChange}>
              <BottomNavigationAction value="position" label="Position" icon={<LocationOnIcon />} />
              <BottomNavigationAction value="invasivesbc" label="InvasivesBC" icon={<FolderIcon />} />
              <BottomNavigationAction value="iapp" label="IAPP" icon={<AdjustIcon />} />
            </BottomNavigation>
          </Grid>
        </div>
      </Popup>
    </>
  );
};

function OnMapClickListener(props) {
  const [clickedPosition, setClickedPosition] = React.useState(null);
  const markerRef = useRef(null);

  useMapEvent('click', (e) => {
    setClickedPosition([e.latlng.lat, e.latlng.lng]);
    if (markerRef.current) {
      markerRef.current.setLatLng(e.latlng);
    }
  });

  return (
    <>
      {clickedPosition ? (
        <Marker
          ref={markerRef}
          position={clickedPosition}
          eventHandlers={{
            add: function () {
              markerRef.current.openPopup();
            },
            move: function () {
              markerRef.current.openPopup();
            }
          }}
          icon={L.icon({
            iconUrl: dotMarker,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
            popupAnchor: [0, 0]
          })}>
          <GeneratePopup
            onCloseCallback={() => {
              setClickedPosition(null);
            }}
            position={clickedPosition}
          />
        </Marker>
      ) : (
        <></>
      )}
    </>
  );
}

export { OnMapClickListener };
