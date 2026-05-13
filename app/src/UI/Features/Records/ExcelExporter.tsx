import { Accordion, Button, MenuItem, Select, Tooltip } from '@mui/material';
import { useMemo, useState } from 'react';
import DownloadIcon from '@mui/icons-material/Download';
import Spinner from 'UI/Reusable/Spinner/Spinner';
import 'UI/Features/Records/ExcelExporter.css';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import { useDispatch, useSelector } from 'utils/use_selector';
import ExportActions from 'state/actions/exports/exportActions';
import { ActivitySubtypes } from 'sharedAPI';

const ExcelExporter = (props) => {
  const handleRequest = () => {
    if (setType === 'IAPP') {
      dispatch(ExportActions.requestExcel({ setId: props.setName, csvType: selection }));
    } else if (setType === 'Activity') {
      dispatch(ExportActions.requestActivityCSV({ setId: props.setName, csvType: selection }));
    }
  };
  const dispatch = useDispatch();
  const linkToCSV = useSelector((state) => state.Map.linkToCSV);
  const recordSetForCSV = useSelector((state) => state.Map.recordSetForCSV);
  const CanTriggerCSV = useSelector((state) => state.Map.CanTriggerCSV);
  const setType = useSelector((state) => state.UserSettings.recordSets[props.setName]?.recordSetType);
  const [selection, setSelection] = useState(
    setType === 'IAPP' ? 'site_selection_extract' : ActivitySubtypes.Observation_Plant_Terrestrial
  );

  const items = useMemo(() => {
    if (setType === 'IAPP') {
      return [
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
    }
    return [
      <MenuItem value={ActivitySubtypes.Observation_Plant_Terrestrial}>Terrestrial Plant Observation Summary</MenuItem>,
      <MenuItem value={ActivitySubtypes.Observation_Plant_Aquatic}>Aquatic Plant Observation Summary</MenuItem>,
      <MenuItem value={ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial}>
        Terrestrial Chemical Treatment Summary
      </MenuItem>,
      <MenuItem value={ActivitySubtypes.Treatment_Chemical_Plant_Aquatic}>Aquatic Chemical Treatment Summary</MenuItem>,
      <MenuItem value={ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial}>
        Terrestrial Mechanical Treatment Summary
      </MenuItem>,
      <MenuItem value={ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic}>
        Aquatic Mechanical Treatment Summary
      </MenuItem>,
      <MenuItem value={ActivitySubtypes.Biocontrol_Release}>Biocontrol Release Summary</MenuItem>,
      <MenuItem value={ActivitySubtypes.Biocontrol_Collection}>Biocontrol Collection Summary</MenuItem>,
      <MenuItem value={ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial}>
        Biocontrol Dispersal Summary
      </MenuItem>,
      <MenuItem value={ActivitySubtypes.Monitoring_Chemical_Plant_Terrestrial_Aquatic}>
        Chemical Treatment Monitoring Summary
      </MenuItem>,
      <MenuItem value={ActivitySubtypes.Monitoring_Mechanical_Plant_Terrestrial_Aquatic}>
        Mechanical Treatment Monitoring Summary
      </MenuItem>,
      <MenuItem value={ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial}>
        Biocontrol Release Monitoring Summary
      </MenuItem>
    ];
  }, [setType]);

  return (
    <div className="excelExporter">
      <Accordion>
        <AccordionSummary className="accordionSummary" expandIcon={<i className="material-icons">expand_more</i>}>
          Click here for CSV export
        </AccordionSummary>
        <AccordionDetails className="accordionDetails">
          <Tooltip classes={{ tooltip: 'toolTip' }} title="CSV Export">
            {linkToCSV && props.setName === recordSetForCSV ? (
              <a href={linkToCSV} download>
                <Button
                  onClick={() => dispatch(ExportActions.resetCsvUrl())}
                  disabled={linkToCSV.length < 1}
                  sx={{ mr: 1, ml: 'auto' }}
                  size={'small'}
                  variant="contained"
                >
                  Download CSV
                  <DownloadIcon />
                </Button>
              </a>
            ) : (
              <div className="CSV-spinner">
                {CanTriggerCSV ? (
                  <Button
                    disabled={!CanTriggerCSV}
                    onClick={handleRequest}
                    sx={{ mr: 1, ml: 'auto' }}
                    size={'small'}
                    variant="contained"
                  >
                    Generate CSV link
                    <DownloadIcon />
                  </Button>
                ) : (
                  <Spinner></Spinner>
                )}
              </div>
            )}
          </Tooltip>
          <Tooltip classes={{ tooltip: 'toolTip' }} title="Choose report type" placement="right">
            <>
              CSV Type:
              <Select
                className="excel-exporter-select"
                value={selection}
                onChange={(e) => {
                  setSelection(e.target.value);
                }}
              >
                {...items}
              </Select>
            </>
          </Tooltip>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default ExcelExporter;
