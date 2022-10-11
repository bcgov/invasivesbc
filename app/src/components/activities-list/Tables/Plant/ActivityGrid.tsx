import AddBoxIcon from '@mui/icons-material/AddBox';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useDataAccess } from 'hooks/useDataAccess';
import React, { useContext, useState, useEffect, useMemo, createContext } from 'react';
import DataGrid, { Row, SortColumn, HeaderRendererProps } from 'react-data-grid';
import { useFocusRef } from 'components/react-data-grid-stuff/hooks/useFocusRef';
import CircularProgress from '@mui/material/CircularProgress';
import { ActivitiesDefaultHeaders, ActivityRow, MapActivitiesToDataGridRows } from '../ActivityTablesHelpers';
import { point_of_interest_iapp_default_headers, POI_IAPP_Row, mapPOI_IAPP_ToDataGridRows } from '../POITablesHelpers';
import makeStyles from '@mui/styles/makeStyles';
import { Theme } from '@mui/material/styles';
import './filter-cell.css';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { FilterAltOff } from '@mui/icons-material';
import { ThemeContext } from 'utils/CustomThemeProvider';
import { Chip, List } from '@mui/material';
import { FilterDialog, IFilterDialog } from '../FilterDialog';
import { DocType } from 'constants/database';
import SaveIcon from '@mui/icons-material/Save';
import { ActivityStatus } from 'constants/activities';
import { useSelector } from '../../../../state/utilities/use_selector';
import { selectAuth } from '../../../../state/reducers/auth';
import { selectConfiguration } from 'state/reducers/configuration';
import { useDispatch } from 'react-redux';
import { USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_REQUEST, USER_SETTINGS_SET_RECORD_SET_REQUEST, USER_SETTINGS_SET_SELECTED_RECORD_REQUEST } from 'state/actions';
import { selectUserSettings } from 'state/reducers/userSettings';
import { select } from 'redux-saga/effects';

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
    fontSize: '14px'
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

export const getSearchCriteriaFromFilters = (
  advancedFilterRows: any,
  rolesUserHasAccessTo: any,
  recordSets: any,
  setName: string,
  isIAPP: boolean,
  gridFilters: any,
  page: number,
  limit: number,
  sortColumns: readonly SortColumn[]
) => {
  const created_by_filter = advancedFilterRows.filter((x) => x.filterField === 'created_by');
  const form_status_filter = advancedFilterRows.filter((x) => x.filterField === 'record_status');
  const created_by = created_by_filter?.length === 1 ? created_by_filter[0].filterValue : null;
  const form_status = form_status_filter?.length === 1 ? form_status_filter[0].filterValue : ActivityStatus.SUBMITTED;
  let filter: any = {
    user_roles: rolesUserHasAccessTo
  };
  if (created_by) {
    filter.created_by = [created_by];
  }
  if (form_status) {
    filter.form_status = [form_status];
  }
  /*if (props.subType) {
    filter.activity_subtype = [props.subType];
  } else if (props.formType) {
    filter.activity_type = [props.formType];
  }
  */
  if (gridFilters && gridFilters.enabled) {
    filter.grid_filters = gridFilters;
  }

  //search_feature
  if (recordSets[setName]?.searchBoundary) {
    filter.search_feature = {
      type: 'FeatureCollection',
      features: recordSets[setName]?.searchBoundary.geos
    };
  }

  if (recordSets[setName]?.advancedFilters) {
    const currentAdvFilters = recordSets[setName]?.advancedFilters;
    const jurisdictions = [];
    const speciesPositive = [];
    const speciesNegative = [];
    currentAdvFilters.forEach((filter) => {
      switch (filter.filterField) {
        case 'Jurisdiction': {
          jurisdictions.push(Object.values(filter.filterValue)[0]);
          break;
        }
        case 'Species Positive': {
          speciesPositive.push(Object.keys(filter.filterValue)[0]);
          break;
        }
        case 'Species Negative': {
          speciesNegative.push(Object.keys(filter.filterValue)[0]);
          break;
        }
      }

      if (filter.filterField === 'Species Positive') {
        speciesPositive.push(Object.keys(filter.filterValue)[0]);
      }
      if (filter.filterField === 'Species Negative') {
        speciesNegative.push(Object.keys(filter.filterValue)[0]);
      }
    });

    if (jurisdictions.length > 0) filter.jurisdiction = jurisdictions;
    if (speciesPositive.length > 0) filter.species_positive = speciesPositive;
    if (speciesNegative.length > 0) filter.species_negative = speciesNegative;
  }

  // is IAPP
  if (isIAPP) filter.isIAPP = isIAPP;

  // page number
  filter.page = page;

  // row limit
  filter.limit = limit;

  // column sorting
  if (sortColumns && sortColumns.length > 0) {
    filter.order = [...sortColumns];
  }
  return filter;
};

// no good way to do this dynamically
interface Row {
  activity_id: string;
  short_id: string;
}

const FilterContext = createContext<Filter | undefined>(undefined);
interface Filter extends Omit<ActivityRow, 'id' | 'complete'> {
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

  return (
    <div>
      <span>{column.name}</span>
      {filters.enabled && <div>{children({ ref, tabIndex, filters })}</div>}
    </div>
  );
}

const ActivityGrid = (props) => {
  const [filterDialog, setFilterDialog] = useState<IFilterDialog>({
    dialogOpen: false
  });
  const classes = useStyles();
  const dataAccess = useDataAccess();
  const [activities, setActivities] = useState(undefined);
  const [POIs, setPOIs] = useState(undefined);
  const [accordionExpanded, setAccordionExpanded] = useState(true);
  const [activitiesSelected, setActivitiesSelected] = useState(null);
  const [poiSelected, setPoiSelected] = useState(null);
  const [advancedFilterRows, setAdvancedFilterRows] = useState<any[]>([]);
  const [messageConsole, setConsole] = useState('Click column headers to sort');
  const [filters, setFilters] = useState<any>({});
  const [save, setSave] = useState(0);
  const [cursorPos, setCursorPos] = useState(0);
  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);

  const dispatch = useDispatch();
  const { accessRoles } = useSelector(selectAuth);
  const userSettings = useSelector(selectUserSettings);
  const themeContext = useContext(ThemeContext);
  const { themeType } = themeContext;

  //Grab filter state from main context
  useEffect(() => {
    const parentStateCollection = userSettings.recordSets;
    //console.dir(parentStateCollection);
    const oldRecordSetState = parentStateCollection[props.setName];
    if (parentStateCollection && oldRecordSetState !== null && oldRecordSetState?.gridFilters) {
      setFilters({ ...oldRecordSetState?.gridFilters });
    } else {
      setFilters({ enabled: false });
    }

    if (parentStateCollection && oldRecordSetState !== null && oldRecordSetState?.advancedFilters) {
      setAdvancedFilterRows([...oldRecordSetState?.advancedFilters]);
    } else {
      setAdvancedFilterRows([]);
    }

    setSave(Math.random());
    //Hacky solution to prevent wrong activity grid
    setTimeout(() => {
      setSave(Math.random());
    }, 1000);
  }, []);

  //update state in main context and localstorage:
  // can probably move some of the 'get old stuff from parent first' logic up to the context
  useEffect(() => {
    if (save !== 0 && userSettings.recordSets?.[props.setName]) {
      if (userSettings.recordSets?.[props.setName]) {
        const thereAreNewFilters =
          filters !== null && JSON.stringify(userSettings.recordSets[props.setName]?.gridFilters) !== JSON.stringify(filters)
            ? true
            : false;
        const thereAreNewAdvancedFilters =
          advancedFilterRows !== null &&
          JSON.stringify(userSettings.recordSets?.[props.setName].advancedFilters) !== JSON.stringify(advancedFilterRows)
            ? true
            : false;

        const thereAreOldFilters = userSettings.recordSets?.[props.setName]?.gridFilters?.length ? true : false;
        const thereAreOldAdvancedFilters = userSettings.recordSets?.[props.setName]?.advancedFilters?.length ? true : false;

        if (thereAreNewFilters || thereAreNewAdvancedFilters) {
          const updatedFilters = thereAreNewFilters
            ? { ...filters }
            : thereAreOldFilters
            ? { ...userSettings.recordSets?.[props.setName]?.gridFilters }
            : {};
          const updatedAdvancedFilters = thereAreNewAdvancedFilters
            ? [...advancedFilterRows]
            : thereAreOldAdvancedFilters
            ? [...userSettings.recordSets?.[props.setName]?.advancedFilters]
            : [];
          dispatch({
            type: USER_SETTINGS_SET_RECORD_SET_REQUEST,
            payload: {
              updatedSet: {
                ...userSettings.recordSets?.[props.setName],
                gridFilters: updatedFilters,
                advancedFilters: updatedAdvancedFilters
              },
              setName: props.setName
            }
          });
        }
      }
    };
  }, [advancedFilterRows]);

  useEffect(() => {
    if (userSettings?.recordSets?.[props.setName]) {
      if (props.setType === 'POI') {
        getPOIs();
      } else {
        getActivities();
      }
    }
  }, [save, JSON.stringify(userSettings?.recordSets?.[props.setName]), sortColumns]);

  const handleAccordionExpand = () => {
    setAccordionExpanded((prev) => !prev);
  };

  const getActivities = async () => {
    const filter = getSearchCriteriaFromFilters(
      advancedFilterRows,
      accessRoles,
      userSettings?.recordSets,
      props.setName,
      false,
      filters.enabled ? filters : null,
      0,
      20,
      sortColumns.length ? [...sortColumns] : null
    );

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

  const getPOIs = async () => {
    const filter = getSearchCriteriaFromFilters(
      advancedFilterRows,
      accessRoles,
      userSettings?.recordSets,
      props.setName,
      true,
      filters.enabled ? filters : null,
      0,
      20,
      sortColumns.length ? [...sortColumns] : []
    );

    const act_list = await dataAccess.getPointsOfInterest(filter);
    if (act_list && !act_list.count) {
      setConsole('Unable to fetch points of interest.');
    }
    if (act_list && act_list.code) {
      setConsole('Unable to fetch points of interest.');
    }
    if (act_list && act_list.count === 0) {
      setConsole('No POI data found.');
    }
    setPOIs(act_list);
  };

  const [rows, setRows] = useState([]);

  // set selected record to activity
  useEffect(() => {
    if (activitiesSelected && activitiesSelected.activity_id) {
      dispatch({
        type: USER_SETTINGS_SET_SELECTED_RECORD_REQUEST,
        payload: {
          selectedRecord: {
            type: DocType.ACTIVITY,
            description: 'Activity-' + activitiesSelected.short_id,
            id: activitiesSelected.activity_id,
            isIapp: false
          }
        }
      });
    }
  }, [activitiesSelected]);

  // set selected record to poi
  useEffect(() => {
    if (poiSelected && poiSelected.point_of_interest_id) {
      dispatch({
        type: USER_SETTINGS_SET_SELECTED_RECORD_REQUEST,
        payload: {
          selectedRecord: {
            type: DocType.POINT_OF_INTEREST,
            description: 'IAPP-' + poiSelected.point_of_interest_id,
            id: poiSelected.point_of_interest_id,
            isIAPP: true
          }
        }
      });
    }
  }, [poiSelected]);
  // HEADER FILTER STUFF:

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

  /*
  const developerOptions = useMemo(
    () =>
      Array.from(new Set(rows?.map((r) => r.developer))).map((d) => ({
        label: d,
        value: d
      })),
    [rows]
  );
  */

  const useColumns = (keyAndNameArray) =>
    useMemo(() => {
      return keyAndNameArray.map((x) => {
        if (filters && filters.enabled) {
          if (props.setType === 'POI') {
            return {
              ...x,
              headerCellClass: !filters.enabled ? filterColumnClassName : filterColumnClassNameOpen,
              headerRenderer: (p) => (
                <FilterRenderer<POI_IAPP_Row, unknown, HTMLInputElement> {...p}>
                  {({ filters, ...rest }) => (
                    <input
                      {...rest}
                      className={classes.filterClassname}
                      value={filters[x.key]}
                      onChange={(e) => {
                        setCursorPos(e.target.selectionStart);
                        setFilters({
                          ...filters,
                          [x.key]: e.target.value
                        })
                      }}
                      onFocus={(e) => {
                        e.target.selectionStart = cursorPos;
                        e.target.selectionEnd = cursorPos;
                      }}
                      onKeyDown={inputStopPropagation}
                    />
                  )}
                </FilterRenderer>
              )
            };
          } else {
            return {
              ...x,
              headerCellClass: !filters.enabled ? filterColumnClassName : filterColumnClassNameOpen,
              headerRenderer: (p) => (
                <FilterRenderer<ActivityRow, unknown, HTMLInputElement> {...p}>
                  {({ filters, ...rest }) => (
                    <input
                      {...rest}
                      className={classes.filterClassname}
                      value={filters[x.key]}
                      onChange={(e) =>{
                        setCursorPos(e.target.selectionStart);
                        setFilters({
                          ...filters,
                          [x.key]: e.target.value
                        })
                      }}
                      onFocus={(e) => {
                        e.target.selectionStart = cursorPos;
                        e.target.selectionEnd = cursorPos;
                      }}
                      onKeyDown={inputStopPropagation}
                    />
                  )}
                </FilterRenderer>
              )
            };
          }
        } else {
          return { ...x };
        }
      });
    }, [filters]);

  // sets columnns based on record set type
  const iappColumns = useColumns(point_of_interest_iapp_default_headers);
  const actColumns = useColumns(ActivitiesDefaultHeaders());
  const columnsDynamic = props.setType === 'POI' ? iappColumns : actColumns;

  //todo - tests need to take into account type, they're all strings right now
  // const filteredRowsDynamic = useMemo(() => {
  //   return rows?.filter((r) => {
  //     // grab all keys except enabled
  //     let rowKeys = Object.keys(filters as unknown as Object).filter((k) => k !== 'enabled');
  //     // build a check for each
  //     let tests = rowKeys.map((k) => {
  //       if (filters[k] && r[k]) {
  //         // this only works for strings
  //         let field = r[k];
  //         if (typeof(r[k]) === 'number') field = field.toString();    //convert to string if type is number
  //         if (field.includes(filters[k])) {
  //           return true;
  //         } else return false;
  //       }
  //       return true;
  //     });
  //     // check if they all pass
  //     return tests.every((t) => {
  //       return t === true;
  //     });
  //   });
  // }, [rows, filters]);


  function clearFilters() {
    setFilters({
      activity_id: '',
      short_id: '',
      enabled: true
    });
  }

  function toggleFilters() {
    dispatch({ type: USER_SETTINGS_SET_RECORD_SET_REQUEST, payload: {
      updatedSet: {
        ...userSettings.recordSets?.[props.setName],
        gridFilters: {
          ...filters,
          enabled: !filters.enabled
        }
      },
      setName: props.setName
    }});
    setFilters((filters) => ({
      ...filters,
      enabled: !filters.enabled
    }));
  }

  ///SORT STUFF:
  const { MOBILE } = useSelector(selectConfiguration);

  useEffect(() => {
    if (MOBILE) {
      console.log('Getting cached activities...');
      dataAccess.getCachedActivityIDs().then((res) => {
        console.log('RES: ', res);
        const newrows = MapActivitiesToDataGridRows(activities, MOBILE, res);
        setRows(newrows);
      });
    } else {
      const newrows = MapActivitiesToDataGridRows(activities, true);
      setRows(newrows);
    }
  }, [activities]);

  useEffect(() => {
    const newrows = mapPOI_IAPP_ToDataGridRows(POIs);
    setRows(newrows);
  }, [POIs]);


  //TODO THEME MODE
  const RowRenderer = (props) => {
    const color = props.row.cached === 'Cached' ? 'green' : 'red';
    if (props.row.cached === 'Cached') {
      console.log('ROW CACEHD');
    }
    return <Row className="xRow" {...props} />;
  };

  const FilterToggle = (props) => {
    return (
      <IconButton color={'primary'} style={props.style} onClick={toggleFilters}>
        {filters.enabled ? <FilterAltIcon /> : <FilterAltOff />}
      </IconButton>
    );
  };

  const FilterRow = (props) => {
    return (
      <Chip
        label={`${props.filterField} = ${Object.values(props.filterValue)[0]}`}
        variant="outlined"
        onClick={(e) => {
          e.stopPropagation();
          newFilter(props.filterKey);
        }}
        onDelete={(e) => {
          e.stopPropagation();
          setAdvancedFilterRows((prev) => {
            if (prev.length < 2) {
              return [];
            } else {
              prev.splice(props.id, 1);
              return [...prev];
            }
          });
        }}
      />
    );
  };

  const newFilter = (filterKey) => {
    setFilterDialog({
      dialogOpen: true,
      filterKey: filterKey,
      setAllFilters: setAdvancedFilterRows,
      allFiltersBefore: [...advancedFilterRows],
      closeActionDialog: () => {
        setFilterDialog({ ...filterDialog, dialogOpen: false });
      },
      setType: props.setType
    });
  };

  return useMemo(
    () => (
      <Box key={'gridbox_' + props.setName} maxHeight="100%" paddingBottom="20px">
        {!activities ? (
          <CircularProgress />
        ) : (
          <FilterContext.Provider value={filters}>
            {advancedFilterRows && advancedFilterRows.length > 0 ? <Typography>Advanced Filters</Typography> : <></>}
            <List
              sx={{
                pb: 7,
                display: 'flex',
                flexWrap: 'wrap',
                width: '100%',
                height: 'auto',
                flexDirection: 'row',
                justifyContent: 'start',
                alignItems: 'center'
              }}>
              {advancedFilterRows &&
                advancedFilterRows.length > 0 &&
                advancedFilterRows.map((r, i) => {
                  if (
                    !(props.setName === '1' && (r.filterField === 'created_by' || r.filterField === 'record_status'))
                  ) {
                    return (
                      <FilterRow
                        filterField={r.filterField}
                        filterValue={r.filterValue}
                        filterKey={r.filterKey}
                        key={i}
                        id={i}
                      />
                    );
                  }
                })}
              {userSettings?.recordSets[props.setName]?.searchBoundary && (
                <Chip
                  label={`Boundary = ${userSettings?.recordSets[props.setName]?.searchBoundary?.name}`}
                  variant="outlined"
                  color="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  onDelete={(e) => {
                    e.stopPropagation();
                    dispatch({ type: USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_REQUEST , payload: { setName: props.setName }});
                  }}
                />
              )}
            </List>
            <Box
              sx={{
                pb: 7,
                display: 'flex',
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'start',
                alignItems: 'center'
              }}>
              <Button onClick={() => newFilter(undefined)} sx={{ mr: 1 }} size={'small'} variant="contained">
                <AddBoxIcon></AddBoxIcon>Advanced Filter
              </Button>
              <Button onClick={() => {
                dispatch({ type: USER_SETTINGS_SET_RECORD_SET_REQUEST, payload: {
                  updatedSet: {
                    ...userSettings.recordSets?.[props.setName],
                    gridFilters: {
                      ...filters
                    }
                  },
                  setName: props.setName
                }});
                setSave(Math.random());
              }} sx={{ mr: 1, float: 'right' }} size={'large'} variant="contained">
                <FilterAltIcon />
                <SaveIcon />
                Save & Apply Filters
              </Button>
              <FilterToggle style={{ marginLeft: 'auto' }} />
            </Box>
            <div id={'xDataGrid_' + props.setName}>
              <DataGrid
                key={props.setName + 'datagrid'}
                //TODO THEME MODE
                //style={{ color: 'white', backgroundColor: 'white' }o

                enableVirtualization
                headerRowHeight={filters.enabled ? 70 : undefined}
                style={{ height: '100%' }}
                className={(themeType ? 'rdg-dark' : 'rdg-light') + (filters.enabled ? filterContainerClassname : '')}
                // rows={filteredRows}
                rows={rows}
                defaultColumnOptions={{ sortable: true, resizable: true, minWidth: 150, width: 200 }}
                //columns={columns}
                onRowClick={(r) => {
                  props.setType === 'POI' ? setPoiSelected(r) : setActivitiesSelected(r);
                }}
                columns={columnsDynamic}
                sortColumns={sortColumns}
                onSortColumnsChange={setSortColumns}
                components={{ rowRenderer: RowRenderer }}
              />
            </div>
          </FilterContext.Provider>
        )}

        <FilterDialog
          filterKey={filterDialog.filterKey}
          setAllFilters={filterDialog.setAllFilters}
          allFiltersBefore={filterDialog.allFiltersBefore}
          dialogOpen={filterDialog.dialogOpen}
          closeActionDialog={filterDialog.closeActionDialog}
          setType={props.setType}
        />
      </Box>
    ),
    [
      JSON.stringify(userSettings?.recordSets?.[props.setName]),
      filterDialog,
      advancedFilterRows,
      filters,
      activities,
      sortColumns,
      rows
    ]
  );
};
export default ActivityGrid;
