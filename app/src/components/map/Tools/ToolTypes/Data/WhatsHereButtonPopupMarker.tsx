import AdjustIcon from '@mui/icons-material/Adjust';
import FolderIcon from '@mui/icons-material/Folder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { BottomNavigation, BottomNavigationAction, Button, Grid, TableContainer } from '@mui/material';
// Removed Temporarily until we figure out databc Table:
// import StorageIcon from '@mui/icons-material/Storage';
import center from '@turf/center';
import L from 'leaflet';
import React, { useEffect, useRef, useState } from 'react';
import { Marker, Popup, useMap, useMapEvent } from 'react-leaflet';
import { useSelector } from 'react-redux';
import { selectUserSettings } from 'state/reducers/userSettings';
import {
  createDataUTM,
  RenderTableActivity,
  // Removed Temporarily until we figure out databc Table:
  // RenderTableDataBC,
  RenderTablePOI,
  RenderTablePosition
} from '../../Helpers/StyledTable';
import { toolStyles } from '../../Helpers/ToolStyles';
import { calc_utm } from '../Nav/DisplayPosition';

export const GeneratePopup = (props) => {
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
    setSection('position');
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
      <Popup className={theme} autoClose={false} closeOnClick={true} closeButton={false}>
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
  const divRef = React.useRef();
  const markerRef = useRef(null);
  const [coolguy, setCoolGuy] = useState(null);
  const { darkTheme } = useSelector(selectUserSettings);

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
          setTimeout(() => {
            marker.openPopup();
          }, 250);
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
    const geo = {
      type: 'FeatureCollection',
      features: [layer]
    };
    setUserGeo(geo);
  };

  useMapEvent('draw:created' as any, (e) => {
    boxDrawDoneCallback(e.layer.toGeoJSON());
    coolguy.disable();
  });

  return (
    <>
      {userGeo && workflowStep === workflowStepEnum.BOX_DRAW_DONE && (
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
      )}
    </>
  );
}

// Circle Icon: <div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
// Binoculars: <div>Icons made by <a href="" title="Victoruler">Victoruler</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
export { SetPointOnClick };
