import { IconButton, Tooltip } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import React, { useState, useCallback, useEffect } from 'react';
import { useMapEvent } from 'react-leaflet';
import { utm_zone } from './DisplayPosition';
import { toolStyles } from './ToolBtnStyles';

function SetViewOnClick({ map }: any, { animateRef }: any) {
  const [position, setPosition] = useState(map?.getCenter());
  const [utm, setUTM] = useState(null);
  const toolClass = toolStyles();
  var strLong = position?.lng.toFixed(4).toString();
  var strLat = position?.lat.toFixed(4).toString();
  var long = parseFloat(strLong);
  var lat = parseFloat(strLat);
  map = useMapEvent('click', (e) => {
    map.setView(e.latlng, map.getZoom(), {
      animate: animateRef?.current || false
    });
  });

  const onMove = useCallback(() => {
    setPosition(map.getCenter());
  }, [map]);

  useEffect(() => {
    map.on('move', onMove);
    return () => {
      map.off('move', onMove);
    };
  }, [map, onMove]);

  useEffect(() => {
    if (isFinite(long) && isFinite(lat)) {
      setUTM(utm_zone(long, lat));
    }
    console.log(utm);
  }, [position]);

  return (
    <Tooltip disableFocusListener classes={{ tooltip: toolClass.tooltipWidth }} title={utm ? <p>{utm}</p> : null}>
      <IconButton>
        <InfoIcon />
      </IconButton>
    </Tooltip>
  );
}

export { SetViewOnClick };
