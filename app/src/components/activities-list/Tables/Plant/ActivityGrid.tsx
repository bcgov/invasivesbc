import EditIcon from '@mui/icons-material/Edit';

import AddBoxIcon from '@mui/icons-material/AddBox';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { AuthStateContext } from 'contexts/authStateContext';
import { useDataAccess } from 'hooks/useDataAccess';
import React, { useContext, useState, useEffect, useMemo, createContext } from 'react';
import DataGrid, { Row, SortColumn, HeaderRendererProps } from 'react-data-grid';
import { useFocusRef } from 'components/react-data-grid-stuff/hooks/useFocusRef';
import CircularProgress from '@mui/material/CircularProgress';
import { activites_default_headers, ActivityRow, mapActivitiesToDataGridRows } from '../ActivityTablesHelpers';
import makeStyles from '@mui/styles/makeStyles';
import { Theme } from '@mui/material/styles';
import './filter-cell.css';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { FilterAltOff } from '@mui/icons-material';
import { ThemeContext } from 'utils/CustomThemeProvider';
import { Chip, List, ListItem } from '@mui/material';
import { FilterDialog, IFilterDialog } from '../FilterDialog';
import { DocType } from 'constants/database';

import SaveIcon from '@mui/icons-material/Save';
import { RecordSetContext } from '../../../../contexts/recordSetContext';
import { ActivityStatus } from 'constants/activities';
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
  recordSetContext: any,
  setName: string,
  gridFilters?: any
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

  if (recordSetContext.recordSetState[setName]?.advancedFilters) {
    const currentAdvFilters = recordSetContext.recordSetState[setName]?.advancedFilters;
    const jurisdictions = [];
    currentAdvFilters.forEach((filter) => {
      if (filter.filterField === 'Jurisdiction') {
        jurisdictions.push(Object.keys(filter.filterValue)[0]);
      }
    });
    filter.jurisdiction = jurisdictions;
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
  const { userInfo, rolesUserHasAccessTo } = useContext(AuthStateContext);
  const [activities, setActivities] = useState(undefined);
  const [accordionExpanded, setAccordionExpanded] = useState(true);
  const [activitiesSelected, setActivitiesSelected] = useState(null);
  const [advancedFilterRows, setAdvancedFilterRows] = useState<any[]>([]);
  const [messageConsole, setConsole] = useState('Click column headers to sort');
  const [filters, setFilters] = useState<any>({});
  const [save, setSave] = useState(0);

  const themeContext = useContext(ThemeContext);
  const { themeType } = themeContext;

  //Grab filter state from main context
  const recordSetContext = useContext(RecordSetContext);
  useEffect(() => {
    const parentStateCollection = recordSetContext.recordSetState;
    //console.dir(parentStateCollection);
    const oldRecordSetState = parentStateCollection[props.setName];
    if (parentStateCollection && oldRecordSetState !== null && oldRecordSetState.gridFilters) {
      setFilters({ ...oldRecordSetState?.gridFilters });
    } else {
      setFilters({ enabled: false });
    }

    if (parentStateCollection && oldRecordSetState !== null && oldRecordSetState.advancedFilters) {
      setAdvancedFilterRows([...oldRecordSetState?.advancedFilters]);
    } else {
      setAdvancedFilterRows([]);
    }
  }, []);

  //update state in main context and localstorage:
  // can probably move some of the 'get old stuff from parent first' logic up to the context
  useEffect(() => {
    recordSetContext.setRecordSetState((prev) => {
      //if (save !== 0 && prev?.[props.setName]) {
      if (prev?.[props.setName]) {
        const thereAreNewFilters =
          filters !== null && JSON.stringify(prev[props.setName]?.gridFilters) !== JSON.stringify(filters)
            ? true
            : false;
        const thereAreNewAdvancedFilters =
          advancedFilterRows !== null &&
          JSON.stringify(prev?.[props.setName].advancedFilters) !== JSON.stringify(advancedFilterRows)
            ? true
            : false;

        const thereAreOldFilters = prev?.[props.setName]?.gridFilters?.length ? true : false;
        const thereAreOldAdvancedFilters = prev?.[props.setName]?.advancedFilters?.length ? true : false;

        if (thereAreNewFilters || thereAreNewAdvancedFilters) {
          const updatedFilters = thereAreNewFilters
            ? { ...filters }
            : thereAreOldFilters
            ? { ...prev?.[props.setName]?.gridFilters }
            : {};
          const updatedAdvancedFilters = thereAreNewAdvancedFilters
            ? [...advancedFilterRows]
            : thereAreOldAdvancedFilters
            ? [...prev?.[props.setName]?.advancedFilters]
            : [];
          return {
            ...prev,
            [props.setName]: {
              ...prev?.[props.setName],
              gridFilters: updatedFilters,
              advancedFilters: updatedAdvancedFilters
            }
          };
        }
      } else {
        return prev;
      }
    });
  }, [save]);

  // TODO: grabs activities - it should check if activity or POI
  useEffect(() => {
    if (recordSetContext?.recordSetState?.[props.setName]) {
      getActivities();
    }
  }, [recordSetContext?.recordSetState?.[props.setName], save, advancedFilterRows]);

  const handleAccordionExpand = () => {
    setAccordionExpanded((prev) => !prev);
  };

  // TODO: grabs activities - it should check if activity or POI
  const getActivities = async () => {
    const filter = getSearchCriteriaFromFilters(
      advancedFilterRows,
      rolesUserHasAccessTo,
      recordSetContext,
      props.setName
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

  const [rows, setRows] = useState([]);

  // TODO: grabs activities - it should check if activity or POI
  useEffect(() => {
    if (activitiesSelected && props.setSelectedRecord && activitiesSelected.activity_id) {
      props.setSelectedRecord({
        type: DocType.ACTIVITY,
        description: activitiesSelected.short_id,
        id: activitiesSelected.activity_id
      });
    }
  }, [activitiesSelected]);

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
          return {
            ...x,
            headerCellClass: !filters.enabled ? filterColumnClassName : filterColumnClassNameOpen,
            headerRenderer: (p) => (
              // TODO: activity row - it should check if activity or POI
              <FilterRenderer<ActivityRow, unknown, HTMLInputElement> {...p}>
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

  //todo: check if activity or POI, grab from activity table helpers or point of interest table helpers
  const columnsDynamic = useColumns(activites_default_headers);

  //todo - tests need to take into account type, they're all strings right now
  const filteredRowsDynamic = useMemo(() => {
    return rows?.filter((r) => {
      // grab all keys except enabled
      let rowKeys = Object.keys(filters as unknown as Object).filter((k) => k !== 'enabled');
      // build a check for each
      let tests = rowKeys.map((k) => {
        if (filters[k] && r[k]) {
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
    setFilters((filters) => ({
      ...filters,
      enabled: !filters.enabled
    }));
  }

  ///SORT STUFF:

  // TODO activity or POI
  useEffect(() => {
    const newrows = mapActivitiesToDataGridRows(activities);
    setRows(newrows);
  }, [activities]);

  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);

  type Comparator = (a, b) => number;

  function getComparator(sortColumn: string): Comparator {
    switch (sortColumn) {
      default:
        return (a, b) => {
          return a[sortColumn].localeCompare(b[sortColumn]);
        };
    }
  }

  const sortedRows = useMemo(() => {
    if (sortColumns?.length === 0) return rows;

    if (rows?.length) {
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
    } else return [];
  }, [rows, sortColumns]);

  //TODO THEME MODE
  const RowRenderer = (props) => {
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
          console.log(advancedFilterRows);
          console.log(props);
          setAdvancedFilterRows((prev) => {
            if (prev.length < 2) {
              return [];
            } else {
              return prev.splice(props.key, 1);
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
      }
    });
  };

  return useMemo(
    () => (
      <Box maxHeight="100%" paddingBottom="20px">
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
              {advancedFilterRows && advancedFilterRows.length > 0 ? (
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
                      />
                    );
                  }
                })
              ) : (
                <></>
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
              <Button onClick={() => setSave(Math.random())} sx={{ mr: 1 }} size={'small'} variant="contained">
                <FilterAltIcon />
                <SaveIcon />
                Apply Filters
              </Button>
              <FilterToggle style={{ marginLeft: 'auto' }} />
            </Box>
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
                  // todo: should have another button for open POI, or open button should be smart enough to open multiple types
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

        <FilterDialog
          filterKey={filterDialog.filterKey}
          setAllFilters={filterDialog.setAllFilters}
          allFiltersBefore={filterDialog.allFiltersBefore}
          dialogOpen={filterDialog.dialogOpen}
          closeActionDialog={filterDialog.closeActionDialog}
        />
      </Box>
    ),
    [
      recordSetContext?.recordSetState?.[props.setName],
      filterDialog,
      advancedFilterRows,
      filters,
      activities,
      filteredRowsDynamic
    ]
  );
};
export default ActivityGrid;
