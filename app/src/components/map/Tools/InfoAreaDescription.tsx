import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Button,
  IconButton,
  TableContainer,
  Tooltip,
  Typography
} from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import FolderIcon from '@material-ui/icons/Folder';
import DirectionsRunIcon from '@material-ui/icons/DirectionsRun';
import { useMapEvent, GeoJSON, Popup } from 'react-leaflet';
import { utm_zone } from './DisplayPosition';
import { toolStyles } from './Helpers/ToolBtnStyles';
import { ThemeContext } from 'contexts/themeContext';
import { createDataUTM, RenderTableActivity, RenderTablePosition, RenderTableDataBC } from './Helpers/StyledTable';
import { useDataAccess } from '../../../hooks/useDataAccess';
import { getDataFromDataBC } from '../WFSConsumer';
import * as turf from '@turf/turf';
import { Feature, Geometry } from 'geojson';
import { Layer } from 'leaflet';

export const generateGeo = (lat, lng, { setGeoPoint }) => {
  if (lat && lng) {
    setGeoPoint({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          }
        }
      ]
    });
  }
};

export const GeneratePopup = ({ utmRows, map, bufferedGeo, databc }) => {
  const popupElRef = useRef(null);
  const dataAccess = useDataAccess();
  const [section, setSection] = useState('position');
  const [activityRecords, setActivity] = useState(null);

  const updateActivityRecords = useCallback(async () => {
    //check console.dir('fetching buffered', bufferedGeo);
    const activities = await dataAccess.getActivities({ search_feature: bufferedGeo });
    //(data check) console.dir(activities);
    setActivity(activities.rows);
  }, []);

  const hideElement = () => {
    if (!popupElRef?.current || !map) return;
    map.closePopup();
  };

  const handleChange = (event: React.ChangeEvent<{}>, newSection: string) => {
    setSection(newSection);
  };

  useEffect(() => {
    updateActivityRecords();
  }, [bufferedGeo]);

  return (
    <Popup ref={popupElRef} autoClose={false} closeOnClick={false} closeButton={false}>
      <TableContainer>
        {section == 'position' && <RenderTablePosition rows={utmRows} />}
        {section == 'activity' && activityRecords && <RenderTableActivity records={activityRecords} />}
        {section == 'databc' && <RenderTableDataBC records={databc} />}
      </TableContainer>
      <BottomNavigation value={section} onChange={handleChange}>
        <BottomNavigationAction value="position" label="Position" icon={<LocationOnIcon />} />
        <BottomNavigationAction value="activity" label="Activity" icon={<DirectionsRunIcon />} />
        <BottomNavigationAction value="databc" label="Data BC" icon={<FolderIcon />} />
      </BottomNavigation>
      <Button onClick={hideElement}>Close</Button>
    </Popup>
  );
};

function SetPointOnClick({ map }: any) {
  const [bufferedGeo, setBufferedGeo] = useState(null);
  const [position, setPosition] = useState(map?.getCenter());
  const [geoPoint, setGeoPoint] = useState(null);
  const [utm, setUTM] = useState(null);
  const [rows, setRows] = useState(null);
  const [databc, setDataBC] = useState(null);
  const themeContext = useContext(ThemeContext);
  const toolClass = toolStyles();

  useMapEvent('click', (e) => {
    setPosition(e.latlng);
  });

  useEffect(() => {
    if (position) {
      var point = turf.point([position.lng, position.lat]);
      setBufferedGeo(turf.buffer(point, 3, { units: 'kilometers' }));
    }
    if (isFinite(position?.lng) && isFinite(position?.lat)) {
      setUTM(utm_zone(position?.lng as number, position?.lat as number));
      generateGeo(position.lat, position.lng, { setGeoPoint });
    }
  }, [position]);

  useEffect(() => {
    if (utm) {
      setRows([createDataUTM('UTM', utm[0]), createDataUTM('Northing', utm[2]), createDataUTM('Easting', utm[1])]);
    }
  }, [utm]);

  useEffect(() => {
    if (bufferedGeo) {
      getDataFromDataBC('WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW', bufferedGeo).then((returnVal) => {
        setDataBC(returnVal);
      }, []);
    }
  }, [bufferedGeo]);

  return (
    <>
      {position && (
        <Tooltip
          disableFocusListener
          classes={{ tooltip: toolClass.tooltipWidth }}
          placement="left"
          title={
            utm && (
              <>
                <Typography>UTM Zone {utm[0]}</Typography>
                <Typography>UTM Northing {utm[2]}</Typography>
                <Typography>UTM Easting {utm[1]}</Typography>
              </>
            )
          }>
          <IconButton className={toolClass.toolBtnCircle}>
            <InfoIcon className={themeContext.themeType ? toolClass.toolIconDark : toolClass.toolIconLight} />
          </IconButton>
        </Tooltip>
      )}
      {utm && (
        <GeoJSON data={geoPoint} key={Math.random()}>
          <GeneratePopup utmRows={rows} map={map} bufferedGeo={bufferedGeo} databc={databc} />
        </GeoJSON>
      )}
    </>
  );
}

export { SetPointOnClick };
