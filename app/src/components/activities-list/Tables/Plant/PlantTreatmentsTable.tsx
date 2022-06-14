import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDataAccess } from 'hooks/useDataAccess';
import React, { useContext, useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { CircularProgress } from '@mui/material';
import { activites_default_headers, mapActivitiesToDataGridRows } from '../ActivityTablesHelpers';
import { useSelector } from '../../../../state/utilities/use_selector';
import { selectAuth } from '../../../../state/reducers/auth';

const PlantTreatmentsTable = () => {
  const dataAccess = useDataAccess();
  const [activities, setActivities] = useState(undefined);
  const [accordionExpanded, setAccordionExpanded] = useState(true);

  const handleAccordionExpand = () => {
    setAccordionExpanded((prev) => !prev);
  };

  const { displayName, roles } = useSelector(selectAuth);

  const getActivities = async () => {
    const act_list = await dataAccess.getActivities({
      created_by: displayName,
      user_roles: roles,
      activity_type: ['Monitoring']
    });
    setActivities(act_list);
  };

  useEffect(() => {
    getActivities();
  }, []);

  useEffect(() => {
    console.log(activities);
  }, [activities]);

  return (
    <Accordion expanded={accordionExpanded} onChange={handleAccordionExpand}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
        <Typography>Treatments</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {!activities ? (
          <CircularProgress />
        ) : (
          <DataGrid
            rows={mapActivitiesToDataGridRows(activities)}
            columns={activites_default_headers}
            autoHeight
            checkboxSelection
            pageSize={10}
          />
        )}
      </AccordionDetails>
    </Accordion>
  );
};
export default PlantTreatmentsTable;
