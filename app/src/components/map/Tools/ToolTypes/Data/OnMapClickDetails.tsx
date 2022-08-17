import { BottomNavigation, BottomNavigationAction, Card, Grid, TableContainer, Typography } from '@mui/material';
import AdjustIcon from '@mui/icons-material/Adjust';
import FolderIcon from '@mui/icons-material/Folder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { ThemeContext } from 'utils/CustomThemeProvider';
import L from 'leaflet';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Marker, useMap, useMapEvent } from 'react-leaflet';
import mapPin from '../../../Icons/mappin.png';
import { createDataUTM, RenderTableActivity, RenderTablePOI, RenderTablePosition } from '../../Helpers/StyledTable';
import { calc_utm } from '../Nav/DisplayPosition';
import { point } from '@turf/turf';
import buffer from '@turf/buffer';

interface OnMapClickDetailsProps {
  clickDetailsEnabled: boolean;
}

const PositionInfo = (props) => {
  const { position } = props;
  const divRef = useRef();
  const themeContext = useContext(ThemeContext);
  const { themeType } = themeContext;
  const [section, setSection] = useState('position');
  const map = useMap();
  const utmResult = calc_utm(position[0], position[1]);
  const utmRows = [
    createDataUTM('Zone', utmResult[0]),
    createDataUTM('Easting', utmResult[1]),
    createDataUTM('Northing', utmResult[2])
  ];

  useEffect(() => {
    L.DomEvent.disableClickPropagation(divRef?.current);
    L.DomEvent.disableScrollPropagation(divRef?.current);
  }, []);

  const generateGeo = (position) => {
    const lat = position[0];
    const lng = position[1];
    if (lat && lng) {
      const aPoint = point([lng, lat]);
      const aBuffer = buffer(aPoint, 1, { units: 'meters' });
      return buffer;
    }
  };

  const generatedGeo = generateGeo(position);
  const bufferedGeo = {
    type: 'FeatureCollection',
    features: [generatedGeo]
  };

  const handleChange = (_event: React.ChangeEvent<{}>, newSection: string) => {
    setSection(newSection);
  };

  return (
    <div ref={divRef}>
      <Card sx={{ paddingLeft: '20px', paddingRight: '20px', paddingTop: '10px', maxWidth: '340px' }}>
        <Grid container justifyContent={'space-between'} alignItems={'center'}>
          <Grid item>
            <Typography variant="h5" mb={2}>
              Current Position
            </Typography>
          </Grid>
        </Grid>
        <TableContainer>
          {section === 'position' && <RenderTablePosition rows={utmRows} />}
          {section === 'invasivesbc' && <RenderTableActivity bufferedGeo={bufferedGeo} map={map} />}
          {section === 'iapp' && <RenderTablePOI bufferedGeo={bufferedGeo} map={map} />}
        </TableContainer>
        <Grid container>
          <BottomNavigation
            style={{ backgroundColor: themeType ? '#333' : null, width: 500 }}
            value={section}
            onChange={handleChange}>
            <BottomNavigationAction value="position" label="Position" icon={<LocationOnIcon />} />
            <BottomNavigationAction value="invasivesbc" label="InvasivesBC" icon={<FolderIcon />} />
            <BottomNavigationAction value="iapp" label="IAPP" icon={<AdjustIcon />} />
          </BottomNavigation>
        </Grid>
      </Card>
    </div>
  );
};

function OnMapClickDetails(props: OnMapClickDetailsProps) {
  const [clickedPosition, setClickedPosition] = React.useState(null);
  const { clickDetailsEnabled } = props;
  const divRef = useRef();

  useEffect(() => {
    L.DomEvent.disableClickPropagation(divRef?.current);
    L.DomEvent.disableScrollPropagation(divRef?.current);
  }, []);

  const markerRef = useRef(null);
  const locationDetailsDialogRef = useRef(null);

  useEffect(() => {
    if (!clickDetailsEnabled) {
      setClickedPosition(null);
    }
  }, [clickDetailsEnabled]);

  useMapEvent('click', (e) => {
    if (clickDetailsEnabled) {
      setClickedPosition([e.latlng.lat, e.latlng.lng]);
      if (markerRef.current) {
        markerRef.current.setLatLng(e.latlng);
      }
    }
  });

  return { clickDetailsEnabled } ? (
    <div
      ref={divRef}
      className="leaflet-bottom leaflet-left"
      style={{
        left: '0px',
        bottom: '115px'
      }}>
      {clickedPosition && (
        <div className="leaflet-control-zoom leaflet-bar leaflet-control">
          <PositionInfo position={clickedPosition} componentRef={locationDetailsDialogRef} />
        </div>
      )}
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
            iconUrl: mapPin,
            iconSize: [40, 40],
            iconAnchor: [20, 40]
          })}></Marker>
      ) : (
        <></>
      )}
    </div>
  ) : (
    <></>
  );
}

export { OnMapClickDetails };
