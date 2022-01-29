import { IconButton, Typography } from '@mui/material';
import HdIcon from '@mui/icons-material/Hd';
import SdIcon from '@mui/icons-material/Sd';
import { ThemeContext } from 'utils/CustomThemeProvider';
import L from 'leaflet';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { toolStyles } from '../../Helpers/ToolStyles';

export const ZoomControl = (props) => {
  const LOW_RES = 17;
  const HIGH_RES = 21;
  const toolClass = toolStyles();
  const themeContext = useContext(ThemeContext);
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
    <>
      <IconButton
        //todo add this attribution:
        //<div>Icons made by <a href="https://www.flaticon.com/authors/wahya" title="wahya">wahya</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
        ref={divRef}
        className={themeContext.themeType ? toolClass.toolBtnDark : toolClass.toolBtnLight}
        aria-label="toggle max zoom resolution"
        onClick={toggle}>
        {isHighRes ? <HdIcon fontSize={'large'} /> : <SdIcon fontSize={'large'} />}
        <Typography className={toolClass.Font}>{isHighRes ? 'High Def' : 'Low Def'}</Typography>
      </IconButton>
    </>
  );
};

export default ZoomControl;
