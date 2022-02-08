import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AuthStateContext } from 'contexts/authStateContext';
import { useDataAccess } from 'hooks/useDataAccess';
import React, { useContext, useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import CircularProgress from '@mui/material/CircularProgress';
import { activites_default_headers, mapActivitiesToDataGridRows } from '../ActivityTablesHelpers';
import { ActivitySubtypeShortLabels } from '../../../../constants/activities';
import makeStyles from '@mui/styles/makeStyles';
import { Theme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';

const useStyles = makeStyles((theme: Theme) => ({
  accordionHeader: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  accordionHeaderText: {
    margin: 5
  },
  createButtonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'end',
    flexGrow: 1,
    minHeight: '50px'
  },
  createButton: {
    margin: '5px'
  }
}));

const PlantObservationsTable = () => {
  const classes = useStyles();
  const dataAccess = useDataAccess();
  const { userInfo, rolesUserHasAccessTo } = useContext(AuthStateContext);
  const [activities, setActivities] = useState(undefined);
  const [accordionExpanded, setAccordionExpanded] = useState(true);
  const [activitiesSelected, setActivitiesSelected] = useState(null);

  const handleAccordionExpand = () => {
    setAccordionExpanded((prev) => !prev);
  };

  const subtypesList = [
    ActivitySubtypeShortLabels.Activity_Observation_PlantAquatic,
    ActivitySubtypeShortLabels.Activity_Observation_PlantTerrestrial
  ];

  const getActivities = async () => {
    const act_list = await dataAccess.getActivities({
      created_by: userInfo.preferred_username,
      user_roles: rolesUserHasAccessTo,
      activity_type: ['Observation']
    });
    setActivities(act_list);
  };

  useEffect(() => {
    getActivities();
  }, []);

  return (
    <Accordion expanded={accordionExpanded} onChange={handleAccordionExpand}>
      <AccordionSummary className={classes.accordionHeader} expandIcon={<ExpandMoreIcon />}>
        <Typography className={classes.accordionHeaderText} variant="h5">
          Observations
        </Typography>
        <Box className={classes.createButtonsContainer}>
          {subtypesList.map((subtype) => {
            console.log(subtype);
            return (
              <>
                <Button startIcon={<AddIcon />} className={classes.createButton} variant="contained">
                  {subtype}
                </Button>
              </>
            );
          })}
        </Box>
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
export default PlantObservationsTable;
