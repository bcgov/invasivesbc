import { Grid, IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import L from 'leaflet';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { toolStyles } from './Helpers/ToolStyles';

export const ToggleDisplayButtons = (props) => {
  //const history = useHistory();
  const toolClass = toolStyles();

  // Is this needed? Copied from DisplayPosition
  const divRef = useRef(null);

  // initial setup & events to block:
  useEffect(() => {
    L.DomEvent.disableClickPropagation(divRef?.current);
    L.DomEvent.disableScrollPropagation(divRef?.current);
  }, []);

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
      <IconButton aria-label="Create Record" onClick={onClick}>
        <AddIcon />
        <Typography className={toolClass.Font}>New Record</Typography>
      </IconButton>
    );
  };

  const RenderWhenMode_Pressed = (props) => {
    const [items, setItems] = useState([
      { type: 'Ob', onClick: null },
      { type: 'Tr', onClick: null },
      { type: 'Mo', onClick: null }
    ]);
    const [index, setIndex] = useState(0);
    return (
      <Grid xs={5} container className={toolClass.toolBtnMultiStageMenu}>
        <Grid item className={toolClass.toolBtnMultiStageMenuItem}>
          <IconButton aria-label="Previous choice" onClick={() => setIndex(index !== 0 ? index - 1 : items.length - 1)}>
            <KeyboardBackspaceIcon />
          </IconButton>
        </Grid>
        <Grid item className={toolClass.toolBtnMultiStageMenuItem}>
          <IconButton aria-label="Create Record" onClick={createOnClick}>
            {items[index].type}
          </IconButton>
        </Grid>
        <Grid item className={toolClass.toolBtnMultiStageMenuItem}>
          <IconButton aria-label="Next Choice" onClick={() => setIndex(index !== items.length - 1 ? index + 1 : 0)}>
            <ArrowRightAltIcon />
          </IconButton>
        </Grid>
        <Grid item className={toolClass.toolBtnMultiStageMenuItem}>
          <IconButton
            aria-label="Cancel"
            onClick={() => {
              setMode('NOT_PRESSED');
            }}>
            <CancelPresentationIcon />
          </IconButton>
        </Grid>
      </Grid>
    );
  };

  return (
    <div style={{ width: '100%' }} ref={divRef}>
      {
        {
          NOT_PRESSED: <RenderWhenMode_NotPressed />,
          PRESSED: <RenderWhenMode_Pressed />
        }[mode]
      }
    </div>
  );
};

export default ToggleDisplayButtons;
