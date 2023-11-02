import { Button, MenuItem, Select, Tooltip } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CSV_LINK_CLICKED, RECORD_SET_TO_EXCEL_REQUEST } from 'state/actions';
import { selectUserSettings } from 'state/reducers/userSettings';
import DownloadIcon from '@mui/icons-material/Download';
import { selectMap } from 'state/reducers/map';
import Spinner from 'components/spinner/Spinner';
import "./ExcelExporter.css";

const ExcelExporter = (props) => {
  const dispatch = useDispatch();
  const userSettingsState = useSelector(selectUserSettings);
  const mapState = useSelector(selectMap)
  const setType = userSettingsState?.recordSets[props.setName]?.recordSetType;
  const [selection, setSelection] = useState(
    setType === 'POI' ? 'site_selection_extract' : 'terrestrial_plant_observation'
  );

  let items;
  if (setType === 'POI') {
    items = [
      <MenuItem value={'site_selection_extract'}>Site Selection Extract</MenuItem>,
      <MenuItem value={'survey_extract'}>Survey Extract</MenuItem>,
      <MenuItem value={'chemical_treatment_extract'}>Chemical Treatment Extract</MenuItem>,
      <MenuItem value={'mechanical_treatment_extract'}>Mechanical Treatment Extract</MenuItem>,
      <MenuItem value={'chemical_monitoring_extract'}>Chemical Monitoring Extract</MenuItem>,
      <MenuItem value={'mechanical_monitoring_extract'}>Mechanical Monitoring Extract</MenuItem>,
      <MenuItem value={'biological_treatment_extract'}>Biological Treatment Extract</MenuItem>,
      <MenuItem value={'biological_monitoring_extract'}>Biological Monitoring Extract</MenuItem>,
      <MenuItem value={'biological_dispersal_extract'}>Biological Dispersal Extract</MenuItem>
    ];
  } else {
    items = [
      <MenuItem value={'terrestrial_plant_observation'}>Terrestrial Plant Observation Summary</MenuItem>,
      <MenuItem value={'aquatic_plant_observation'}>Aquatic Plant Observation Summary</MenuItem>,
      <MenuItem value={'terrestrial_chemical_treatment'}>Terrestrial Chemical Treatment Summary</MenuItem>,
      <MenuItem value={'aquatic_chemical_treatment'}>Aquatic Chemical Treatment Summary</MenuItem>,
      <MenuItem value={'terrestrial_mechanical_treatment'}>Terrestrial Mechanical Treatment Summary</MenuItem>,
      <MenuItem value={'biocontrol_release'}>Biocontrol Release Summary</MenuItem>,
      <MenuItem value={'biocontrol_collection'}>Biocontrol Collection Summary</MenuItem>,
      <MenuItem value={'biocontrol_dispersal'}>Biocontrol Dispersal Summary</MenuItem>,
      <MenuItem value={'chemical_treatment_monitoring'}>Chemical Treatment Monitoring Summary</MenuItem>,
      <MenuItem value={'mechanical_treatment_monitoring'}>Mechanical Treatment Monitoring Summary</MenuItem>,
      <MenuItem value={'biocontrol_release_monitoring'}>Biocontrol Release Monitoring Summary</MenuItem>
    ];
  }

  return (
    <>
      <Tooltip title="CSV Export">
        {mapState?.linkToCSV && props.setName === mapState?.recordSetForCSV ?
          <a href={mapState?.linkToCSV} download>
            <Button
              onClick={() =>
                dispatch({
                  type: CSV_LINK_CLICKED
                })
              }
              disabled={mapState?.linkToCSV.length < 1}
              sx={{ mr: 1, ml: 'auto' }}
              size={'small'}
              variant="contained">
              Download CSV
              <DownloadIcon />
            </Button>
          </a>
          :
          <div className='CSV-spinner'>
            {(
              mapState?.CanTriggerCSV ? 
              <Button
              disabled={!mapState?.CanTriggerCSV}
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
                Generate CSV link
                <DownloadIcon />
              </Button>
              : 
              <Spinner></Spinner>
            )}
          </div>
        }
      </Tooltip>
      <Tooltip title="Choose report type" placement="right">
        <Select
          value={selection}
          onChange={(e) => {
            setSelection(e.target.value);
          }}>
          {...items}
        </Select>
      </Tooltip>
    </>
  );
};

export default ExcelExporter;
