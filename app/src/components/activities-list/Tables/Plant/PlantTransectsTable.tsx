import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import { AuthStateContext } from 'contexts/authStateContext';
import { useDataAccess } from 'hooks/useDataAccess';
import React, { useContext, useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { CircularProgress } from '@mui/material';
import { activites_default_headers, mapActivitiesToDataGridRows } from '../ActivityTablesHelpers';

const PlantTransectsTable = () => {
  const dataAccess = useDataAccess();
  const { userInfo, rolesUserHasAccessTo } = useContext(AuthStateContext);
  const [activities, setActivities] = useState(undefined);
  const [accordionExpanded, setAccordionExpanded] = useState(true);

  const handleAccordionExpand = () => {
    setAccordionExpanded((prev) => !prev);
  };

  const getActivities = async () => {
    const act_list = await dataAccess.getActivities({
      created_by: userInfo.preferred_username,
      user_roles: rolesUserHasAccessTo,
      activity_type: ['Monitoring']
    });
    setActivities(act_list);
  };

  useEffect(() => {
    console.log(userInfo);
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
export default PlantTransectsTable;
