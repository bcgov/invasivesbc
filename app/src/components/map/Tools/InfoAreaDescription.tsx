import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Button,
  Slider,
  TableContainer,
  Typography
} from '@material-ui/core';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import FolderIcon from '@material-ui/icons/Folder';
import StorageIcon from '@material-ui/icons/Storage';
import { useMapEvent, GeoJSON, Popup } from 'react-leaflet';
import { calc_utm } from './DisplayPosition';
import { createDataUTM, RenderTableActivity, RenderTablePosition, RenderTableDataBC } from './Helpers/StyledTable';
import { getDataFromDataBC } from '../WFSConsumer';
import * as turf from '@turf/turf';
import { DomEvent } from 'leaflet';
import { useDataAccess } from '../../../hooks/useDataAccess';

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
  const [pois, setPOIs] = useState([]);
  const [rows, setRows] = useState([]);
  const dataAccess = useDataAccess();
  const popupElRef = useRef(null);
  var activities;

  useEffect(() => {
    if (popupElRef?.current) {
      DomEvent.disableClickPropagation(popupElRef?.current);
      DomEvent.disableScrollPropagation(popupElRef?.current);
    }
  });

  useEffect(() => {
    if (lat && lng) {
      var point = turf.point([lng, lat]);
      setBufferedGeo(turf.buffer(point, radius, { units: 'kilometers' }));
    }
  }, [radius]);

  useEffect(() => {
    if (bufferedGeo) {
      getDataFromDataBC('WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW', bufferedGeo).then((returnVal) => {
        setDataBC(returnVal);
      }, []);
    }
  }, [bufferedGeo]);

  useEffect(() => {
    if (pois) {
      pois.forEach((poi) => {
        console.log(poi.point_of_interest_id);
        var temp = [];
        if (poi.species_negative) {
          poi.species_negative.map((species) => {
            temp.push(species);
          });
        }
        if (poi.species_positive) {
          poi.species_positive.map((species) => {
            temp.push(species);
          });
        }
        console.log(temp);
        console.log(poi.getArea());
      });
    }
  }, [pois]);

  useEffect(() => {
    updateActivityRecords();
  }, [bufferedGeo]);

  const updateActivityRecords = useCallback(async () => {
    if (bufferedGeo) {
      activities = await dataAccess.getActivities({ search_feature: bufferedGeo });
      var pointsofinterest = await dataAccess.getPointsOfInterest({
        search_feature: bufferedGeo,
        limit: 1000,
        page: 0
      });
      if (activities) {
        var tempArr = [];
        for (let i in activities.rows) {
          if (activities.rows[i]) {
            var obj = activities.rows[i];
            tempArr.push({
              obj,
              open: false
            });
          }
        }
        setRows(tempArr);

        setPOIs(pointsofinterest);
      } else setRows([]);
    }
  }, [bufferedGeo]);

  const hideElement = () => {
    if (!popupElRef?.current || !map) return;
    map.closePopup();
  };

  const handleChange = (event: React.ChangeEvent<{}>, newSection: string) => {
    setSection(newSection);
  };

  function valueText(value: number) {
    return `${value}km`;
  }

  return (
    <Popup ref={popupElRef} autoClose={false} closeOnClick={false} closeButton={false}>
      <Typography>Radius</Typography>
      <div style={{ display: 'flex', flexFlow: 'nowrap', marginTop: -40 }}>
        <Typography>{radius} km</Typography>
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
      </div>
      <TableContainer>
        {section == 'position' && <RenderTablePosition rows={utmRows} />}
        {section == 'activity' && <RenderTableActivity rows={rows} setRows={setRows} />}
        {section == 'databc' && <RenderTableDataBC records={databc} />}
      </TableContainer>
      <BottomNavigation value={section} onChange={handleChange}>
        <BottomNavigationAction value="position" label="Position" icon={<LocationOnIcon />} />
        <BottomNavigationAction value="activity" label="Activity" icon={<FolderIcon />} />
        <BottomNavigationAction value="databc" label="Data BC" icon={<StorageIcon />} />
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
      setUTM(calc_utm(position?.lng as number, position?.lat as number));
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
