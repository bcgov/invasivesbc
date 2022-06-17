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
  TableContainer,
  Typography
} from '@mui/material';
import AdjustIcon from '@mui/icons-material/Adjust';
import FolderIcon from '@mui/icons-material/Folder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
// Removed Temporarily until we figure out databc Table:
// import StorageIcon from '@mui/icons-material/Storage';
import * as turf from '@turf/helpers';
import buffer from '@turf/buffer';
import { ThemeContext } from 'utils/CustomThemeProvider';
import L, { DomEvent } from 'leaflet';
import React, { useContext, useEffect, useRef, useState } from 'react';
// Leaflet and React-Leaflet
import { GeoJSON, Marker, Popup, useMap, useMapEvent } from 'react-leaflet';
import binoculars from '../../../Icons/binoculars.png';
import {
  createDataUTM,
  RenderTableActivity,
  // Removed Temporarily until we figure out databc Table:
  // RenderTableDataBC,
  RenderTablePOI,
  RenderTablePosition
} from '../../Helpers/StyledTable';
import { toolStyles } from '../../Helpers/ToolStyles';
// App Imports
import { calc_utm } from '../Nav/DisplayPosition';
import { polygon } from '@turf/helpers';
import center from '@turf/center';

export const generateGeo = (lat, lng, { setGeoPoint }) => {
  if (lat && lng) {
    var point = turf.point([lng, lat]);
    var buffer2 = buffer(point, 50, { units: 'meters' });
    setGeoPoint(buffer2);
  }
};

export const GeneratePopup = (props) => {
  const { bufferedGeo, onCloseCallback } = props;
  const themeContext = useContext(ThemeContext);
  const { themeType } = themeContext;
  const theme = themeType ? 'leaflet-popup-content-wrapper-dark' : 'leaflet-popup-content-wrapper-light';
  const [section, setSection] = useState('position');
  const map = useMap();
  const position = center(bufferedGeo).geometry.coordinates;
  const popupElRef = useRef(null);

  // const [showRadius, setShowRadius] = useState(false); // NOSONAR
  // (NOSONAR)'d Temporarily until we figure out databc Table:
  // const [databc, setDataBC] = useState(null); // NOSONAR
  // const [radius, setRadius] = useState(3);

  const utmResult = calc_utm(position[0], position[1]);
  const utmRows = [
    createDataUTM('Zone', utmResult[0]),
    createDataUTM('Easting', utmResult[1]),
    createDataUTM('Northing', utmResult[2])
  ];

  useEffect(() => {
    if (popupElRef?.current && position.length > 0) {
      DomEvent.disableClickPropagation(popupElRef?.current);
      DomEvent.disableScrollPropagation(popupElRef?.current);

      //crash here      popupElRef?.current.openOn(map)
    }
  }, []);

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

  const hideElement = () => {
    // if (!popupElRef?.current || !map) return;
    map.closePopup();
    if (onCloseCallback) {
      setTimeout(() => {
        onCloseCallback();
      }, 500);
    }
  };

  const handleChange = (event: React.ChangeEvent<{}>, newSection: string) => {
    setSection(newSection);
  };

  return (
    <>
      <Popup className={theme} autoClose={false} closeOnClick={true} closeButton={false}>
        <div>
          <TableContainer>
            {section == 'position' && <RenderTablePosition rows={utmRows} />}
            {section == 'invasivesbc' && <RenderTableActivity bufferedGeo={bufferedGeo} map={map} />}
            {/*section == 'databc' && <RenderTableDataBC rows={databc} />*/}
            {section == 'iapp' && <RenderTablePOI bufferedGeo={bufferedGeo} map={map} />}
          </TableContainer>
          <Grid container>
            <BottomNavigation
              style={{ backgroundColor: themeType ? '#333' : null, width: 500 }}
              value={section}
              onChange={handleChange}>
              <BottomNavigationAction value="position" label="Position" icon={<LocationOnIcon />} />
              <BottomNavigationAction value="invasivesbc" label="InvasivesBC" icon={<FolderIcon />} />
              {/*<BottomNavigationAction value="databc" label="Data BC" icon={<StorageIcon />} />*/}
              <BottomNavigationAction value="iapp" label="IAPP" icon={<AdjustIcon />} />
            </BottomNavigation>
          </Grid>
          <Grid container>
            {/* <Stack direction="row" spacing={1} style={{ width: 500 }} alignItems="center">
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
            </Stack> */}
            <Grid item>
              <Button onClick={hideElement}>Close</Button>
            </Grid>
          </Grid>
        </div>
      </Popup>
    </>
  );
};

enum workflowStepEnum {
  NOT_STARTED = 'NOT_STARTED',
  BOX_DRAW_START = 'BOX_DRAW_START',
  BOX_DRAW_DONE = 'BOX_DRAW_DONE'
}

function SetPointOnClick() {
  const [workflowStep, setWorkflowStep] = React.useState(workflowStepEnum.NOT_STARTED);
  const [userGeo, setUserGeo] = React.useState(null);
  const map = useMap();
  const toolClass = toolStyles();
  const themeContext = React.useContext(ThemeContext);
  const divRef = React.useRef();
  const markerRef = useRef(null);
  const [coolguy, setCoolGuy] = useState(null);

  useEffect(() => {
    console.log('workflow step', workflowStep);
  }, [workflowStep]);

  useEffect(() => {
    if (userGeo !== null) {
      setWorkflowStep(workflowStepEnum.BOX_DRAW_DONE);
    }
  }, [userGeo]);

  useEffect(() => {
    L.DomEvent.disableClickPropagation(divRef?.current);
    L.DomEvent.disableScrollPropagation(divRef?.current);
    const aCoolguy = new (L as any).Draw.Rectangle(map);
    setCoolGuy(aCoolguy);
  }, []);

  useEffect(() => {
    const marker = markerRef.current;
    switch (workflowStep) {
      case workflowStepEnum.BOX_DRAW_START:
        if (!userGeo) {
          coolguy.enable();
        }

        break;
      case workflowStepEnum.BOX_DRAW_DONE:
        if (marker) {
          marker.openPopup();
        }
        break;
      case workflowStepEnum.NOT_STARTED:
        setUserGeo(null);
        if (marker) {
          marker.closePopup();
        }
        break;
    }
  });

  const BoxDrawStartOnClick = () => {
    switch (workflowStep) {
      case workflowStepEnum.NOT_STARTED:
        setWorkflowStep(workflowStepEnum.BOX_DRAW_START);
        break;
      case workflowStepEnum.BOX_DRAW_START:
        setWorkflowStep(workflowStepEnum.NOT_STARTED);
        break;
      case workflowStepEnum.BOX_DRAW_DONE:
        setWorkflowStep(workflowStepEnum.NOT_STARTED);
        break;
    }
  };

  const boxDrawDoneCallback = (layer) => {
    const geo = layer;
    setUserGeo(geo);
  };

  useMapEvent('draw:created' as any, (e) => {
    boxDrawDoneCallback(e.layer.toGeoJSON());
    console.log(e);
    coolguy.disable();
  });

  return (
    <ListItem disableGutters className={toolClass.listItem}>
      <ListItemButton
        onClick={BoxDrawStartOnClick}
        ref={divRef}
        style={{
          backgroundColor:
            workflowStep === workflowStepEnum.BOX_DRAW_START || workflowStep === workflowStepEnum.BOX_DRAW_DONE
              ? 'lightgray'
              : null,
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
      {userGeo && workflowStep === workflowStepEnum.BOX_DRAW_DONE ? (
        <Marker
          ref={markerRef}
          position={{ lat: center(userGeo).geometry.coordinates[1], lng: center(userGeo).geometry.coordinates[0] }}>
          <GeneratePopup
            onCloseCallback={() => {
              setWorkflowStep(workflowStepEnum.NOT_STARTED);
              setUserGeo(null);
            }}
            bufferedGeo={userGeo}
          />
        </Marker>
      ) : (
        <></>
      )}
      {/*drawnGeo && (
        <GeoJSON style={() => drawnOpacity} data={drawnGeo} key={drawnGeoKey}>
          {!clickMode && <GeneratePopup map={map} bufferedGeo={drawnGeo} setClickMode={setClickMode} />}
        </GeoJSON>
      )*/}
    </ListItem>
  );
}

// Circle Icon: <div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
// Binoculars: <div>Icons made by <a href="" title="Victoruler">Victoruler</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
export { SetPointOnClick };
