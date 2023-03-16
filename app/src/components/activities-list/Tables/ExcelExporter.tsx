import { Button, MenuItem, Select } from '@mui/material';
import React, { useState } from 'react';
import GridOnIcon from '@mui/icons-material/GridOn';
import { useDispatch, useSelector } from 'react-redux';
import { RECORD_SET_TO_EXCEL_REQUEST } from 'state/actions';
import { selectUserSettings } from 'state/reducers/userSettings';

const ExcelExporter = (props) => {
  const dispatch = useDispatch();
  const userSettingsState = useSelector(selectUserSettings);
  const setType = userSettingsState?.recordSets[props.setName]?.recordSetType;
  const [selection, setSelection] = useState(setType === 'POI'? 'planning_extract': 'terrestrial_plant_observation')

  let items;
  if (setType === 'POI') {
    items =  [<MenuItem value={'planning_extract'}>Planning Extract</MenuItem>]
  }
  else
  {
    items =  [<MenuItem value={'terrestrial_plant_observation'}>Terrestiral Plant Observation Extract</MenuItem>,<MenuItem value={'aquatic_plant_observation'}>Aquatic Plant Observation Extract</MenuItem>]
  }

  return (
    <>
      <Button
        onClick={() =>
          dispatch({
            type: RECORD_SET_TO_EXCEL_REQUEST,
            payload: {
              id: props.setName,
              CSVType: selection
            }
          })
        }
        sx={{ mr: 1, ml: 'auto' }}
        size={'small'}
        variant="contained">
        <GridOnIcon></GridOnIcon>
      </Button>
      <Select
         value={selection}
          onChange={(e) => {
            setSelection(e.target.value)
          }}>
        {...items}
      </Select>
    </>
  );
};

export default ExcelExporter;
