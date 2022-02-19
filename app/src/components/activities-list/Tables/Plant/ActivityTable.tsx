import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AuthStateContext } from 'contexts/authStateContext';
import { useDataAccess } from 'hooks/useDataAccess';
import React, { useContext, useState, useEffect, useMemo } from 'react';
import DataGrid, { RowRendererProps, Row, SortColumn } from 'react-data-grid';
import CircularProgress from '@mui/material/CircularProgress';
import { activites_default_headers, mapActivitiesToDataGridRows } from '../ActivityTablesHelpers';
import { ActivitySubtypeShortLabels } from '../../../../constants/activities';
import makeStyles from '@mui/styles/makeStyles';
import { Theme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import { PlayCircleFilledWhite } from '@mui/icons-material';
import { ThemeContext } from 'utils/CustomThemeProvider';
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
  const [messageConsole, setConsole] = useState('Click column headers to sort');

  const themeContext = useContext(ThemeContext);
  const { themeType } = themeContext;
  const handleAccordionExpand = () => {
    setAccordionExpanded((prev) => !prev);
  };

  const subtypesList = [
    ActivitySubtypeShortLabels.Activity_Observation_PlantAquatic,
    ActivitySubtypeShortLabels.Activity_Observation_PlantTerrestrial
  ];

  const getActivities = async () => {
    console.log(userInfo.preferred_username);
    console.log(rolesUserHasAccessTo);
    console.log(rolesUserHasAccessTo);
    const act_list = await dataAccess.getActivities({
      created_by: userInfo.preferred_username,
      user_roles: rolesUserHasAccessTo,
      activity_type: ['Observation']
    });
    if (act_list && !act_list.count) {
      setConsole('Unable to fetch activities.');
    }
    if (act_list && act_list.code) {
      setConsole('Unable to fetch activities.');
    }
    if (act_list && act_list.count === 0) {
      setConsole('No data found.');
    }
    setActivities(act_list);
  };

  const [rows, setRows] = useState([]);

  useEffect(() => {
    getActivities();
  }, []);

  useEffect(() => {
    const newrows = mapActivitiesToDataGridRows(activities);
    setRows(newrows);
  }, [activities]);

  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);

  useEffect(() => {
    console.dir(sortColumns);
  }, [sortColumns]);

  type Comparator = (a, b) => number;

  function getComparator(sortColumn: string): Comparator {
    switch (sortColumn) {
      default:
        return (a, b) => {
          return a[sortColumn].localeCompare(b[sortColumn]);
        };
      //default:
      // throw new Error(`unsupported sortColumn: "${sortColumn}"`);
    }
  }

  const sortedRows = useMemo(() => {
    if (sortColumns.length === 0) return rows;

    return [...rows].sort((a, b) => {
      for (const sort of sortColumns) {
        const comparator = getComparator(sort.columnKey);
        const compResult = comparator(a, b);
        if (compResult !== 0) {
          return sort.direction === 'ASC' ? compResult : -compResult;
        }
      }
      return 0;
    });
  }, [rows, sortColumns]);

  //TODO THEME MODE
  const RowRenderer = (props) => {
    return <Row {...props} style={{ color: 'black', backgroundColor: 'white' }} />;
  };
  return (
    <Box maxHeight="100%">
      <Typography>{messageConsole}</Typography>
      {!activities ? (
        <CircularProgress />
      ) : (
        <DataGrid
          //TODO THEME MODE
          //style={{ color: 'white', backgroundColor: 'white' }}
          enableVirtualization
          className={themeType ? 'rdg-dark' : 'rdg-light'}
          rows={sortedRows}
          defaultColumnOptions={{ sortable: true }}
          columns={activites_default_headers}
          sortColumns={sortColumns}
          onSortColumnsChange={setSortColumns}
          //       components={{ rowRenderer: RowRenderer }}
        />
      )}
    </Box>
  );
};
export default ActivityGrid;
