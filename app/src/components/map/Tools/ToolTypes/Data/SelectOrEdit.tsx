import { IconButton, Typography } from '@mui/material';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import { ThemeContext } from 'contexts/themeContext';
import L from 'leaflet';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { toolStyles } from '../../Helpers/ToolStyles';

export const SelectOrEdit = (props) => {
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

  enum modes {
    NOT_PRESSED = 'NOT_PRESSED',
    WAITING_FOR_SELECT_OR_CANCEL = 'WAITING_FOR_SELECT_OR_CANCEL',
    IS_EDITING = 'IS_EDITING'
  }

  const [mode, setMode] = useState<modes>(modes.NOT_PRESSED);

  const RenderWhenMode_NotPressed = (props) => {
    const onClick = async () => {
      setMode(modes.WAITING_FOR_SELECT_OR_CANCEL);
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
      setMode(modes.NOT_PRESSED);
    };
    return (
      <IconButton
        className={themeContext.themeType ? toolClass.toolBtnDark : toolClass.toolBtnLight}
        aria-label="Cancel"
        onClick={onClick}>
        <CancelPresentationIcon />
        <Typography className={toolClass.Font}>Cancel</Typography>
      </IconButton>
    );
  };

  return (
    <div ref={divRef}>
      {
        {
          NOT_PRESSED: <RenderWhenMode_NotPressed />,
          WAITING_FOR_SELECT_OR_CANCEL: <RenderWhenMode_Pressed />
        }[mode]
      }
    </div>
  );
};

export default SelectOrEdit;
