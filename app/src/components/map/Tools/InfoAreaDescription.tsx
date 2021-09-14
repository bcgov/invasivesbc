import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Button,
  IconButton,
  TableBody,
  TableContainer,
  Tooltip,
  Typography
} from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import FolderIcon from '@material-ui/icons/Folder';
import { useMapEvent, GeoJSON, Popup } from 'react-leaflet';
import { utm_zone } from './DisplayPosition';
import { toolStyles } from './Helpers/ToolBtnStyles';
import { ThemeContext } from 'contexts/themeContext';
import { createDataUTM, RenderTablePosition, StyledTableCell, StyledTableRow } from './Helpers/StyledTable';

const GeneratePopup = ({ rows, map }) => {
  const popupElRef = useRef(null);
  const [section, setSection] = useState('position');

  const hideElement = () => {
    if (!popupElRef?.current || !map) return;
    map.closePopup();
  };

  const handleChange = (event: React.ChangeEvent<{}>, newSection: string) => {
    setSection(newSection);
  };

  return (
    <Popup ref={popupElRef} autoClose={false} closeOnClick={false} closeButton={false}>
      <TableContainer>
        {section == 'position' && <RenderTablePosition rows={rows} />}
        {section == 'records' && (
          <TableBody>
            <StyledTableRow>
              <StyledTableCell>This</StyledTableCell>
              <StyledTableCell>Guy</StyledTableCell>
            </StyledTableRow>
          </TableBody>
        )}
      </TableContainer>
      <BottomNavigation value={section} onChange={handleChange}>
        <BottomNavigationAction value="position" icon={<LocationOnIcon />} />
        <BottomNavigationAction value="records" icon={<FolderIcon />} />
      </BottomNavigation>
      <Button onClick={hideElement}>Close</Button>
    </Popup>
  );
};

function SetViewOnClick({ map }: any, { animateRef }: any) {
  const [position, setPosition] = useState(map?.getCenter());
  const [geoPT, setGeoPT] = useState(null);
  const [utm, setUTM] = useState(null);
  const [rows, setRows] = useState(null);
  const themeContext = useContext(ThemeContext);
  const toolClass = toolStyles();

  const generateGeo = () => {
    if (position) {
      setGeoPT({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [position?.lng, position?.lat]
            }
          }
        ]
      });
    }
  };

  useMapEvent('click', (e) => {
    setPosition(e.latlng);
  });

  useEffect(() => {
    if (isFinite(position?.lng) && isFinite(position?.lat)) {
      setUTM(utm_zone(position?.lng as number, position?.lat as number));
      generateGeo();
    }
  }, [position]);

  useEffect(() => {
    if (utm) {
      setRows([createDataUTM('UTM', utm[0]), createDataUTM('Northing', utm[2]), createDataUTM('Easting', utm[1])]);
    }
  }, [utm]);

  /* useEffect Check
  useEffect(() => {
    console.dir(geoPT?.features);
  }, [geoPT]); */

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
        <GeoJSON data={geoPT} key={Math.random()}>
          <GeneratePopup rows={rows} map={map} />
        </GeoJSON>
      )}
    </>
  );
}

export { SetViewOnClick };
