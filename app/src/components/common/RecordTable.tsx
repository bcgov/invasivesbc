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
import RecordTableToolbar from './record-table/RecordTableToolbar';
import RecordTableHead from './record-table/RecordTableHead';
import RecordTableRow from './record-table/RecordTableRow';

export const ACTION_TIMEOUT = 1500; // 1.5s
export const ACTION_ERROR_TIMEOUT = 15000; // 15s

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

export const useStyles = makeStyles((theme) => ({
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

export const getValue = (row, header) => {
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
    actions,
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
    rowsPerPageOptions,
    startExpanded = true,
    startingOrder = 'asc',
    startingOrderBy = props.headers.length && props.headers[0]?.id || 'id',
    startingRowsPerPage = 10,
    tableName = '',
    tableSchemaType
  } = props;

  // non-prop defaults:
  const PAGES_LOADED_BUFFER = 2;
  const startingPage = 0;
  const startingRows = Array.isArray(props.rows) && props.rows || [];

  // state declarations
  const [rowsLoaded, setRowsLoaded] = useState(Array.isArray(props.rows));
  const [order, setOrder] = useState(startingOrder);
  const [orderBy, setOrderBy] = useState(startingOrderBy);
  const [page, setPage] = useState(startingPage);
  const [rowsPerPage, setRowsPerPage] = useState(startingRowsPerPage);
  const [rows, setRows] = useState(startingRows);
  const [totalRows, setTotalRows] = useState(startingRows.length);
  const [firstPageLoaded, setFirstPageLoaded] = useState(Math.max(0, page - PAGES_LOADED_BUFFER));
  const [toolbarErrorMessage, setToolbarErrorMessage] = useState();
  const [schemas, setSchemas] = useState<{ schema: any; uiSchema: any }>({ schema: null, uiSchema: null });
  const [schemasLoaded, setSchemasLoaded] = useState(false);
  const [expandedRows, setExpandedRows] = useState([]);
  const [selected, setSelected] = useState(props.selected || []);

  // derived variables:
  const lastPageLoaded = Math.min(totalRows, page + 1 + PAGES_LOADED_BUFFER);
  const loadedRowsFirstIndex = firstPageLoaded * rowsPerPage;
  const loadedRowLastIndex = Math.min(lastPageLoaded * rowsPerPage, totalRows - 1);
  const pageRowsFirstIndex = page * rowsPerPage;
  const pageRowsLastIndex = (page + 1) * rowsPerPage;
  const isLoading = (!schemasLoaded && tableSchemaType?.length > 0) || !rowsLoaded;
  const selectedHash = JSON.stringify(selected);
  const rowsHash = JSON.stringify(props.rows);


  // HEADERS:

  // converts headers prop into standardized format, using OpenApi schemas from api-docs to infer properties
  // this is needed, in particular, to map values on the table from short codes to their full names
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
  
  // fetches the api spec from api-docs and pulls out the list of schemas we declare in tableSchemaInput
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

  // sort and limit the rows:
  const orderHeader = useMemo(() => headers.find((col) => col.id === orderBy), [headers, orderBy]);

  const onRequestSort = useCallback(
    (event, property) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
      setPage(startingPage);
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


  // ROWS

  const pageRows = useMemo(() => {
    // Note: this is O(nlog(n)) so important that we cache this with useMemo
    return stableSort(rows, orderHeader, order === 'asc').slice(
      page * rowsPerPage - loadedRowsFirstIndex,
      page * rowsPerPage + rowsPerPage - loadedRowsFirstIndex
    );
  }, [rows.length, orderHeader, order, page, rowsPerPage]);
  const isCurrentPageLoaded = rows.length - pageRowsFirstIndex >= rowsPerPage && loadedRowLastIndex < totalRows - 1;
  const rowActions: Array<any> = Object.values(actions).filter((action: any) => action.enabled && action.rowAction);
  const dropdown = useCallback((row) => !!props.dropdown && props.dropdown(row), [!!props.dropdown]);

  // render all dropdowns on page
  const renderedDropdowns = useMemo(() => pageRows.map((row) => (dropdown ? dropdown(row) : undefined)), [
    pageRows,
    dropdown
  ]);

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

  /*
  Function to populate "rows" in the table when props.rows is given as a function instead of a simple array
  Pages data for the given order.  Will need to include filters in this as well in future iterations
  */
  const fetchRows = async () => {
    // console.log('fetchRows start: ', tableName);
    if (props.rows instanceof Function) {
      if (isCurrentPageLoaded)
        await setRowsLoaded(false);
      const result = await props.rows({
        page: pageRowsFirstIndex,
        rowsPerPage: rowsPerPage,
        order: [orderBy + ' ' + order]
      });

      // console.log('fetchRows: ', result);
      if (result) {
        await setRows(result.rows);
        await setTotalRows(result.count);
        await setFirstPageLoaded(firstPageLoaded);
      }
    }
    await setRowsLoaded(true);
  };

  const selectedRows = useMemo(
    () =>
      selected
        .map((id) => rows.find((row) => row[keyField] === id) || undefined)
        .filter((row) => row),
    [selectedHash, rows]
  );

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

  const RecordTableHeadRendered = () => <RecordTableHead
    totalSelected={selected.length}
    {...{ order, orderBy, onSelectAllClick, onRequestSort, totalRows, headers, enableSelection, enableTooltips, pageHasDropdown }}
  />

  const RecordTableRows = () => pageRows.map((row, index) => {
    const key = row[keyField];
    return (
      <RecordTableRow
        key={key}
        hasOverflow={verboseOverflows[index]}
        isExpanded={expandedRows.indexOf(key) !== -1}
        isSelected={selected.indexOf(key) !== -1}
        toggleExpanded={(event) => {
          event.stopPropagation();
          toggleExpandedRow(key);
        }}
        toggleSelected={(event) => {
          event.stopPropagation();
          selectRow(selected, key);
        }}
        actions={rowActions}
        actionStyle={rowActionStyle}
        {...{keyField, headers, row, dropdown, pageHasDropdown, enableSelection, databaseContext, fetchRows}}
      />
    );
  });

  // EMPTY ROWS
  // if padEmptyRows, creates whitespace on the last page 
  const emptyRowsCount = rowsPerPage - Math.min(rowsPerPage, totalRows - page * rowsPerPage);
  const EmptyRows = () => padEmptyRows && emptyRowsCount > 0 && (
    <TableRow style={{ height: (densePadding ? 33 : 53) * emptyRowsCount }}>
      <TableCell colSpan={headers.length} />
    </TableRow>
  );


  // PAGINATION:
  const showPagination = pagination === 'overflow' ? totalRows > rowsPerPage : !!pagination;
  const onPageChange = (event, newPage) => {
    setPage(newPage);
  };
  const onRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, startingRowsPerPage));
    setPage(startingPage);
  };
  const RecordTablePagination = () => !!totalRows && showPagination && (
    <TablePagination
      component="div"
      count={totalRows}
      {...{rowsPerPageOptions, rowsPerPage, page, onPageChange, onRowsPerPageChange}}
    />
  );


  // EFFECT LISTENERS:

  useEffect(() => {
    // listen for parent compnent changes to startingrows
    setRows(startingRows);
    setTotalRows(startingRows.length);
  }, [rowsHash]);

  useEffect(() => {
    // listen for page changes which would cause a re-fetch from db
    fetchRows();
  }, [
    page,
    rowsPerPage,
    orderBy,
    order,
    loadedRowsFirstIndex,
    rows.length
  ]);

  useEffect(() => {
    // fetch the api schemas to populate headers
    getApiSpec(tableSchemaType);
  }, [tableSchemaType]);

  useEffect(() => {
    // listen for parent component changes to selected
    setSelected(props.selected || []);
  }, [JSON.stringify(props.selected)]);

  useEffect(() => {
    // when local selected change, propagate to parent using provided hook
    if (props.setSelected) props.setSelected(selected);
  }, [selectedHash]);


  // FINALLY, RENDER ALL:

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
            {isLoading && (
              <div className={classes.emptyTable}>
                <Spinner />
              </div>
            )}
            {!isLoading && !totalRows && <div className={classes.emptyTable}>No data to display</div>}
            {!!totalRows && (
              <TableContainer>
                <Table
                  className={classes.table}
                  aria-labelledby="tableTitle"
                  size={densePadding ? 'small' : 'medium'}
                  aria-label="enhanced table">
                  <RecordTableHeadRendered />
                  <TableBody>
                    <RecordTableRows />
                    <EmptyRows />
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <RecordTablePagination />
          </AccordionDetails>
        </Accordion>
      </div>
    ),
    [
      isLoading,
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

  // hide render conditionally if hideEmpty feature is enabled
  if (hideEmpty && (!totalRows || isLoading)) return null
  else return rendered;
};

export default RecordTable;
