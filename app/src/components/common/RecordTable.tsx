import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Theme,
  TableSortLabel,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { lighten } from '@mui/material';
import { ExpandMore, FilterList, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import clsx from 'clsx';
import { DEFAULT_PAGE_SIZE } from 'constants/database';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Spinner from '../../components/spinner/Spinner';
import { useInvasivesApi } from '../../hooks/useInvasivesApi';
import RootUISchemas from '../../rjsf/uiSchema/RootUISchemas';
import { useSelector } from '../../state/utilities/use_selector';
import { selectAuth } from '../../state/reducers/auth';

const ACTION_TIMEOUT = 1500; // 1.5s
const ACTION_ERROR_TIMEOUT = 15000; // 15s

const snakeToPascal = (string, spaces = false) =>
  string
    .split('/')
    .map((snake) =>
      snake
        .split('_')
        .map((substr) => substr.charAt(0).toUpperCase() + substr.slice(1))
        .join(spaces ? ' ' : '')
    )
    .join('/');

const arraysEqual = (a, b) => {
  if (a === b) return true;
  if (!a || !b) return true;
  if (a.length !== b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

const useStyles = makeStyles((theme: Theme) => ({
  component: {
    marginTop: '15px'
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1
  },
  paper: {
    textAlign: 'left',
    color: theme.palette.text.primary,
    flexDirection: 'column'
  },
  table: {
    minWidth: 750,
    width: 'auto',
    tableLayout: 'auto'
  },
  tableRow: {
    verticalAlign: 'top'
  },
  tableContainer: {
    display: 'table-row'
  },
  cell: {
    whiteSpace: 'nowrap',
    width: 1,
    borderBottom: 0
  },
  wideCell: {
    minWidth: 500,
    maxWidth: 500
  },
  missingValue: {
    fontStyle: 'italic',
    color: '#777'
  },
  header: {
    backgroundColor: 'rgba(0, 0, 0, 0.06)'
  },
  dropdown: {
    paddingBottom: 0,
    paddingTop: 0,
    paddingLeft: '1em'
  },
  dropdownCol: {
    width: 1
  },
  openRow: {
    overflow: 'inherit',
    whiteSpace: 'inherit',
    maxWidth: 600 // give it a bit more room to breathe,
    // but still shouldn't be too wide (has vertical space now)
  },
  closedRow: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    maxWidth: 350
  },
  emptyTable: {
    paddingLeft: 30,
    alignSelf: 'center'
  },
  button: {
    marginLeft: 10,
    marginRight: 10,
    whiteSpace: 'nowrap',
    minWidth: 'max-content'
  },
  numberCell: {
    align: 'right'
  },
  dateCell: {}
}));

const useToolbarStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1)
  },
  highlight:
    theme.palette.mode === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85)
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark
        },
  title: {
    flex: '1 1 100%',
    fontSize: theme.typography.pxToRem(18),
    fontWeight: theme.typography.fontWeightRegular,
    whiteSpace: 'nowrap'
  },
  toolbar: {
    justifyContent: 'start'
  },
  button: {
    marginLeft: 5,
    marginRight: 5,
    marginTop: 10,
    marginBottom: 10,
    whiteSpace: 'nowrap',
    minWidth: 'max-content'
  }
}));

const getValue = (row, header) => {
  const cell = row[header.id];
  const valueMap = header.valueMap;
  const numeric = header.type === 'number';
  switch (typeof cell) {
    case 'object':
      if (cell === null)
        // this might be worth throwing an error
        return null;
      if (Array.isArray(cell)) return cell.map((value) => valueMap[value] || value).join(' ');
      return valueMap[cell?.children] || cell?.children;
    case 'function':
      const result = cell(row);
      return valueMap[result] || result;
    case 'string':
    default:
      return numeric ? +valueMap[cell] || +cell : valueMap[cell] || cell;
  }
};

function stableSort(rows, header, ascending) {
  if (!header) return rows;
  const valueIndexPairs = rows.map((row, index) => [getValue(row, header), index, row]);
  valueIndexPairs.sort((a, b) => {
    if (a[0] > b[0]) return ascending ? 1 : -1;
    if (b[0] > a[0]) return ascending ? -1 : 1;
    // else sort by index
    return a[1] - b[1];
  });
  return valueIndexPairs.map((row) => row[2]);
}

/*
  OUTDATED:
  headers: an array of (string/numeric) values (or objects if you want to get fancy and define other object cell properties)
  rows: an array of arrays of columns, which can each contain (string/numeric) values or objects defining overrides to each cell
  dropdown: if defined, gives a function to build the content of a dropdown section for each row, based on the 'source' and the current column index
  pagination: object defining pagination settings, or just boolean true to use defaults.  No pagination if undefined/false
  startsOpen: boolean to set the dropdown of each row to open by default or not (default closed)
*/
export interface IRecordTable {
  rows?: any;
  referenceData?: boolean;
  totalRows?: number;
  headers?: Array<any>;
  tableName?: string;
  tableSchemaType?: any;
  expandable?: boolean;
  startExpanded?: boolean;
  rerenderFlagSetter?: any;
  keyField?: string;
  startingOrder?: string;
  startingOrderBy?: string;
  startingRowsPerPage?: number;
  rowsPerPageOptions?: Array<number>;
  densePadding?: boolean;
  padEmptyRows?: boolean;
  enableSelection?: boolean;
  selected?: Array<any>;
  setSelected?: (newSelected: Array<any>) => any;
  enableFiltering?: boolean;
  enableTooltips?: boolean;
  className?: any;
  dropdown?: (row: any) => any;
  dropdownLimit?: boolean;
  onToggleExpandRow?: (row: any, expandedRows?: Array<any>, selectedRows?: Array<any>) => any;
  overflowDropdown?: boolean;
  overflowLimit?: number;
  pagination?: any;
  actions?: any;
  rowActionStyle?: string;
  hideEmpty?: boolean;
}

const RecordTable: React.FC<IRecordTable> = (props) => {
  const classes = useStyles();
  const invasivesApi = useInvasivesApi();

  const {
    tableName = '',
    keyField = '_id', // defaults to doc _id used by PouchDB
    startingOrder = 'asc',
    // dropdown, // default none
    dropdownLimit = true,
    onToggleExpandRow, // callback fired when row is expanded (or contracted, for now)
    overflowDropdown = true, // overflow into a dropdown when a cell is very verbose
    overflowLimit = 50, // char limit
    // expandable = true,
    startExpanded = true,
    startingRowsPerPage = 10,
    rowsPerPageOptions = false, // disable ability to change rows per page by default
    enableSelection = false,
    enableFiltering = false,
    enableTooltips = true,
    pagination = 'overflow', // by default, only shows paging options when more total rows than can fit on page 1
    // className: tableClassName,
    densePadding = false,
    padEmptyRows = false, // whitespace added to make the table the same height
    // even on the last page with only e.g. 1 row
    rowActionStyle = 'dropdown', // || 'column'
    hideEmpty = false
  } = props;

  const [rowsLoaded, setRowsLoaded] = useState(false);
  const { startingOrderBy = props.headers.length ? props.headers[0].id : 'id' } = props; // defaults to the first header
  const [order, setOrder] = useState(startingOrder);
  const [orderBy, setOrderBy] = useState(startingOrderBy);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(startingRowsPerPage);

  // Handle selective loading of only a portion of the total rows:
  const [rows, setRows] = useState(Array.isArray(props.rows) ? props.rows : []);
  const [totalRows, setTotalRows] = useState(props.totalRows ? props.totalRows : rows.length);
  const [loadedRowsOffset, setLoadedRowsOffset] = useState(0);
  const loadBuffer = 2;
  const { authenticated } = useSelector(selectAuth);

  useEffect(() => {
    setRows(Array.isArray(props.rows) ? props.rows : []);
    setTotalRows(props.totalRows ? props.totalRows : props.rows.length);
  }, [props.totalRows, Array.isArray(props.rows) && props.rows?.length, props.rows]);

  const fetchRows = async () => {
    // console.log('fetchRows start: ', tableName);
    if (props.rows instanceof Function) {
      if (
        rows.slice(
          // dont set loading indicator yet if you still have data visible
          page * rowsPerPage - loadedRowsOffset,
          (page + 1) * rowsPerPage - loadedRowsOffset
        ).length < rowsPerPage
      )
        await setRowsLoaded(false);
      const result = await props.rows({
        page: Math.max(0, page - loadBuffer),
        rowsPerPage: rowsPerPage,
        order: [orderBy + ' ' + order]
      });

      // console.log('fetchRows: ', result);
      if (result) {
        await setRows(result.rows);
        await setTotalRows(parseInt(result.count));
        // offset from a couple pages back to avoid
        await setLoadedRowsOffset(Math.max(0, (page - loadBuffer) * rowsPerPage));
      }
    }
    await setRowsLoaded(true);
  };

  useEffect(() => {
    fetchRows();
  }, [
    Math.max(0, page - loadBuffer) * rowsPerPage <= loadedRowsOffset && page, // look two pages behind
    Math.min(totalRows, page + 1 + loadBuffer) * rowsPerPage > loadedRowsOffset + rows.length && page, // look two pages ahead
    rowsPerPage,
    orderBy,
    order,
    loadedRowsOffset,
    rows.length
  ]);

  const dropdown = useCallback((row) => !!props.dropdown && props.dropdown(row), [!!props.dropdown]);
  const tableSchemaType = useMemo(() => props.tableSchemaType, [props.tableSchemaType?.length]);
  const [schemas, setSchemas] = useState<{ schema: any; uiSchema: any }>({ schema: null, uiSchema: null });
  const [schemasLoaded, setSchemasLoaded] = useState(false);
  const headers = useMemo(() => {
    let headers2;
    if (props.headers) headers2 = props.headers;
    else headers2 = rows.length ? Object.keys(rows[0]) : [];
    return headers2.map((header: any, i) => {
      let headerOverrides;
      let id;
      if (typeof header === 'string' || typeof header === 'number') {
        id = header || i;
        headerOverrides = {
          id: id
        };
      }
      if (typeof header === 'object') {
        id = header.id || i;
        headerOverrides = {
          // defaults:
          id: id,
          align: header.type === 'number' ? 'right' : 'left',
          padding: 'normal',
          defaultOrder: 'asc',
          ...header
        };
      }
      if (!headerOverrides) {
        throw new Error('Table header not defined correctly - must be a string, number or object');
      }
      const headerSchema = schemas?.schema?.properties?.[id];
      const valueMap = {};
      schemas?.schema?.properties?.[id]?.anyOf?.forEach((value) => {
        if (value.enum[0] && value.title) {
          valueMap[value.enum[0]] = value.title;
        }
      });

      return {
        title: snakeToPascal(id, true),
        ...headerSchema,
        valueMap: {
          ...valueMap,
          ...headerOverrides.valueMap
        },
        tooltip: headerSchema?.['x-tooltip-text'],
        ...headerOverrides
      };
    });
  }, [rows, props.headers?.length, schemasLoaded]);
  const actions = { ...props.actions };
  const rowActions: Array<any> = Object.values(actions).filter((action: any) => action.enabled && action.rowAction);

  const [expandedRows, setExpandedRows] = useState([]);
  const [selected, setSelected] = useState(props.selected || []);
  const selectedHash = JSON.stringify(selected);

  const getApiSpec = useCallback(
    async (tableSchemaInput) => {
      const apiSpecResponse = await invasivesApi.getCachedApiSpec();
      const schemaTypeList = typeof tableSchemaInput === 'string' ? [tableSchemaInput] : tableSchemaInput || [];

      await setSchemas({
        schema: schemaTypeList.reduce(
          (prevSchema, schemaType) => ({
            ...prevSchema,
            properties: {
              ...prevSchema.properties,
              ...apiSpecResponse?.components?.schemas[schemaType]?.properties
            }
          }),
          {}
        ),
        uiSchema: schemaTypeList.reduce(
          (prevSchema, schemaType) => ({
            ...prevSchema,
            ...RootUISchemas[schemaType]
          }),
          {}
        )
      });
      setSchemasLoaded(true);
    },
    [tableSchemaType]
  );

  useEffect(() => {
    if (authenticated) {
      getApiSpec(tableSchemaType);
    }
  }, [tableSchemaType, authenticated]);

  useEffect(() => {
    setSelected(props.selected || []);
  }, [JSON.stringify(props.selected)]);

  useEffect(() => {
    if (props.setSelected) props.setSelected(selected);
  }, [selectedHash]);

  const selectedRows = useMemo(
    () =>
      selected
        .map((id) => {
          const matches = rows.find((row) => row[keyField] === id);
          return matches ? matches : undefined;
        })
        .filter((row) => row),
    [selectedHash, rows]
  );

  // sort and limit the rows:
  const orderHeader = useMemo(() => headers.find((col) => col.id === orderBy), [headers, orderBy]);
  const pageRows = useMemo(() => {
    // Note: this is O(nlog(n)) so important that we cache this with useMemo
    return stableSort(rows, orderHeader, order === 'asc').slice(
      page * rowsPerPage - loadedRowsOffset,
      page * rowsPerPage + rowsPerPage - loadedRowsOffset
    );
  }, [rows.length, orderHeader, order, page, rowsPerPage]);
  // render all dropdowns on page
  const renderedDropdowns = useMemo(
    () => pageRows.map((row) => (dropdown ? dropdown(row) : undefined)),
    [pageRows, dropdown]
  );
  // search for any potential overflows (fields too long).
  // This returns a list of booleans whether each row overflows
  const verboseOverflows = useMemo(
    () => pageRows.map((row) => headers.filter(({ id }) => String(row[id]).length > overflowLimit).length > 0),
    [pageRows, headers, overflowLimit]
  );
  // determine if any rows on the current page have a dropdown:
  const pageHasDropdown = useMemo(
    () =>
      (!!dropdown && renderedDropdowns.filter((x) => x).length > 0) ||
      (overflowDropdown && verboseOverflows.filter((x) => x).length > 0) ||
      (rowActions?.length > 0 && rowActionStyle === 'dropdown'),
    [dropdown, renderedDropdowns, overflowDropdown, verboseOverflows, rowActions?.length, rowActionStyle]
  );
  const showPagination = pagination === 'overflow' ? totalRows > rowsPerPage : !!pagination;

  const handleRequestSort = useCallback(
    (event, property) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
      setPage(0);
    },
    [orderBy, order]
  );

  const handleSelectAllClick = useCallback(
    async (event) => {
      if (event.target.checked) {
        let newSelecteds;
        if (Array.isArray(props.rows)) newSelecteds = rows.map((row) => row[keyField]);
        else {
          if (totalRows >= DEFAULT_PAGE_SIZE) return; // Sanity check, this should be disabled anyway
          const allRecords = await props.rows({ page: 0, rowsPerPage: 0 }); // will need to filter this when implemented
          newSelecteds = allRecords.rows.map((row) =>
            row.point_of_interest_id ? 'POI' + row.point_of_interest_id : row.activity_id
          );
        }
        setSelected(newSelecteds);
        return;
      }
      setSelected([]);
    },
    [rows]
  );

  const selectRow = useCallback((prevSelected, key) => {
    const selectedIndex = prevSelected.indexOf(key);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(prevSelected, key);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(prevSelected.slice(1));
    } else if (selectedIndex === prevSelected.length - 1) {
      newSelected = newSelected.concat(prevSelected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(prevSelected.slice(0, selectedIndex), prevSelected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, totalRows - page * rowsPerPage);

  const toggleExpandedRow = useCallback(
    (key) => {
      let newExpandedRows;
      if (expandedRows.indexOf(key) !== -1) {
        newExpandedRows = expandedRows.filter((rowKey) => rowKey !== key);
      } else {
        if (dropdownLimit) {
          // only supports dropdown limit of 0-1 here
          newExpandedRows = [key];
        } else newExpandedRows = [...expandedRows, key];
      }
      setExpandedRows(newExpandedRows);
      if (onToggleExpandRow)
        onToggleExpandRow(
          pageRows.find((row) => row[keyField] === key),
          newExpandedRows,
          selectedRows
        );
    },
    [expandedRows?.length, JSON.stringify(expandedRows), dropdownLimit, selectedRows, pageRows]
  );

  const CachedTableHead = useMemo(
    () => (
      <RecordTableHead
        classes={classes}
        numSelected={selected.length}
        order={order}
        orderBy={orderBy}
        onSelectAllClick={handleSelectAllClick}
        onRequestSort={handleRequestSort}
        totalRows={totalRows}
        headers={headers}
        enableSelection={enableSelection}
        enableTooltips={enableTooltips}
        pageHasDropdown={pageHasDropdown}
      />
    ),
    [
      selected?.length,
      order,
      orderBy,
      handleSelectAllClick,
      handleRequestSort,
      totalRows,
      headers,
      enableSelection,
      enableTooltips,
      pageHasDropdown
    ]
  );

  const loading = (!schemasLoaded && tableSchemaType?.length > 0) || !rowsLoaded;

  const rendered = useMemo(
    () => (
      <div className={classes.component}>
        <Accordion defaultExpanded={startExpanded}>
          {(enableSelection || enableFiltering || tableName.length > 0) && (
            <RecordTableToolbar
              selectedRows={enableSelection ? selectedRows : []}
              tableName={tableName}
              enableFiltering={enableFiltering}
              actions={actions}
              // databaseContext={databaseContext}
              fetchRows={fetchRows}
            />
          )}
          <AccordionDetails className={classes.paper}>
            {loading && (
              <div className={classes.emptyTable}>
                <Spinner />
              </div>
            )}
            {!loading && !totalRows && <div className={classes.emptyTable}>No data to display</div>}
            {!!totalRows && (
              <TableContainer>
                <Table
                  className={classes.table}
                  aria-labelledby="tableTitle"
                  size={densePadding ? 'small' : 'medium'}
                  aria-label="enhanced table">
                  {CachedTableHead}
                  <TableBody>
                    {pageRows.map((row, index) => (
                      <RecordTableRow
                        key={row[keyField]}
                        keyField={keyField}
                        headers={headers}
                        row={row}
                        dropdown={dropdown}
                        pageHasDropdown={pageHasDropdown}
                        hasOverflow={verboseOverflows[index]}
                        isExpanded={expandedRows.indexOf(row[keyField]) !== -1}
                        isSelected={selected.indexOf(row[keyField]) !== -1}
                        enableSelection={enableSelection}
                        toggleExpanded={(event) => {
                          event.stopPropagation();
                          toggleExpandedRow(row[keyField]);
                        }}
                        toggleSelected={(event) => {
                          event.stopPropagation();
                          selectRow(selected, row[keyField]);
                        }}
                        actions={rowActions}
                        actionStyle={rowActionStyle}
                        //   databaseContext={databaseContext}
                        fetchRows={fetchRows}
                      />
                    ))}
                    {padEmptyRows && emptyRows > 0 && (
                      <TableRow style={{ height: (densePadding ? 33 : 53) * emptyRows }}>
                        <TableCell colSpan={headers.length} />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {!!totalRows && showPagination && (
              <TablePagination
                rowsPerPageOptions={rowsPerPageOptions === false ? undefined : rowsPerPageOptions}
                component="div"
                count={totalRows}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            )}
          </AccordionDetails>
        </Accordion>
      </div>
    ),
    [
      loading,
      JSON.stringify(pageRows),
      totalRows,
      schemasLoaded,
      page,
      rowsPerPage,
      selectedHash,
      JSON.stringify(expandedRows),
      order,
      orderBy
    ]
  );

  if (hideEmpty && (!totalRows || loading)) return null;
  else return rendered;
};

function RecordTableHead(props) {
  const {
    classes,
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    totalRows,
    onRequestSort,
    headers,
    pageHasDropdown,
    enableSelection,
    enableTooltips
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead className={classes.header}>
      <TableRow>
        {(enableSelection || pageHasDropdown) && (
          <TableCell padding="checkbox" className={classes.cell}>
            {enableSelection && totalRows < DEFAULT_PAGE_SIZE && (
              // disable Select-All for huge row counts (for now)
              <Checkbox
                indeterminate={numSelected > 0 && numSelected < totalRows}
                checked={totalRows > 0 && numSelected === totalRows}
                onChange={onSelectAllClick}
                inputProps={{ 'aria-label': 'select all desserts' }}
              />
            )}
            {pageHasDropdown && <IconButton aria-label="expand row" size="small" />}
          </TableCell>
        )}
        {headers.map((headCell) => (
          <TableCell
            key={headCell.id}
            padding={headCell.padding}
            align={headCell.align}
            sortDirection={orderBy === headCell.id ? order : false}
            className={`${classes.cell} ${headCell.className}`}>
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : headCell.defaultOrder}
              onClick={createSortHandler(headCell.id)}>
              {enableTooltips && !!headCell.tooltip && (
                <Tooltip title={headCell.tooltip} arrow>
                  <div>{headCell.title}</div>
                </Tooltip>
              )}
              {!headCell.tooltip && headCell.title}
              {orderBy === headCell.id && (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              )}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const RecordTableToolbar = (props) => {
  const classes = useToolbarStyles();
  const { selectedRows, tableName, enableFiltering, actions, databaseContext, fetchRows } = props;
  const numSelected = selectedRows?.length || 0;

  const [actionError, setActionError] = useState(props.actionError || '');

  const bulkActions: Array<any> = Object.values(actions)
    .filter((action: any) => action.enabled && action.bulkAction)
    .map((action: any) => {
      const isValid = action.bulkCondition ? action.bulkCondition(selectedRows) : true;
      if ((!action.displayInvalid || action.displayInvalid === 'hidden') && !isValid) return null;
      return (
        <Button
          key={action.key}
          variant="contained"
          color="primary"
          size="small"
          disabled={action.displayInvalid === 'disable' && !isValid}
          className={classes.button}
          startIcon={action.icon}
          onClick={async (e) => {
            e.stopPropagation();
            try {
              if (
                action.displayInvalid === 'error' &&
                // error if bulk condition fails or if any row's condition fails
                ((action.bulkCondition && !action.bulkCondition(selectedRows)) ||
                  (action.rowCondition && selectedRows.filter((row) => !action.rowCondition(row))?.length)) &&
                action.invalidError
              )
                throw action.invalidError;
              await action.action(selectedRows);
              if (action.triggerReload) setTimeout(fetchRows, ACTION_TIMEOUT);
            } catch (error) {
              setActionError(error?.message || error);
              setTimeout(() => setActionError(''), ACTION_ERROR_TIMEOUT);
            }
          }}>
          {action.label}
        </Button>
      );
    })
    .filter((button) => button); // remove hidden actions

  const globalActions: Array<any> = Object.values(actions)
    .filter((action: any) => action.enabled && action.globalAction)
    .map((action: any) => {
      const isValid = action.globalCondition ? action.globalCondition(selectedRows) : true;
      if ((!action.displayInvalid || action.displayInvalid === 'hidden') && !isValid) return null;
      return (
        <Button
          key={action.key}
          variant="contained"
          size="small"
          disabled={action.displayInvalid === 'disable' && !isValid}
          className={classes.button}
          startIcon={action.icon}
          onClick={async (e) => {
            e.stopPropagation();
            try {
              if (
                action.displayInvalid === 'error' &&
                // error if bulk condition fails or if any row's condition fails
                ((action.globalCondition && !action.globalCondition(selectedRows)) ||
                  (action.bulkCondition && !action.bulkCondition(selectedRows)) ||
                  (action.rowCondition && selectedRows.filter((row) => !action.rowCondition(row))?.length)) &&
                action.invalidError
              )
                throw action.invalidError;
              await action.action(selectedRows);
              if (action.triggerReload) setTimeout(fetchRows, ACTION_TIMEOUT);
            } catch (error) {
              setActionError(error?.message || error);
              setTimeout(() => setActionError(''), ACTION_ERROR_TIMEOUT);
            }
          }}>
          {action.label}
        </Button>
      );
    })
    .filter((button) => button); // remove hidden actions

  return (
    <AccordionSummary
      classes={{ content: classes.toolbar }}
      expandIcon={<ExpandMore />}
      aria-controls="panel-map-content"
      id="panel-map-header">
      <Toolbar
        className={clsx(classes.root, {
          [classes.highlight]: numSelected > 0
        })}>
        <Box>
          {numSelected > 0 ? (
            <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
              {numSelected} selected
            </Typography>
          ) : (
            <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
              {tableName}
            </Typography>
          )}
          {numSelected > 0 && bulkActions}
        </Box>
        {numSelected > 0 && actionError}
      </Toolbar>
      {enableFiltering && !numSelected && (
        <Tooltip title="Filter list">
          <IconButton aria-label="filter list">
            <FilterList />
          </IconButton>
        </Tooltip>
      )}
      <Box>{globalActions}</Box>
    </AccordionSummary>
  );
};

const RecordTableCell = ({ row, header, className, valueMap }) => {
  const ifApplicable = (val) => (typeof val === 'string' || (!isNaN(val) && String(val).trim().length) ? val : ' N/A');
  const id = header.id;

  let overrideProps;
  if (typeof row[id] === 'object' && !Array.isArray(row[id])) overrideProps = row[id];
  const value = getValue(row, header);

  return (
    <TableCell
      component="th"
      scope="row"
      align={header.align}
      padding={header.padding}
      className={className}
      {...overrideProps}>
      {ifApplicable(value)}
    </TableCell>
  );
};

const RecordTableRow = (props) => {
  const {
    keyField,
    headers,
    row,
    isExpanded,
    toggleExpanded,
    enableSelection,
    isSelected,
    toggleSelected,
    pageHasDropdown,
    dropdown,
    hasOverflow,
    actions,
    actionStyle,
    databaseContext,
    fetchRows
  } = props;
  const classes = useStyles();

  const [actionError, setActionError] = useState(props.actionError || '');

  const key = row[keyField];
  if (key === undefined) throw new Error('Error: table row has no matching key defined: ' + keyField);

  const renderedDropdown = !!dropdown && dropdown(row);
  const labelId = `record-table-checkbox-${key}`;
  const rowActions = actions
    .map((action: any) => {
      const isValid = action.rowCondition ? action.rowCondition(row) : true;
      if ((!action.displayInvalid || action.displayInvalid === 'hidden') && !isValid) return null;
      return (
        <Button
          key={action.key}
          variant="contained"
          color="primary"
          size="small"
          disabled={action.displayInvalid === 'disable' && !isValid}
          className={classes.button}
          startIcon={action.icon}
          onClick={async (e) => {
            e.stopPropagation();
            try {
              if (
                action.displayInvalid === 'error' &&
                action.rowCondition &&
                !action.rowCondition(row) &&
                action.invalidError
              )
                throw action.invalidError;
              await action.action([row]);
              // await console.log('action ', action.key);
              if (action.triggerReload) setTimeout(fetchRows, ACTION_TIMEOUT);
            } catch (error) {
              setActionError(error?.message || error);
              setTimeout(() => setActionError(''), ACTION_ERROR_TIMEOUT);
            }
          }}>
          {action.label}
        </Button>
      );
    })
    .filter((button) => button); // remove hidden actions
  const rowHasDropdown = !!renderedDropdown || (actionStyle === 'dropdown' && rowActions?.length > 0);

  return (
    <React.Fragment key={key}>
      <TableRow
        hover
        role="checkbox"
        aria-checked={isSelected}
        tabIndex={-1}
        selected={isSelected}
        onClick={toggleExpanded}>
        {(enableSelection || pageHasDropdown) && (
          <TableCell padding="checkbox" className={classes.cell}>
            {enableSelection && (
              <Checkbox checked={isSelected} onClick={toggleSelected} inputProps={{ 'aria-labelledby': labelId }} />
            )}
            {pageHasDropdown && (
              <IconButton aria-label="expand row" size="small">
                {(rowHasDropdown || hasOverflow) && (isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />)}
              </IconButton>
            )}
          </TableCell>
        )}
        {headers.map((header) => (
          <RecordTableCell
            header={header}
            key={header.id}
            row={row}
            className={`
            ${classes.cell}
            ${header.className}
            ${header.type === 'number' && classes.numberCell}
            ${hasOverflow && (isExpanded ? classes.openRow : classes.closedRow)}
          `}
            valueMap={header.valueMap}
          />
        ))}
      </TableRow>
      {rowHasDropdown && (
        <TableRow className={classes.tableRow}>
          <TableCell className={classes.dropdown} colSpan={100}>
            <Collapse in={isExpanded} timeout="auto">
              <Box>
                {actionStyle === 'dropdown' && rowActions?.length > 0 && rowActions}
                <span style={{ color: '#ff9533' }}>{actionError}</span>
              </Box>
              <Box margin={2}>{renderedDropdown}</Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
};

export default RecordTable;
