import { IconButton, Tooltip, Typography } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import React, { useState, useCallback, useEffect, useContext } from 'react';
import { useMapEvent, GeoJSON } from 'react-leaflet';
import { utm_zone } from './DisplayPosition';
import { toolStyles } from './ToolBtnStyles';
import { ThemeContext } from 'contexts/themeContext';

function SetViewOnClick({ map }: any, { animateRef }: any) {
  const [position, setPosition] = useState(map?.getCenter());
  const [geoPT, setGeoPT] = useState(null);
  const [utm, setUTM] = useState(null);
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

  const generatePopup = () => {};

  useMapEvent('click', (e) => {
    setPosition(e.latlng);
  });

  useEffect(() => {
    if (isFinite(position?.lng) && isFinite(position?.lat)) {
      setUTM(utm_zone(position?.lng as number, position?.lat as number));
      generateGeo();
    }
  }, [position]);

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
                <Typography>UTM Easting {utm[1]}</Typography>{' '}
              </>
            )
          }>
          <IconButton className={toolClass.toolBtnCircle}>
            <InfoIcon className={themeContext.themeType ? toolClass.toolIconDark : toolClass.toolIconLight} />
          </IconButton>
        </Tooltip>
      )}
      {/*<GeoJSON data={geoPT} key={Math.random()} />*/}
    </>
  );
}

export { SetViewOnClick };
