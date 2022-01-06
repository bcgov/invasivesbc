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
  Slider,
  Switch,
  TableContainer,
  Typography
} from '@mui/material';
import AdjustIcon from '@mui/icons-material/Adjust';
import FolderIcon from '@mui/icons-material/Folder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
// Removed Temporarily until we figure out databc Table:
// import StorageIcon from '@mui/icons-material/Storage';
import { Stack } from '@mui/material';
import * as turf from '@turf/helpers';
import buffer from '@turf/buffer';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { ThemeContext } from 'utils/CustomThemeProvider';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
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
  // Removed Temporarily until we figure out databc Table:
  // RenderTableDataBC,
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
import {
  getJurisdictions,
  getLatestReportedArea,
  getReportedAreaOutput
} from 'components/points-of-interest/IAPP/IAPP-Functions';

export const generateGeo = (lat, lng, { setGeoPoint }) => {
  if (lat && lng) {
    var point = turf.point([lng, lat]);
    var buffer2 = buffer(point, 50, { units: 'meters' });
    setGeoPoint(buffer2);
  }
};

export const GeneratePopup = (props) => {
  const themeContext = useContext(ThemeContext);
  const { themeType } = themeContext;
  const theme = themeType ? 'leaflet-popup-content-wrapper-dark' : 'leaflet-popup-content-wrapper-light';
  const [bufferedGeo, setBufferedGeo] = useState(null);
  const [rowsPoi, setRowsPoi] = useState([]);
  const [section, setSection] = useState('position');
  const [pointMode, setPointMode] = useState(true);
  const [showRadius, setShowRadius] = useState(false);
  // (NOSONAR)'d Temporarily until we figure out databc Table:
  const [databc, setDataBC] = useState(null); // NOSONAR
  const [radius, setRadius] = useState(3);
  const [rowsActivity, setRowsActivity] = useState([]);
  const dataAccess = useDataAccess();
  const popupElRef = useRef(null);
  const dbContext = useContext(DatabaseContext);
  var activities;
  const invasivesApi = useInvasivesApi();

  useEffect(() => {
    if (popupElRef?.current) {
      DomEvent.disableClickPropagation(popupElRef?.current);
      DomEvent.disableScrollPropagation(popupElRef?.current);
    }
  }, []);

  useEffect(() => {
    if (props.lat && props.lng) {
      var point = turf.point([props.lng, props.lat]);
      if (pointMode) {
        setBufferedGeo(point);
      } else {
        setBufferedGeo(buffer(point, radius, { units: 'kilometers' }));
      }
    }
  }, [radius, pointMode]);
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

  useEffect(() => {
    updateActivityRecords();
    updatePOIRecords();
  }, [bufferedGeo]);

  const updateActivityRecords = useCallback(async () => {
    if (bufferedGeo) {
      activities = await dataAccess.getActivities({ search_feature: bufferedGeo }, dbContext);
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
        setRowsActivity(tempArr);
      } else setRowsActivity(null);
    }
  }, [bufferedGeo]);

  const updatePOIRecords = useCallback(async () => {
    if (bufferedGeo) {
      var pointsofinterest = await dataAccess.getPointsOfInterest(
        {
          search_feature: bufferedGeo,
          isIAPP: true,
          limit: 500,
          page: 0
        },
        dbContext
      );

      if (!pointsofinterest.rows) {
        return;
      }

      // Removed for now: setPoisObj(pointsofinterest);
      const tempArr = [];
      pointsofinterest.rows.map((poi) => {
        const surveys = poi.point_of_interest_payload.form_data.surveys;
        const tempSurveyArea = getLatestReportedArea(surveys);
        const newArr = getJurisdictions(surveys);
        const arrJurisdictions = [];
        newArr.forEach((item) => {
          arrJurisdictions.push(item.jurisdiction_code + ' (' + item.percent_covered + '%)');
        });

        var row = {
          id: poi.point_of_interest_id,
          site_id: poi.point_of_interest_payload.form_data.point_of_interest_type_data.site_id,
          jurisdiction_code: arrJurisdictions,
          species_code: poi.species_on_site,
          geometry: poi.point_of_interest_payload.geometry,
          reported_area: getReportedAreaOutput(tempSurveyArea)
        };
        tempArr.push(row);
      });
      setRowsPoi(tempArr);
    }
  }, [bufferedGeo]);

  const hideElement = () => {
    if (!popupElRef?.current || !props.map) return;
    props.map.closePopup();
    props.setActivityGeo(null);
    if (props.setClickMode) {
      props.setClickMode(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<{}>, newSection: string) => {
    setSection(newSection);
  };

  function valueText(value: number) {
    return `${value}km`;
  }

  return (
    <>
      <Popup className={theme} ref={popupElRef} autoClose={false} closeOnClick={false} closeButton={false}>
        <div>
          <TableContainer>
            {section == 'position' && <RenderTablePosition rows={props.utmRows} />}
            {section == 'activity' && (
              <RenderTableActivity
                setActivityGeo={props.setActivityGeo}
                map={props.map}
                rows={rowsActivity}
                setRows={setRowsActivity}
              />
            )}
            {/*section == 'databc' && <RenderTableDataBC rows={databc} />*/}
            {section == 'poi' && <RenderTablePOI map={props.map} rows={rowsPoi} setPoiMarker={props.setPoiMarker} />}
          </TableContainer>
          <Grid container>
            <BottomNavigation
              style={{ backgroundColor: themeType ? '#333' : null, width: 500 }}
              value={section}
              onChange={handleChange}>
              <BottomNavigationAction value="position" label="Position" icon={<LocationOnIcon />} />
              <BottomNavigationAction value="activity" label="Activity" icon={<FolderIcon />} />
              {/*<BottomNavigationAction value="databc" label="Data BC" icon={<StorageIcon />} />*/}
              <BottomNavigationAction value="poi" label="POI" icon={<AdjustIcon />} />
            </BottomNavigation>
          </Grid>
          <Grid container>
            <Stack direction="row" spacing={1} style={{ width: 500 }} alignItems="center">
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
  const themeContext = useContext(ThemeContext);
  const [position, setPosition] = useState(map?.getCenter());
  const [geoPoint, setGeoPoint] = useState(null);
  const [clickMode, setClickMode] = useState(false);
  const [activityGeo, setActivityGeo] = useState(null);
  const [poiMarker, setPoiMarker] = useState(null);
  const [utm, setUTM] = useState(null);
  const [rows, setRows] = useState(null);
  const divRef = useRef();
  const toolClass = toolStyles();

  useEffect(() => {
    L.DomEvent.disableClickPropagation(divRef?.current);
    L.DomEvent.disableScrollPropagation(divRef?.current);
  });

  useMapEvent('click', (e) => {
    if (clickMode) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, 15);
    }
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
    <ListItem disableGutters className={toolClass.listItem}>
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

      <ListItemButton
        ref={divRef}
        onClick={() => setClickMode(!clickMode)}
        style={{
          backgroundColor: clickMode ? '#006ee6' : null,
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
      {geoPoint && clickMode && (
        <GeoJSON data={geoPoint} key={Math.random()}>
          <GeneratePopup
            utmRows={rows}
            map={map}
            lat={position.lat}
            lng={position.lng}
            setPoiMarker={setPoiMarker}
            setActivityGeo={setActivityGeo}
            setClickMode={setClickMode}
          />
        </GeoJSON>
      )}
    </ListItem>
  );
}

// Circle Icon: <div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
// Binoculars: <div>Icons made by <a href="" title="Victoruler">Victoruler</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
export { SetPointOnClick };
