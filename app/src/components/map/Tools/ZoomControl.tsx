import { Button, IconButton } from '@mui/material';
import React, { useContext, useEffect, useRef } from 'react';
import { toolStyles } from './Helpers/ToolBtnStyles';
import L from 'leaflet';
import { ThemeContext } from 'contexts/themeContext';
import HdIcon from '@mui/icons-material/Hd';
import SdIcon from '@mui/icons-material/Sd';

export const ZoomControl = (props) => {
  const LOW_RES = 17;
  const HIGH_RES = 25;
  const toolClass = toolStyles();
  const themeContext = useContext(ThemeContext);
  const divRef = useRef(null);

  //block click propogation
  useEffect(() => {
    L.DomEvent.disableClickPropagation(divRef?.current);
    L.DomEvent.disableScrollPropagation(divRef?.current);
  });

  //onclick
  const toggle = () => {
    props.setMapMaxNativeZoom((prevState) => {
      if (prevState === LOW_RES) {
        return HIGH_RES;
      } else {
        return LOW_RES;
      }
    });
  };
  return (
    <>
      <IconButton
        //todo add this attribution:
        //<div>Icons made by <a href="https://www.flaticon.com/authors/wahya" title="wahya">wahya</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
        ref={divRef}
        className={themeContext.themeType ? toolClass.toolBtnDark : toolClass.toolBtnLight}
        aria-label="toggle max zoom resolution"
        onClick={toggle}>
        {props.maxNativeZoom === HIGH_RES ? <HdIcon /> : <SdIcon />}
      </IconButton>
    </>
  );
};

export default ZoomControl;
