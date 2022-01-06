import { IconButton, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import L from 'leaflet';
import React, { useEffect, useRef, useState } from 'react';
import { toolStyles } from '../../Helpers/ToolStyles';
import CropIcon from '@mui/icons-material/Crop';
import { ListItemButton } from '@mui/material';

export const MultiSelectOrEdit = (props) => {
  const toolClass = toolStyles();

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
      <ListItem disableGutters className={toolClass.listItem}>
        <ListItemButton aria-label="Multi Select" onClick={onClick}>
          <ListItemIcon>
            <CropIcon />
          </ListItemIcon>
          <ListItemText>
            <Typography className={toolClass.Font}>Multi-select</Typography>
          </ListItemText>
        </ListItemButton>
      </ListItem>
    );
  };

  const RenderWhenMode_Pressed = (props) => {
    const onClick = async () => {
      setMode(modes.NOT_PRESSED);
    };
    return (
      <IconButton aria-label="Cancel" onClick={onClick}>
        <CropIcon />
        <Typography className={toolClass.Font}>Cancel</Typography>
      </IconButton>
    );
  };

  return (
    <div style={{ width: '100%' }} ref={divRef}>
      {
        {
          NOT_PRESSED: <RenderWhenMode_NotPressed />,
          WAITING_FOR_SELECT_OR_CANCEL: <RenderWhenMode_Pressed />
        }[mode]
      }
    </div>
  );
};

export default MultiSelectOrEdit;
