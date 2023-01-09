import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDataAccess } from 'hooks/useDataAccess';
import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { CircularProgress, Accordion, AccordionSummary, AccoordionDetails, Typography} from '@mui/material';
import { ActivitiesDefaultHeaders, MapActivitiesToDataGridRows } from '../ActivityTablesHelpers';
import { useSelector } from '../../../../state/utilities/use_selector';
import { selectAuth } from '../../../../state/reducers/auth';
import { selectConfiguration } from 'state/reducers/configuration';

const PlantTransectsTable = () => {
  const dataAccess = useDataAccess();
  const [activities, setActivities] = useState(undefined);
  const [accordionExpanded, setAccordionExpanded] = useState(true);
  const { displayName, roles } = useSelector(selectAuth);
  const { MOBILE } = useSelector(selectConfiguration);

  const handleAccordionExpand = () => {
    setAccordionExpanded((prev) => !prev);
  };

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
        <Typography>Transect</Typography>
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
export default PlantTransectsTable;
