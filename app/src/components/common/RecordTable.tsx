import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  Collapse,
  IconButton,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Tooltip,
  Typography
} from '@material-ui/core';
import { lighten } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import { DEFAULT_PAGE_SIZE } from 'constants/database';
import { KeyboardArrowUp, KeyboardArrowDown, ExpandMore, FilterList } from '@material-ui/icons';
import { notifyError } from '../../utils/NotificationUtils';
import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { DatabaseContext } from '../../contexts/DatabaseContext';
import RootUISchemas from '../../rjsf/uiSchema/RootUISchemas';
import { useInvasivesApi } from '../../hooks/useInvasivesApi';
import Spinner from '../../components/spinner/Spinner';
import clsx from 'clsx';
import { useDataAccess } from '../../hooks/useDataAccess';

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

const useStyles = makeStyles((theme) => ({
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

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1)
  },
  highlight:
    theme.palette.type === 'light'
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
    whiteSpace: 'nowrap',
    minWidth: 200
  },
  toolbar: {
    justifyContent: 'start'
  },
  button: {
    marginLeft: 10,
    marginRight: 10,
    marginTop: 20,
    marginBottom: 20,
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

export interface IRecordTable {
  // GENERAL 
  // keyField: field to use in each row as a key
  keyField?: string;
  // tableName: title of the table
  tableName?: string;

  // HEADERS / COLUMNS
  // headers: list of columns to display for a given table and their behavior definitions 
  // can just be an array of string keys (which will be auto-interpretted into matching schema fields)
  // or object defining overrides to those default fields
  headers?: any[];
  // tableSchemaType: list of schema types to match against to auto-fill column definitions with api-docs schemas
  // Note: this behavior should probably be bumped up a level and defined outside of RecordTable, modifying the headers here
  tableSchemaType?: Array<string>;
  
  // ROWS
  // rows: an array of row objects with column key-value pairs.
  // OR a function telling the table how to fetch those rows from the DB, given an object defining its particular page, rowsPerPage, and order (and filters once implemented)
  // note: order must be an array of strings in the form "field_to_order_by order_direction" where order_direction is ASC or DESC
  rows?: any;

  // referenceData: mark whether the rows are references or not
  referenceData?: boolean;
  rerenderFlagSetter?: any;
  
  // ACTIONS:
  // key-value pairs of definitions of various actions which can be used on the table. e.g. delete, edit, create, etc
  // OR boolean "false" to disable all actions
  actions?: any;
  // rowActionStyle: whether to display row action buttons in a dropdown in each row, or to display inline in a column at the start or end of the row. (Inline not implemented yet) 
  rowActionStyle?: ActionStyle;
  
  // DROPDOWN / EXPAND ROW
  // dropdown: AKA expand content. function outputting the component which is rendered by a particular row when it is clicked. 
  //  If this returns undefined there will be no dropdown content.  Note that a row might still be expandable
  //  IF it has row action buttons (unless we're rendering them inline on the row, which isnt supported yet)
  //  OR if some column in the row has reached its overflow character limit (e.g. a very long description column)
  dropdown?: (row: any) => any;
  // dropdownLimit: whether to only allow a single dropdown open at a time, auto-closing the previous one once a new row is clicked
  dropdownLimit?: boolean;
  // onToggleRowDropdown: function to call when a row is expanded, allowing signals to parent components when it happens (e.g. to update the map or the rest of a page)
  onToggleRowDropdown?: (row: any, expandedRows?: Array<any>, selectedRows?: Array<any>) => any;
  // overflowLimit: whether to set a character limit on any particular cell
  //  if over the limit it's truncated with an ellipsis (...) and the full text will be displayed only when the row is expanded into a dropdown.
  //  0 for no limit
  overflowLimit?: number;

  // SELECTION
  // enableSelection: show/hide selection checkbox on each row, and presence of multi-select options (bulk edit, delete, etc)
  enableSelection?: boolean;
  // selected: currently selected rows override.  If undefined, will be managed by the RecordTable component.  Used for coordinating with the map page
  selected?: Array<any>;
  // setSelected: override function to call when a row is selected, to pass to parent components
  setSelected?: (newSelected: Array<any>) => any;
  
  // PAGINATION:
  // pagination: whether to always show pagination, or only when there are too many rows to fit in one page (overflow)
  // OR false to disable pagination
  pagination?: boolean | PaginationTypes;
  // startingOrder: default order
  startingOrder?: string;
  // startingOrderBy: default orderBy
  startingOrderBy?: string;
  // startingRowsPerPage: default rowsPerPage, should be one of rowsPerPageOptions
  startingRowsPerPage?: number;
  // rowsPerPageOptions: dropdown list of numbers of rows per page to offer.  e.g. [10, 25, 50]
  rowsPerPageOptions?: Array<number>;

  // FILTERING (under construction)
  // enableFiltering: not implemented yet, but will enable ability to access a filter menu
  enableFiltering?: boolean;
  
  // GENERAL DISPLAY:
  // expandable: allow the entire RecordTable to be grown/shrunk on click of the title text.  Not to be confused with expandRow which allows grow/shrink for each row
  expandable?: boolean;
  // startExpanded: default starting expanded state
  startExpanded?: boolean;  
  // enableTooltips: show/hide mouseover tooltips on each header, displaying detailed descriptions
  enableTooltips?: boolean;
  // hideEmpty: whether to display the table at all if it has no content
  hideEmpty?: boolean;
  // padEmptyRows: whether the table should create whitespace on the last page up to its rowsPerPage limit in order to preserve the same height between all pages
  padEmptyRows?: boolean;
  // densePadding: legacy passthrough setting enabling a more condensed css look
  densePadding?: boolean;
}


// action: look and feel, context, and click effect definitions for a button (or other actions in future e.g. sliders)  
export interface IRecordTableAction {
  // key: self-reflection so an action object knows the key it's being refered as. e.g. "edit"
  key: string;
  // enabled: if false, will hide action entirely.  Useful for defining actions generally for all RecordTable instances but only enabling them in appropriate contexts
  enabled?: boolean;
  // label: english text to display on buttons. e.g. "Edit Activity"
  label: string;
  // icon: icon to accompany label in button content
  icon?: any;
  // action: function to call when an action is clicked.  If it's a "bulk" or "global" action, it will apply to all currently-selected rows in the table.
  // If it's a "row" action, it will apply to only the current row being clicked and "selectedRows" will be length 1.
  // This single-definiton is useful since usually what you want to do for all selected rows is the same as a single row.
  action: (selectedRows: Array<any>) => any;
  // displayInvalid: what to do when an action is invalid (e.g. it fails its rowCondition check)
  displayInvalid?: DisplayInvalid;
  // invalidError: default message to display when the action is invalid and displayInvalid = 'error'.
  // Note that customized errors can be thrown by the actual action() function which may be more descriptive to what went wrong
  invalidError?: string;
  // rowAction: whether to present this action as a button in each row
  rowAction?: boolean;
  // rowCondition: function determining whether the action is valid in a row.  e.g. if only some rows allow this particular action.
  // displayInvalid determines behavior when it returns false.   Not needed if rowAction is false (disabled).
  rowCondition?: (selectedRows: Array<any>) => boolean;
  // bulkAction: whether to present this action as a button when a user has selected one or more rows (e.g. bulk edits/deletes)
  bulkAction?: boolean;
  // rowCondition: function determining whether the action is valid for the given selected rows.  e.g. if they must all be a certain type
  // displayInvalid determines behavior when it returns false.  Not needed if bulkAction is false (disabled).
  bulkCondition?: (selectedRows: Array<any>) => boolean;
  // globalAction: whether to present this action as a button in the toolbar, regardless of selected rows (usually used for "create" actions)
  globalAction?: boolean;
  // rowCondition: function determining whether the action is valid in the toolbar.
  // displayInvalid determines behavior when it returns false.  Not needed if globalAction is false (disabled).
  globalCondition?: (selectedRows: Array<any>) => boolean;
  //
};

// header: column behavior of 
export interface IRecordTableHeader {
  // GENERAL:
  // id: the key the header is refered to as e.g. "activity_id"
  id: string;
  // title: english name of the column.  Will default to the id converted to Capitalized Case
  title?: string;
  // defaultOrder: order to sort the column by on first click (ASC or DESC). Default ASC
  defaultOrder?: string;
  // valueMap: key-value pairs mapping initial values to refined values, used for e.g. mapping short codes to their full names 
  valueMap?: {
    [key: string]: string
  };
  // tooltip: string description of the given header, displayed on mouseover if tooltips are enabled on the table
  tooltip?: string;

  // STYLE:
  // className: style class
  className?: any;
  // type: if === 'number', will display values in the column with right-aligned style and decimal rounding.  'align' field overrides
  type?: string;
  // align: overrides 'type' and allows setting alignment of a column's contents
  align?: string;
  // padding: legacy padding override
  padding?: any;
};

enum ActionStyle { dropdown = 'dropdown', start = 'start', end = 'end' };
enum PaginationTypes { overlow = 'overflow', always = 'always' };
enum DisplayInvalid {
  disable = 'disable', // grey-out the action button and make it unclickable
  hidden = 'hidden', // hide the action button
  error = 'error' // show the action button as normal, but display an error on click
};


const RecordTable: React.FC<IRecordTable> = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const databaseContext = useContext(DatabaseContext);
  const dataAccess = useDataAccess();

  const {
    // dropdown, // default none
    densePadding = false,
    dropdownLimit = true,
    enableFiltering = false,
    enableSelection = false,
    enableTooltips = true,
    expandable = true,
    hideEmpty = false,
    keyField = '_id', // defaults to doc _id used by PouchDB
    onToggleRowDropdown, // callback fired when row is expanded (or contracted, for now)
    overflowLimit = 50, // char limit
    padEmptyRows = false, // whitespace added to make the table the same height (even on the last page with only e.g. 1 row)
    pagination = 'overflow', // by default, only shows paging options when more total rows than can fit on page 1
    rowActionStyle = 'dropdown', // || 'column'
    rowsPerPageOptions = undefined, // disable ability to change rows per page by default
    startExpanded = true,
    startingOrder = 'asc',
    startingRowsPerPage = 10,
    tableName = '',
  } = props;

  const [rowsLoaded, setRowsLoaded] = useState(false);
  const { startingOrderBy = props.headers.length ? props.headers[0].id : 'id' } = props; // defaults to the first header
  const [order, setOrder] = useState(startingOrder);
  const [orderBy, setOrderBy] = useState(startingOrderBy);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(startingRowsPerPage);

  // Handle selective loading of only a portion of the total rows:
  const [rows, setRows] = useState(Array.isArray(props.rows) && props.rows || []);
  const [totalRows, setTotalRows] = useState(Array.isArray(props.rows) && rows.length || 0);
  const [loadedRowsOffset, setLoadedRowsOffset] = useState(0);
  const [toolbarErrorMessage, setToolbarErrorMessage] = useState();
  const loadBuffer = 2;

  useEffect(() => {
    setRows(Array.isArray(props.rows) && props.rows || []);
    setTotalRows(Array.isArray(props.rows) && props.rows?.length || 0);
  }, [Array.isArray(props.rows) && props.rows?.length]);

  /*
  Function to populate "rows" in the table when props.rows is given as a function instead of a simple array
  Pages data for the given order.  Will need to include filters in this as well in future iterations
  */
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
        await setTotalRows(result.count);
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
      const apiSpecResponse = await dataAccess.getCachedApiSpec();
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
    getApiSpec(tableSchemaType);
  }, [tableSchemaType]);

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
    () => pageRows.map((row) => headers.filter(({ id }) => overflowLimit && String(row[id]).length > overflowLimit).length > 0),
    [pageRows, headers, overflowLimit]
  );
  // determine if any rows on the current page have a dropdown:
  const pageHasDropdown = useMemo(
    () =>
      (!!dropdown && renderedDropdowns.filter((x) => x).length > 0) ||
      (verboseOverflows.filter((x) => x).length > 0) ||
      (rowActions?.length > 0 && rowActionStyle === 'dropdown'),
    [dropdown, renderedDropdowns, verboseOverflows, rowActions?.length, rowActionStyle]
  );
  const showPagination = pagination === 'overflow' ? totalRows > rowsPerPage : !!pagination;

  const onRequestSort = useCallback(
    (event, property) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
      setPage(0);
    },
    [orderBy, order]
  );

  const onSelectAllClick = useCallback(
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

  const onPageChange = (event, newPage) => {
    setPage(newPage);
  };

  const onRowsPerPageChange = (event) => {
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
          // only supports dropdown limit of 0 or 1 here
          newExpandedRows = [key];
        } else newExpandedRows = [...expandedRows, key];
      }
      setExpandedRows(newExpandedRows);
      if (onToggleRowDropdown)
        onToggleRowDropdown(
          pageRows.find((row) => row[keyField] === key),
          newExpandedRows,
          selectedRows
        );
    },
    [expandedRows?.length, JSON.stringify(expandedRows), dropdownLimit, selectedRows, pageRows]
  );

  const loading = (!schemasLoaded && tableSchemaType?.length > 0) || !rowsLoaded;

  const rendered = useMemo(
    () => (
      <div className={classes.component}>
        <Accordion defaultExpanded={startExpanded}>
          {(enableSelection || enableFiltering || tableName.length > 0) && (
            <RecordTableToolbar
              selectedRows={enableSelection ? selectedRows : []}
              errorMessage={toolbarErrorMessage}
              setErrorMessage={setToolbarErrorMessage}
              {...{tableName, enableFiltering, actions, databaseContext, fetchRows}}
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
                  <RecordTableHead
                    totalSelected={selected.length}
                    {...{ classes, order, orderBy, onSelectAllClick, onRequestSort, totalRows, headers, enableSelection, enableTooltips, pageHasDropdown }}
                  />
                  <TableBody>
                    {pageRows.map((row, index) => (
                      <RecordTableRow
                        key={row[keyField]}
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
                        {...{keyField, headers, row, dropdown, pageHasDropdown, enableSelection, databaseContext, fetchRows}}
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
                component="div"
                count={totalRows}
                {...{rowsPerPageOptions, rowsPerPage, page, onPageChange, onRowsPerPageChange}}
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

  if (hideEmpty && (!totalRows || loading)) return null
  else return rendered;
};

function RecordTableHead(props) {
  const {
    classes,
    onSelectAllClick,
    order,
    orderBy,
    totalSelected,
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
                indeterminate={totalSelected > 0 && totalSelected < totalRows}
                checked={totalRows > 0 && totalSelected === totalRows}
                onChange={onSelectAllClick}
                inputProps={{ 'aria-label': 'select all' }}
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
  const { selectedRows, tableName, enableFiltering, actions, databaseContext, fetchRows, errorMessage, setErrorMessage } = props;
  const totalSelected = selectedRows?.length || 0;

  const bulkActions: Array<any> = Object.values(actions)
    .filter((action: any) => action.enabled && action.bulkAction)
    .map((action: any) => {
      const isValid = action.bulkCondition ? action.bulkCondition(selectedRows) : true;
      if ((!action.displayInvalid || action.displayInvalid === 'hidden') && !isValid) return;
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
                throw new Error(action.invalidError);
              await action.action(selectedRows);
              if (action.triggerReload) setTimeout(fetchRows, ACTION_TIMEOUT);
            } catch (error) {
              setErrorMessage(error?.message || error);
              setTimeout(() => setErrorMessage(''), ACTION_ERROR_TIMEOUT);
              notifyError(databaseContext, error?.message || error || action.invalidError);
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
      if ((!action.displayInvalid || action.displayInvalid === 'hidden') && !isValid) return;
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
                throw new Error(action.invalidError);
              await action.action(selectedRows);
              if (action.triggerReload) setTimeout(fetchRows, ACTION_TIMEOUT);
            } catch (error) {
              setErrorMessage(error?.message || error);
              setTimeout(() => setErrorMessage(''), ACTION_ERROR_TIMEOUT);
              notifyError(databaseContext, error?.message || error || action.invalidError);
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
          [classes.highlight]: totalSelected > 0
        })}>
        <Box>
          {totalSelected > 0 ? (
            <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
              {totalSelected} selected
            </Typography>
          ) : (
            <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
              {tableName}
            </Typography>
          )}
          {totalSelected > 0 && bulkActions}
        </Box>
        {errorMessage}
      </Toolbar>
      {enableFiltering && !totalSelected && (
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
      if ((!action.displayInvalid || action.displayInvalid === 'hidden') && !isValid) return;
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
                throw new Error(action.invalidError);
              await action.action([row]);
              // await console.log('action ', action.key);
              if (action.triggerReload) setTimeout(fetchRows, ACTION_TIMEOUT);
            } catch (error) {
              setActionError(error?.message || error);
              setTimeout(() => setActionError(''), ACTION_ERROR_TIMEOUT);
              notifyError(databaseContext, error?.message || error || action.invalidError);
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
