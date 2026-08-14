import { Accordion, Button, MenuItem, Select } from '@mui/material';
import { useMemo, useState } from 'react';
import DownloadIcon from '@mui/icons-material/Download';
import Spinner from 'UI/Reusable/Spinner/Spinner';
import 'UI/Features/Records/ExcelExporter.css';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import { useDispatch, useSelector } from 'utils/use_selector';
import ExportActions from 'state/actions/exports/exportActions';
import { ActivitySubtypes } from 'sharedAPI';
import Alerts from 'state/actions/alerts/Alerts';
import downloadAlertMessages from 'constants/alerts/downloadAlerts';
import HoverTooltip from 'UI/Reusable/HoverTooltip/HoverTooltip';

const iappExportOptions = [
  { value: 'site_selection_extract', label: 'Site Selection Extract' },
  { value: 'survey_extract', label: 'Survey Extract' },
  { value: 'chemical_treatment_extract', label: 'Chemical Treatment Extract' },
  { value: 'mechanical_treatment_extract', label: 'Mechanical Treatment Extract' },
  { value: 'chemical_monitoring_extract', label: 'Chemical Monitoring Extract' },
  { value: 'mechanical_monitoring_extract', label: 'Mechanical Monitoring Extract' },
  { value: 'biological_treatment_extract', label: 'Biological Treatment Extract' },
  { value: 'biological_monitoring_extract', label: 'Biological Monitoring Extract' },
  { value: 'biological_dispersal_extract', label: 'Biological Dispersal Extract' }
];

/** Ordered by stakeholder request */
const ibcExportOptions = [
  // Observations
  {
    value: ActivitySubtypes.Observation_Plant_Terrestrial,
    label: 'Observation – Plant Terrestrial'
  },
  {
    value: ActivitySubtypes.Observation_Plant_Aquatic,
    label: 'Observation – Plant Aquatic'
  },
  // Treatments
  {
    value: ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial,
    label: 'Treatment – Chemical Terrestrial'
  },
  {
    value: ActivitySubtypes.Treatment_Chemical_Plant_Aquatic,
    label: 'Treatment – Chemical Aquatic'
  },
  {
    value: ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial,
    label: 'Treatment – Mechanical Terrestrial'
  },
  {
    value: ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic,
    label: 'Treatment – Mechanical Aquatic'
  },
  // Monitoring
  {
    value: ActivitySubtypes.Monitoring_Chemical_Plant_Terrestrial_Aquatic,
    label: 'Monitoring – Chemical Treatment'
  },
  {
    value: ActivitySubtypes.Monitoring_Mechanical_Plant_Terrestrial_Aquatic,
    label: 'Monitoring – Mechanical Treatment'
  },
  // Biocontrol
  {
    value: ActivitySubtypes.Biocontrol_Release,
    label: 'Biocontrol – Release'
  },
  {
    value: ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial,
    label: 'Biocontrol – Release Monitoring'
  },
  {
    value: ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial,
    label: 'Biocontrol – Dispersal Monitoring'
  },
  {
    value: ActivitySubtypes.Biocontrol_Collection,
    label: 'Biocontrol – Collection'
  }
];

type PropTypes = {
  setName: string;
};

const ExcelExporter = ({ setName }: PropTypes) => {
  const handleRequest = () => {
    if (setType === 'IAPP') {
      dispatch(ExportActions.requestExcel({ setId: setName, csvType: selection }));
    } else if (setType === 'Activity') {
      dispatch(ExportActions.requestActivityCSV({ setId: setName, csvType: selection }));
    }
    dispatch(Alerts.create(downloadAlertMessages.csvDownloadStarted));
  };

  const dispatch = useDispatch();
  const linkToCSV = useSelector((state) => state.Map.linkToCSV);
  const recordSetForCSV = useSelector((state) => state.Map.recordSetForCSV);
  const CanTriggerCSV = useSelector((state) => state.Map.CanTriggerCSV);
  const setType = useSelector((state) => state.UserSettings.recordSets[setName]?.recordSetType);
  const [selection, setSelection] = useState(
    setType === 'IAPP' ? 'site_selection_extract' : ActivitySubtypes.Observation_Plant_Terrestrial
  );

  const items = useMemo(() => {
    if (setType === 'IAPP') {
      return iappExportOptions;
    }
    return ibcExportOptions;
  }, [setType]);

  return (
    <div className="excelExporter">
      <Accordion>
        <AccordionSummary className="accordionSummary" expandIcon={<i className="material-icons">expand_more</i>}>
          Click here for CSV export
        </AccordionSummary>
        <AccordionDetails className="accordionDetails">
          <HoverTooltip tooltipText="CSV Export">
            {linkToCSV && setName === recordSetForCSV ? (
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
              <div className="csv-spinner">
                {CanTriggerCSV ? (
                  <Button
                    disabled={!CanTriggerCSV}
                    onClick={handleRequest}
                    sx={{ mr: 1, ml: 'auto' }}
                    size={'small'}
                    variant="contained"
                  >
                    Generate CSV
                    <DownloadIcon />
                  </Button>
                ) : (
                  <Spinner />
                )}
              </div>
            )}
          </HoverTooltip>
          CSV Summary Type:
          <Select
            className="excel-exporter-select"
            value={selection}
            onChange={(e) => {
              setSelection(e.target.value);
            }}
          >
            {items.map((o, i) => (
              <MenuItem
                sx={{
                  backgroundColor: i % 2 === 0 ? 'var(--even-list-item-bg-color)' : 'var(--odd-list-item-bg-color)'
                }}
                value={o.value}
              >
                {o.label}
              </MenuItem>
            ))}
          </Select>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default ExcelExporter;
