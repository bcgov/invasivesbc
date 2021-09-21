import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Button,
  IconButton,
  Slider,
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

export const GeneratePopup = ({ utmRows, map, lat, lng }) => {
  const [bufferedGeo, setBufferedGeo] = useState(null);
  const [section, setSection] = useState('position');
  const [databc, setDataBC] = useState(null);
  const [radius, setRadius] = useState(3);
  const [rows, setRows] = useState([]);
  const dataAccess = useDataAccess();
  const popupElRef = useRef(null);
  var activities;

  function valueText(value: number) {
    return `${value}km`;
  }

  useEffect(() => {
    if (lat && lng) {
      var point = turf.point([lng, lat]);
      setBufferedGeo(turf.buffer(point, radius, { units: 'kilometers' }));
      updateActivityRecords();
    }
  }, [radius]);

  const updateActivityRecords = useCallback(async () => {
    if (bufferedGeo) {
      //check console.dir('fetching buffered', bufferedGeo);
      activities = await dataAccess.getActivities({ search_feature: bufferedGeo });
      //(data check) console.dir(activities);
      //setActivity(activities.rows);

      if (activities.rows.length > 0) {
        var len = activities.rows.length;
        var tempArr = [];
        tempArr.length = len;
        for (let i in activities.rows) {
          var tempObj = activities.rows[i];
          tempArr[parseInt(i)] = {
            tempObj,
            open: false
          };
          setRows(tempArr);
        }
      } else {
        setRows([]);
      }
    }
  }, [bufferedGeo]);

  useEffect(() => {
    if (bufferedGeo) {
      getDataFromDataBC('WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW', bufferedGeo).then((returnVal) => {
        setDataBC(returnVal);
      }, []);
      updateActivityRecords();
    }
  }, [bufferedGeo]);

  const hideElement = () => {
    if (!popupElRef?.current || !map) return;
    map.closePopup();
  };

  const handleChange = (event: React.ChangeEvent<{}>, newSection: string) => {
    setSection(newSection);
  };

  return (
    <Popup ref={popupElRef} autoClose={false} closeOnClick={false} closeButton={false}>
      <Slider
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
      <TableContainer>
        {section == 'position' && <RenderTablePosition rows={utmRows} />}
        {section == 'activity' && <RenderTableActivity records={rows} />}
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
  const [position, setPosition] = useState(map?.getCenter());
  const [geoPoint, setGeoPoint] = useState(null);
  const [utm, setUTM] = useState(null);
  const [rows, setRows] = useState(null);

  useMapEvent('click', (e) => {
    setPosition(e.latlng);
  });

  useEffect(() => {
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

  return (
    <>
      {utm && (
        <GeoJSON data={geoPoint} key={Math.random()}>
          <GeneratePopup utmRows={rows} map={map} lat={position.lat} lng={position.lng} />
        </GeoJSON>
      )}
    </>
  );
}

export { SetPointOnClick };
