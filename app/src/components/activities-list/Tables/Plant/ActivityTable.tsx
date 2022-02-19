import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AuthStateContext } from 'contexts/authStateContext';
import { useDataAccess } from 'hooks/useDataAccess';
import React, { useContext, useState, useEffect } from 'react';
import DataGrid, { RowRendererProps, Row } from 'react-data-grid';
import CircularProgress from '@mui/material/CircularProgress';
import { activites_default_headers, mapActivitiesToDataGridRows } from '../ActivityTablesHelpers';
import { ActivitySubtypeShortLabels } from '../../../../constants/activities';
import makeStyles from '@mui/styles/makeStyles';
import { Theme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import { PlayCircleFilledWhite } from '@mui/icons-material';

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

const ActivityGrid = () => {
  const classes = useStyles();
  const dataAccess = useDataAccess();
  const { userInfo, rolesUserHasAccessTo } = useContext(AuthStateContext);
  const [activities, setActivities] = useState(undefined);
  const [accordionExpanded, setAccordionExpanded] = useState(true);
  const [activitiesSelected, setActivitiesSelected] = useState(null);
  const [console, setConsole] = useState('Click column headers to sort');

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
    if (act_list && act_list.code) {
      setConsole('Unable to fetch activities');
    }
    setActivities(act_list);
  };

  useEffect(() => {
    getActivities();
  }, []);

  //TODO THEME MODE
  const RowRenderer = (props) => {
    return <Row {...props} style={{ color: 'black', backgroundColor: 'white' }} />;
  };
  return (
    <>
      <Typography>{console}</Typography>
      {!activities ? (
        <CircularProgress />
      ) : (
        <DataGrid
          //TODO THEME MODE
          style={{ color: 'white', backgroundColor: 'white' }}
          rows={mapActivitiesToDataGridRows(activities)}
          columns={activites_default_headers}
          components={{ rowRenderer: RowRenderer }}
        />
      )}
    </>
  );
};
export default ActivityGrid;
