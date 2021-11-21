import { Grid, IconButton, Typography } from '@material-ui/core';
import React, { useContext, useEffect, useState, useRef } from 'react';
import { toolStyles } from '../../Helpers/ToolStyles';
import L from 'leaflet';
import { ThemeContext } from 'contexts/themeContext';
import CreateIcon from '@mui/icons-material/Create';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import TouchAppIcon from '@mui/icons-material/TouchApp';

//great for plants vs animals:
import GrassIcon from '@mui/icons-material/Grass';
import PetsIcon from '@mui/icons-material/Pets';

export const SelectOrEdit = (props) => {
  //const history = useHistory();
  //const { userInfo } = useContext(AuthStateContext); // style
  const toolClass = toolStyles();
  const themeContext = useContext(ThemeContext);

  // Is this needed? Copied from DisplayPosition
  const divRef = useRef(null);

  // initial setup & events to block:
  useEffect(() => {
    L.DomEvent.disableClickPropagation(divRef?.current);
    L.DomEvent.disableScrollPropagation(divRef?.current);
  });

  const createOnClick = async () => {
    console.log('create record');
  };

  //
  /* ref for whatever helper makes records:
    setMode('PRESSED');

    const type = ActivityType.Observation;
    const subtype = ActivitySubtype.Observation_PlantTerrestrial;
    const dbActivity = generateDBActivityPayload({}, null, type, subtype);
    dbActivity.created_by = userInfo?.preferred_username;
    await dataAccess.createActivity(dbActivity, databaseContext);

    await dataAccess.setAppState({ activeActivity: dbActivity.activity_id }, databaseContext);
    setTimeout(() => {
      history.push({ pathname: `/home/activity` });
    }, 500);
  };
    */
  // can be replaced with a menu (later):

  const [mode, setMode] = useState('NOT_PRESSED');

  const RenderWhenMode_NotPressed = (props) => {
    const onClick = async () => {
      setMode('PRESSED');
    };
    return (
      <IconButton
        className={themeContext.themeType ? toolClass.toolBtnDark : toolClass.toolBtnLight}
        aria-label="Select Record"
        onClick={onClick}>
        <TouchAppIcon />
        <Typography className={toolClass.Font}>Select Record</Typography>
      </IconButton>
    );
  };

  const RenderWhenMode_Pressed = (props) => {
    const onClick = async () => {
      setMode('NOT_PRESSED');
    };
    return (
      <IconButton
        className={themeContext.themeType ? toolClass.toolBtnDark : toolClass.toolBtnLight}
        aria-label="Edit Record"
        onClick={onClick}>
        <CreateIcon />
        <Typography className={toolClass.Font}>Edit Record</Typography>
      </IconButton>
    );
  };

  return (
    <div ref={divRef}>
      {
        {
          NOT_PRESSED: <RenderWhenMode_NotPressed />,
          PRESSED: <RenderWhenMode_Pressed />
        }[mode]
      }
    </div>
  );
};

export default SelectOrEdit;
