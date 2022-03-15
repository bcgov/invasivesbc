import EditIcon from '@mui/icons-material/Edit';

import AddBoxIcon from '@mui/icons-material/AddBox';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import Typography from '@mui/material/Typography';
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
import { CheckBox, FilterAltOff, PlayCircleFilledWhite } from '@mui/icons-material';
import { ThemeContext } from 'utils/CustomThemeProvider';
import { useHistory } from 'react-router';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { FormControl, InputLabel, List, ListItem, MenuItem, Select } from '@mui/material';
import { DocType } from 'constants/database';
import { IWarningDialog, WarningDialog } from 'components/dialog/WarningDialog';
import { getJurisdictions } from 'components/points-of-interest/IAPP/IAPP-Functions';
import { RecordSetContext } from 'features/home/activities/ActivitiesPage';
import { GridSaveAltIcon } from '@mui/x-data-grid';
import SaveIcon from '@mui/icons-material/Save';
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

  return (
    <div>
      <span>{column.name}</span>
      {filters.enabled && <div>{children({ ref, tabIndex, filters })}</div>}
    </div>
  );
}

const ActivityGrid = (props) => {
  const [warningDialog, setWarningDialog] = useState<IWarningDialog>({
    dialogActions: [],
    dialogOpen: false,
    dialogTitle: '',
    dialogContentText: null
  });
  const history = useHistory();
  const classes = useStyles();
  const dataAccess = useDataAccess();
  const { userInfo, rolesUserHasAccessTo } = useContext(AuthStateContext);
  const databaseContext = useContext(DatabaseContext);
  const [activities, setActivities] = useState(undefined);
  const [accordionExpanded, setAccordionExpanded] = useState(true);
  const [activitiesSelected, setActivitiesSelected] = useState(null);
  const [messageConsole, setConsole] = useState('Click column headers to sort');
  const [filters, setFilters] = useState(null);
  const [save, setSave] = useState(0);

  const themeContext = useContext(ThemeContext);
  const { themeType } = themeContext;

  //Grab filter state from main context
  const recordSetContext = useContext(RecordSetContext);
  useEffect(() => {
    const parentStateCollection = recordSetContext.recordSetState;
    const oldRecordSetState = parentStateCollection[props.setName];
    if (parentStateCollection && oldRecordSetState !== null && oldRecordSetState.gridFilters) {
      setFilters(oldRecordSetState.gridFilters);
    } else {
      setFilters({ enabled: false });
    }
  }, []);

  //update state in main context and localstorage:
  // can probably move some of the 'get old stuff from parent first' logic up to the context
  useEffect(() => {
    const parentStateCollection = recordSetContext.recordSetState;
    const oldRecordSetState = parentStateCollection[props.setName];
    if (oldRecordSetState !== null && save !== 0) {
      const oldFilters = parentStateCollection[props.setName].gridFilters;
      if (oldFilters && filters !== null && JSON.stringify(oldFilters) !== JSON.stringify(filters)) {
        recordSetContext.setRecordSetState({
          ...parentStateCollection,
          [props.setName]: { ...oldRecordSetState, gridFilters: { ...filters } }
        });
      } else {
        if (parentStateCollection && oldRecordSetState !== null && filters !== null) {
          recordSetContext.setRecordSetState({
            ...parentStateCollection,
            [props.setName]: { ...oldRecordSetState, gridFilters: { ...filters } }
          });
        }
      }
    }
  }, [save]);

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
    if (activitiesSelected && props.setSelectedRecord && activitiesSelected.activity_id) {
      console.dir(activitiesSelected);
      console.log();
      props.setSelectedRecord({
        type: DocType.ACTIVITY,
        description: activitiesSelected.short_id,
        id: activitiesSelected.activity_id
      });
    }
  }, [activitiesSelected]);

  useEffect(() => {
    getActivities();
    console.dir(props);
  }, [props.formType, props.subType, props.initialFilters]);

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
  const developerOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((r) => r.developer))).map((d) => ({
        label: d,
        value: d
      })),
    [rows]
  );

  /*
  useEffect(() => {
    props.filtersCallBack(filters);
  }, [filters]);
  */

  const useColumns = (keyAndNameArray) =>
    useMemo(() => {
      return keyAndNameArray.map((x) => {
        if (filters && filters.enabled) {
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

  //TODO THEME MODE
  const RowRenderer = (props) => {
    return <Row className="xRow" {...props} />;
  };

  const FilterToggle = (props) => {
    return filters.enabled ? (
      <FilterAltIcon style={props.style} onClick={toggleFilters} />
    ) : (
      <FilterAltOff style={props.style} onClick={toggleFilters} />
    );
  };

  const FilterRow = (props) => {
    return (
      <ListItem key={props.key} sx={{ width: 'auto' }}>
        <Button variant="outlined">
          {props.filterField} = {props.filterValue}
        </Button>
        <EditIcon
          onClick={(e) => {
            e.stopPropagation();
            newFilter(props.filterKey);
          }}
          sx={{ color: themeType ? 'black' : 'white', fontSize: '10' }}
        />
      </ListItem>
    );
  };

  const FilterWizard = (props) => {
    const choices = ['Jurisdiction', 'Species Positive', 'Species Negative', 'Metabase Report ID'];

    const jusridictionOptions = ['BC Hydro', 'FLNR'];
    const speciesPOptions = ['Blueweed', 'Cheatgrass'];
    const speciesNOptions = ['Blueweed', 'Cheatgrass'];

    const [choice, setChoice] = useState('Jurisdiction');
    const [subChoices, setSubChoices] = useState([...jusridictionOptions]);
    const [subChoice, setSubChoice] = useState('BC Hydro');

    useEffect(() => {
      if (props.filterKey !== undefined && props.allFiltersBefore !== undefined) {
        const prevChoices = props.allFiltersBefore.filter((f) => {
          return f.filterKey === props.filterKey;
        })[0];
        setChoice(prevChoices.filterField);
        setSubChoice(prevChoices.filterValue);
      }
    }, []);

    useEffect(() => {
      switch (choice) {
        case 'Jurisdiction':
          setSubChoices([...jusridictionOptions]);
          setSubChoice('BC Hydro');
          break;
        case 'Species Positive':
          setSubChoices([...speciesPOptions]);
          setSubChoice('Blueweed');
          break;
        case 'Species Negative':
          setSubChoices([...speciesNOptions]);
          setSubChoice('Cheatgrass');
          break;
        case 'Metabase Report ID':
          setSubChoices([...speciesNOptions]);
          setSubChoice('Cheatgrass');
          break;
      }
    }, [choice]);

    const DropDown = (props) => {
      return (
        <>
          <Select
            onChange={(e) => {
              props.setChoice(e.target.value);
            }}
            value={props.choice}>
            {props.choices && props.choices.length > 0 ? (
              props.choices.map((c) => {
                return <MenuItem value={c}>{c}</MenuItem>;
              })
            ) : (
              <></>
            )}
          </Select>
        </>
      );
    };

    return (
      <>
        <DropDown choice={choice} choices={choices} setChoice={setChoice} />
        <DropDown choice={subChoice} choices={subChoices} setChoice={setSubChoice} />
        <Button
          onClick={() => {
            if (props.allFiltersBefore && props.allFiltersBefore.length > 0 && !props.filterKey) {
              props.setAllFilters([
                ...props.allFiltersBefore.filter((f) => {
                  return f.filterKey !== choice + subChoice;
                }),
                { filterField: choice, filterValue: subChoice, filterKey: choice + subChoice }
              ]);
            } else if (props.allFiltersBefore && props.allFiltersBefore.length > 0 && props.filterKey) {
              props.setAllFilters([
                ...props.allFiltersBefore.filter((f) => {
                  return f.filterKey !== props.filterKey;
                }),
                { filterField: choice, filterValue: subChoice, filterKey: choice + subChoice }
              ]);
            } else
              props.setAllFilters([{ filterField: choice, filterValue: subChoice, filterKey: choice + subChoice }]);

            props.closeActionDialog();
          }}>
          Save
        </Button>
      </>
    );
  };
  const [advancedFilterRows, setAdvancedFilterRows] = useState<any[]>();

  const newFilter = (filterKey) => {
    setWarningDialog({
      dialogOpen: true,
      dialogTitle: 'Edit custom filter',
      dialogContentText: 'Choose an inclusive filter:',
      dialogActions: [
        {
          actionName: 'Cancel',
          actionOnClick: async () => {
            setWarningDialog({ ...warningDialog, dialogOpen: false });
          }
        },
        {
          actionName: 'Select and Create',
          usesChildren: true,
          children: (
            <FilterWizard
              filterKey={filterKey}
              setAllFilters={setAdvancedFilterRows}
              allFiltersBefore={advancedFilterRows}
              closeActionDialog={() => {
                setWarningDialog({ ...warningDialog, dialogOpen: false });
              }}
            />
          ),
          actionOnClick: async () => {},
          autoFocus: true
        }
      ]
    });
  };

  return (
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
                return (
                  <FilterRow filterField={r.filterField} filterValue={r.filterValue} filterKey={r.filterKey} key={i} />
                );
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
            <Button onClick={() => newFilter(undefined)} size={'small'} variant="contained">
              <AddBoxIcon></AddBoxIcon>Advanced Filter
            </Button>
            <Button onClick={() => setSave(Math.random())} size={'small'} variant="contained">
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
      <WarningDialog
        dialogOpen={warningDialog.dialogOpen}
        dialogTitle={warningDialog.dialogTitle}
        dialogActions={warningDialog.dialogActions}
        dialogContentText={warningDialog.dialogContentText}
      />
    </Box>
  );
};
export default ActivityGrid;
