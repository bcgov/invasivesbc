import { ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import HdIcon from '@mui/icons-material/Hd';
import SdIcon from '@mui/icons-material/Sd';
import L from 'leaflet';
import React, { useEffect, useRef, useState } from 'react';
import { toolStyles } from '../../Helpers/ToolStyles';

export const ZoomControl = (props) => {
  const LOW_RES = 17;
  const HIGH_RES = 21;
  const toolClass = toolStyles();
  const divRef = useRef(null);

  //block click propogation
  useEffect(() => {
    L.DomEvent.disableClickPropagation(divRef?.current);
    L.DomEvent.disableScrollPropagation(divRef?.current);
  });

  const [isHighRes, setIsHighRes] = useState(false);

  //onclick
  const toggle = () => {
    props.setMapMaxNativeZoom((prevState) => {
      if (prevState === LOW_RES) {
        setIsHighRes(true);
        return HIGH_RES;
      } else {
        setIsHighRes(false);
        return LOW_RES;
      }
    });
  };
  return (
    <ListItem disableGutters className={toolClass.listItem}>
      <ListItemButton
        //todo add this attribution:
        //<div>Icons made by <a href="https://www.flaticon.com/authors/wahya" title="wahya">wahya</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
        ref={divRef}
        aria-label="toggle max zoom resolution"
        onClick={toggle}>
        <ListItemIcon>{isHighRes ? <HdIcon fontSize={'large'} /> : <SdIcon fontSize={'large'} />}</ListItemIcon>
        <ListItemText>
          <Typography className={toolClass.Font}>{isHighRes ? 'High Def' : 'Low Def'}</Typography>
        </ListItemText>
      </ListItemButton>
    </ListItem>
  );
};

export default ZoomControl;
