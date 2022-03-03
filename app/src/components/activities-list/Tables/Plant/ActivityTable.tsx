import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AuthStateContext } from 'contexts/authStateContext';
import { useDataAccess } from 'hooks/useDataAccess';
import React, { useContext, useState, useEffect, useMemo, createContext, useRef } from 'react';
import DataGrid, { RowRendererProps, Row, SortColumn, HeaderRendererProps } from 'react-data-grid';
import { useFocusRef } from 'components/react-data-grid-stuff/hooks/useFocusRef';
import CircularProgress from '@mui/material/CircularProgress';
import { activites_default_headers, mapActivitiesToDataGridRows } from '../ActivityTablesHelpers';
import { ActivitySubtypeShortLabels } from '../../../../constants/activities';
import makeStyles from '@mui/styles/makeStyles';
import { Theme } from '@mui/material/styles';
import './filter-cell.css';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import { CheckBox, PlayCircleFilledWhite } from '@mui/icons-material';
import { ThemeContext } from 'utils/CustomThemeProvider';
import { useHistory } from 'react-router';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
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
  },
  rootClassname: {
    display: 'flex',
    flexDirection: 'column',
    blockSize: '100%',
    gap: `10px;
  > .rdg {
    flex: 1;
  }`
  },
  toolbarClassname: {
    textAlign: 'end'
  },
  filterClassname: {
    inlineSize: '100%',
    padding: '4px',
    fontSize: '14px',
    color: 'white'
  }
}));

const filterColumnClassName = 'filter-cell';
const filterColumnClassNameOpen = 'filter-cell-open';
const filterContainerClassname = `
  .${filterColumnClassName} {
    line-height: 35px;
    padding: 0;

    > div {

      padding-block: 0;
      padding-inline: 8px;
      &:first-child {
        border-block-end: 1px solid var(--rdg-border-color);

      }
    }
  }
`;

// no good way to do this dynamically
interface Row {
  activity_id: string;
  short_id: string;
}

const FilterContext = createContext<Filter | undefined>(undefined);
interface Filter extends Omit<Row, 'id' | 'complete'> {
  enabled: boolean;
}

function FilterRenderer<R, SR, T extends HTMLOrSVGElement>({
  isCellSelected,
  column,
  children
}: HeaderRendererProps<R, SR> & {
  children: (args: { ref: React.RefObject<T>; tabIndex: number; filters: Filter }) => React.ReactElement;
}) {
  const filters = useContext(FilterContext)!;
  const { ref, tabIndex } = useFocusRef<T>(isCellSelected);
  console.log('got here');
  console.log('filters');
  console.log(filters);

  return (
    <div>
      <span>{column.name}</span>
      {filters.enabled && <div>{children({ ref, tabIndex, filters })}</div>}
    </div>
  );
}

const ActivityGrid = (props) => {
  const history = useHistory();
  const classes = useStyles();
  const dataAccess = useDataAccess();
  const { userInfo, rolesUserHasAccessTo } = useContext(AuthStateContext);
  const databaseContext = useContext(DatabaseContext);
  const [activities, setActivities] = useState(undefined);
  const [accordionExpanded, setAccordionExpanded] = useState(true);
  const [activitiesSelected, setActivitiesSelected] = useState(null);
  const [messageConsole, setConsole] = useState('Click column headers to sort');

  const themeContext = useContext(ThemeContext);
  const { themeType } = themeContext;
  const handleAccordionExpand = () => {
    setAccordionExpanded((prev) => !prev);
  };

  const getActivities = async () => {
    console.log(userInfo.preferred_username);
    console.log(rolesUserHasAccessTo);
    console.log(rolesUserHasAccessTo);
    let filter: any = {
      created_by: userInfo.preferred_username,
      user_roles: rolesUserHasAccessTo
    };
    if (props.subType) {
      filter.activity_subtype = [props.subType];
    } else if (props.formType) {
      filter.activity_type = [props.formType];
    }

    const act_list = await dataAccess.getActivities(filter);
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
    console.dir(props);
  }, [props.formType, props.subType]);

  // HEADER FILTER STUFF:

  // Context is needed to read filter values otherwise columns are
  // re-created when filters are changed and filter loses focus

  // Context is needed to read filter values otherwise columns are
  // re-created when filters are changed and filter loses focus

  function inputStopPropagation(event: React.KeyboardEvent<HTMLInputElement>) {
    if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.stopPropagation();
    }
  }

  function selectStopPropagation(event: React.KeyboardEvent<HTMLSelectElement>) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.stopPropagation();
    }
  }

  const [filters, setFilters] = useState<Filter>({
    enabled: true,
    activity_id: '',
    short_id: ''
  });

  const developerOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((r) => r.developer))).map((d) => ({
        label: d,
        value: d
      })),
    [rows]
  );

  useEffect(() => {
    props.filtersCallBack(filters);
  }, [filters]);

  const useColumns = (keyAndNameArray) =>
    useMemo(() => {
      return keyAndNameArray.map((x) => {
        if (filters.enabled) {
          return {
            ...x,
            headerCellClass: !filters.enabled ? filterColumnClassName : filterColumnClassNameOpen,
            headerRenderer: (p) => (
              <FilterRenderer<Row, unknown, HTMLInputElement> {...p}>
                {({ filters, ...rest }) => (
                  <input
                    {...rest}
                    className={classes.filterClassname}
                    value={filters[x.key]}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        [x.key]: e.target.value
                      })
                    }
                    onKeyDown={inputStopPropagation}
                  />
                )}
              </FilterRenderer>
            )
          };
        } else {
          return { ...x };
        }
      });
    }, [filters]);

  const columnsDynamic = useColumns(activites_default_headers);

  //todo - tests need to take into account type, they're all strings right now
  const filteredRowsDynamic = useMemo(() => {
    return rows.filter((r) => {
      // grab all keys except enabled
      let rowKeys = Object.keys(filters as unknown as Object).filter((k) => k !== 'enabled');
      // build a check for each
      let tests = rowKeys.map((k) => {
        if (filters[k]) {
          // this only works for strings
          if (r[k].includes(filters[k])) {
            return true;
          } else return false;
        }
        return true;
      });
      // check if they all pass
      return tests.every((t) => {
        return t === true;
      });
    });
  }, [rows, filters]);

  function clearFilters() {
    setFilters({
      activity_id: '',
      short_id: '',
      enabled: true
    });
  }

  function toggleFilters() {
    console.log('toggling');
    setFilters((filters) => ({
      ...filters,
      enabled: !filters.enabled
    }));
  }

  ///SORT STUFF:

  useEffect(() => {
    const newrows = mapActivitiesToDataGridRows(activities);
    setRows(newrows);
  }, [activities]);

  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);

  useEffect(() => {
    console.log('sort coluns');
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

  const [customLists, setCustomLists] = useState();
  const [currentTab, setCurrentTab] = useState();
  //TODO THEME MODE
  const RowRenderer = (props) => {
    return <Row className="xRow" {...props} />;
  };
  return (
    <Box maxHeight="100%" paddingBottom="20px">
      {!activities ? (
        <CircularProgress />
      ) : (
        <FilterContext.Provider value={filters}>
          <FormControl sx={{ pl: 25 }} variant="outlined">
            <InputLabel>Toggle Sort or Filter</InputLabel>
            <CheckBox onClick={toggleFilters} />
          </FormControl>
          <FormControl sx={{ pl: 25 }} variant="outlined">
            <InputLabel>List View:</InputLabel>
            <Select value="Observation" onClick={toggleFilters}>
              <MenuItem value={'Observation'}>Observation</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
          </FormControl>

          <Button color="secondary" variant="contained">
            Colour
          </Button>
          <Button disabled> </Button>
          <Button variant="contained">Drafts</Button>
          <Button variant="contained">My Submitted</Button>
          <Button variant="contained">Favourites</Button>
          {customLists ? (
            customLists.map((l) => {
              return (
                <Button onClick={() => setCurrentTab(l)} variant="contained">
                  {l.description}
                </Button>
              );
            })
          ) : (
            <></>
          )}
          <Button
            disabled={activitiesSelected === null}
            onClick={async () => {
              try {
                await dataAccess.setAppState({ activeActivity: activitiesSelected.activity_id }, databaseContext);
              } catch (e) {
                console.log('unable to http ');
                console.log(e);
              }
              //return dbActivity.activity_id;
              setTimeout(() => {
                history.push({ pathname: `/home/activity` });
              }, 1000);
            }}
            variant="contained">
            View/Edit Selected Form: {activitiesSelected ? activitiesSelected.short_id : ''}
          </Button>
          <Button
            disabled={activitiesSelected === null}
            onClick={async () => {
              try {
                await dataAccess.setAppState({ activeActivity: activitiesSelected.activity_id }, databaseContext);
              } catch (e) {
                console.log('unable to http ');
                console.log(e);
              }
              //return dbActivity.activity_id;
              setTimeout(() => {
                history.push({ pathname: `/home/map` });
              }, 1000);
            }}
            variant="contained">
            View/Edit Selected On Main Map: {activitiesSelected ? activitiesSelected.short_id : ''}
          </Button>
          <div id="xDataGrid">
            <DataGrid
              //TODO THEME MODE
              //style={{ color: 'white', backgroundColor: 'white' }}

              enableVirtualization
              headerRowHeight={filters.enabled ? 70 : undefined}
              style={{ height: '100%' }}
              className={(themeType ? 'rdg-dark' : 'rdg-light') + (filters.enabled ? filterContainerClassname : '')}
              // rows={filteredRows}
              rows={filters.enabled ? filteredRowsDynamic : sortedRows}
              defaultColumnOptions={{ sortable: true }}
              //columns={columns}
              onRowClick={(r) => {
                setActivitiesSelected(r);
              }}
              columns={columnsDynamic}
              sortColumns={sortColumns}
              onSortColumnsChange={setSortColumns}
              components={{ rowRenderer: RowRenderer }}
            />
          </div>
        </FilterContext.Provider>
      )}
    </Box>
  );
};
export default ActivityGrid;
