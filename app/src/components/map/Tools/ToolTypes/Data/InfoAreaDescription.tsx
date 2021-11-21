//Material UI
import {
  BottomNavigation,
  BottomNavigationAction,
  Button,
  Grid,
  IconButton,
  Slider,
  Switch,
  TableContainer,
  Typography
} from '@material-ui/core';
import AdjustIcon from '@material-ui/icons/Adjust';
import FolderIcon from '@material-ui/icons/Folder';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import StorageIcon from '@material-ui/icons/Storage';
import { Stack } from '@mui/material';
import * as turf from '@turf/turf';
import { ThemeContext } from 'contexts/themeContext';
import L, { DomEvent } from 'leaflet';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
// Leaflet and React-Leaflet
import { GeoJSON, Marker, Popup, Tooltip, useMapEvent } from 'react-leaflet';
import { useDataAccess } from '../../../../../hooks/useDataAccess';
import binoculars from '../../../Icons/binoculars.png';
import { getDataFromDataBC } from '../../../WFSConsumer';
import {
  createDataUTM,
  RenderTableActivity,
  RenderTableDataBC,
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

export const GeneratePopup = ({ utmRows, map, lat, lng, setPoiMarker, setActivityGeo }) => {
  const [bufferedGeo, setBufferedGeo] = useState(null);
  const [poiTableRows, setPoiTableRows] = useState([]);
  const [section, setSection] = useState('position');
  const [pointMode, setPointMode] = useState(true);
  const [showRadius, setShowRadius] = useState(false);
  const [databc, setDataBC] = useState(null);
  const [radius, setRadius] = useState(3);
  const [pois, setPOIs] = useState([]);
  const [rows, setRows] = useState([]);
  const dataAccess = useDataAccess();
  const themeContext = useContext(ThemeContext);
  const { themeType } = themeContext;
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
      if (pointMode) {
        setBufferedGeo(point);
      } else {
        setBufferedGeo(turf.buffer(point, radius, { units: 'kilometers' }));
      }
    }
  }, [radius, pointMode]);

  useEffect(() => {
    if (bufferedGeo) {
      getDataFromDataBC('WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW', bufferedGeo).then((returnVal) => {
        setDataBC(returnVal);
      }, []);
    }
  }, [bufferedGeo]);

  useEffect(() => {
    if ((pois as any)?.rows) {
      (pois as any)?.rows?.map((poi) => {
        var arrSpecies = [];
        var arrJurisdictions = [];
        getSpecies(arrSpecies, poi);
        getJurisdictions(arrJurisdictions, poi);
        setPoiTableRows((oldArray) => [...oldArray, setPoiRowData(poi, arrSpecies, arrJurisdictions)]);
      });
    }
  }, [pois]);

  useEffect(() => {
    updateActivityRecords();
  }, [bufferedGeo]);

  useEffect(() => {
    updatePOIRecords();
  }, [bufferedGeo]);

  const getSpecies = (arrSpecies, poi) => {
    if (poi.species_negative) {
      poi.species_negative.map((species) => arrSpecies.push(species));
    }
    if (poi.species_positive) {
      poi.species_positive.map((species) => arrSpecies.push(species));
    }
  };

  const getJurisdictions = (arrJurisdictions, poi) => {
    var surveys = poi.point_of_interest_payload.form_data.surveys;
    if (surveys) {
      surveys.map((survey) => {
        survey.jurisdictions.map((jurisdiction) => {
          var flag = 0;
          for (let i in arrJurisdictions) {
            if (jurisdiction.jurisdiction_code === arrJurisdictions[i]) {
              flag = 1;
              break;
            }
          }
          if (flag === 0) arrJurisdictions.push(jurisdiction.jurisdiction_code);
        });
      });
    }
  };

  const setPoiRowData = (poi, arrSpecies, arrJurisdictions) => {
    return {
      site_id: poi.point_of_interest_payload.form_data.point_of_interest_type_data.site_id,
      species: arrSpecies,
      jurisdictions: arrJurisdictions,
      geometry: poi.point_of_interest_payload.geometry
    };
  };

  const updateActivityRecords = useCallback(async () => {
    if (bufferedGeo) {
      activities = await dataAccess.getActivities({ search_feature: bufferedGeo });
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
      } else setRows([]);
    }
  }, [bufferedGeo]);

  const updatePOIRecords = useCallback(async () => {
    if (bufferedGeo) {
      var pointsofinterest = await dataAccess.getPointsOfInterest({
        search_feature: bufferedGeo,
        limit: 500,
        page: 0
      });

      setPOIs(pointsofinterest);
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
    <>
      <Popup
        className={themeType ? 'leaflet-popup-content-wrapper-dark' : 'leaflet-popup-content-wrapper-light'}
        ref={popupElRef}
        autoClose={false}
        closeOnClick={false}
        closeButton={false}>
        <div>
          <TableContainer>
            {section == 'position' && <RenderTablePosition rows={utmRows} />}
            {section == 'activity' && (
              <RenderTableActivity setActivityGeo={setActivityGeo} map={map} rows={rows} setRows={setRows} />
            )}
            {section == 'databc' && <RenderTableDataBC rows={databc} />}
            {section == 'poi' && <RenderTablePOI map={map} rows={poiTableRows} setPoiMarker={setPoiMarker} />}
          </TableContainer>
          <Grid container>
            <BottomNavigation
              style={{ backgroundColor: themeType ? '#333' : null, width: 301 }}
              value={section}
              onChange={handleChange}>
              <BottomNavigationAction value="position" label="Position" icon={<LocationOnIcon />} />
              <BottomNavigationAction value="activity" label="Activity" icon={<FolderIcon />} />
              <BottomNavigationAction value="databc" label="Data BC" icon={<StorageIcon />} />
              <BottomNavigationAction value="poi" label="POI" icon={<AdjustIcon />} />
            </BottomNavigation>
          </Grid>
          <Grid container>
            <Stack direction="row" spacing={1} style={{ width: 301 }} alignItems="center">
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
  const [position, setPosition] = useState(map?.getCenter());
  const [geoPoint, setGeoPoint] = useState(null);
  const [clickMode, setClickMode] = useState(false);
  const [activityGeo, setActivityGeo] = useState(null);
  const [poiMarker, setPoiMarker] = useState(null);
  const [utm, setUTM] = useState(null);
  const [rows, setRows] = useState(null);
  const divRef = useRef();
  const themeContext = useContext(ThemeContext);
  const toolClass = toolStyles();

  useEffect(() => {
    L.DomEvent.disableClickPropagation(divRef?.current);
    L.DomEvent.disableScrollPropagation(divRef?.current);
  });

  useMapEvent('click', (e) => {
    if (clickMode) setPosition(e.latlng);
  });

  useEffect(() => {
    if (isFinite(position?.lng) && isFinite(position?.lat) && clickMode) {
      setUTM(calc_utm(position?.lng as number, position?.lat as number));
      generateGeo(position.lat, position.lng, { setGeoPoint });
    }
  }, [position]);

  useEffect(() => {
    if (utm) {
      setRows([createDataUTM('UTM', utm[0]), createDataUTM('Northing', utm[2]), createDataUTM('Easting', utm[1])]);
    }
  }, [utm]);

  const markerIcon = L.icon({
    iconUrl: binoculars,
    iconSize: [24, 24]
  });

  return (
    <>
      {
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
      )}

      <IconButton
        ref={divRef}
        className={themeContext.themeType ? toolClass.toolBtnDark : toolClass.toolBtnLight}
        onClick={() => setClickMode(!clickMode)}
        style={{
          backgroundColor: clickMode ? '#006ee6' : null,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
          marginTop: 5
        }}>
        <img
          style={{ width: 32, height: 32 }}
          color={themeContext.themeType ? '#000' : 'white'}
          src={binoculars}
          aria-label="create-pin"
        />
        <Typography className={toolClass.Font}>What's here?</Typography>
      </IconButton>
      {utm && (
        <GeoJSON data={geoPoint} key={Math.random()}>
          <GeneratePopup
            utmRows={rows}
            map={map}
            lat={position.lat}
            lng={position.lng}
            setPoiMarker={setPoiMarker}
            setActivityGeo={setActivityGeo}
          />
        </GeoJSON>
      )}
    </>
  );
}

// Circle Icon: <div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
// Binoculars: <div>Icons made by <a href="" title="Victoruler">Victoruler</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
export { SetPointOnClick };
