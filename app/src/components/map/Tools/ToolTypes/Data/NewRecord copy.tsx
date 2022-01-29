import { FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { ThemeContext } from 'utils/CustomThemeProvider';
import L from 'leaflet';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { toolStyles } from '../../Helpers/ToolStyles';

export const NewRecord = (props) => {
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

  const RecordTypeSelector = (props) => {
    enum recordCategoryTypes {
      animal = 'animal',
      plant = 'plant',
      other = 'other'
    }
    const [recordCategory, setRecordCategory] = useState(recordCategoryTypes.plant);

    return (
      <Grid item xs={3} className={toolClass.toolBtnMultiStageMenuItem}>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Record Category</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={recordCategory}
            label="Record Category"
            onChange={(e) => {
              setRecordCategory(e.target.value as recordCategoryTypes);
            }}>
            <MenuItem value={recordCategoryTypes.plant}>Plant</MenuItem>
            <MenuItem value={recordCategoryTypes.animal}>Animal</MenuItem>
            <MenuItem value={recordCategoryTypes.other}>Other</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    );
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

  const MainButton = (props) => {
    return (
      <IconButton
        className={themeContext.themeType ? toolClass.toolBtnDark : toolClass.toolBtnLight}
        aria-label="Create Record"
        disabled={mode !== 'NOT_PRESSED'}
        onClick={props.onClick}>
        <AddIcon />
        <Typography className={toolClass.Font}>New Record</Typography>
      </IconButton>
    );
  };

  const RenderWhenMode_NotPressed = (props) => {
    const onClick = async () => {
      setMode('PRESSED');
    };
    return <MainButton onClick={onClick}></MainButton>;
  };

  const RenderWhenMode_Pressed = (props) => {
    const [items, setItems] = useState([
      { type: 'Ob', onClick: null },
      { type: 'Tr', onClick: null },
      { type: 'Mo', onClick: null }
    ]);
    const [index, setIndex] = useState(0);
    return (
      <>
        <Grid xs={12} container className={toolClass.toolBtnMultiStageMenu}>
          <Grid item xs={3} className={toolClass.toolBtnMultiStageMenuItem}>
            <IconButton
              className={themeContext.themeType ? toolClass.toolBtnDark : toolClass.toolBtnLight}
              aria-label="Previous choice"
              onClick={() => setIndex(index !== 0 ? index - 1 : items.length - 1)}>
              <KeyboardBackspaceIcon />
            </IconButton>
          </Grid>
          <Grid item xs={3} className={toolClass.toolBtnMultiStageMenuItem}>
            <IconButton
              className={themeContext.themeType ? toolClass.toolBtnDark : toolClass.toolBtnLight}
              aria-label="Create Record"
              onClick={createOnClick}>
              {items[index].type}
            </IconButton>
          </Grid>
          <Grid item xs={3} className={toolClass.toolBtnMultiStageMenuItem}>
            <IconButton
              className={themeContext.themeType ? toolClass.toolBtnDark : toolClass.toolBtnLight}
              aria-label="Next Choice"
              onClick={() => setIndex(index !== items.length - 1 ? index + 1 : 0)}>
              <ArrowRightAltIcon />
            </IconButton>
          </Grid>
          <Grid item xs={3} className={toolClass.toolBtnMultiStageMenuItem}>
            <IconButton
              className={themeContext.themeType ? toolClass.toolBtnDark : toolClass.toolBtnLight}
              aria-label="Cancel"
              onClick={() => {
                setMode('NOT_PRESSED');
              }}>
              <CancelPresentationIcon />
              <Typography className={toolClass.Font}>Cancel</Typography>
            </IconButton>
          </Grid>
          <Grid item xs={3} className={toolClass.toolBtnMultiStageMenuItem}>
            <MainButton />
          </Grid>
        </Grid>
      </>
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

export default NewRecord;
