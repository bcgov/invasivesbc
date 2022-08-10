import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDataAccess } from 'hooks/useDataAccess';
import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { CircularProgress } from '@mui/material';
import { ActivitiesDefaultHeaders, MapActivitiesToDataGridRows } from '../ActivityTablesHelpers';
import { useSelector } from '../../../../state/utilities/use_selector';
import { selectAuth } from '../../../../state/reducers/auth';
import { selectConfiguration } from 'state/reducers/configuration';

const PlantBiocontrolTable = () => {
  const dataAccess = useDataAccess();
  const [activities, setActivities] = useState(undefined);
  const [accordionExpanded, setAccordionExpanded] = useState(true);
  const { displayName, accessRoles } = useSelector(selectAuth);
  const { MOBILE } = useSelector(selectConfiguration);

  const handleAccordionExpand = () => {
    setAccordionExpanded((prev) => !prev);
  };

  const getActivities = async () => {
    const act_list = await dataAccess.getActivities({
      created_by: displayName,
      user_roles: accessRoles,
      activity_type: ['Biocontrol']
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
        <Typography>Biocontrol</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {!activities ? (
          <CircularProgress />
        ) : (
          <DataGrid
            rows={MapActivitiesToDataGridRows(activities, MOBILE)}
            columns={ActivitiesDefaultHeaders()}
            autoHeight
            checkboxSelection
            pageSize={10}
          />
        )}
      </AccordionDetails>
    </Accordion>
  );
};
export default PlantBiocontrolTable;
