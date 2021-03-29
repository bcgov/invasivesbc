import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
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
import { Delete, KeyboardArrowUp, KeyboardArrowDown, ExpandMore, FilterList } from '@material-ui/icons';
import React, { useState } from 'react';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
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
    paddingLeft: 30
  }
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
    flex: '1 1 100%'
  },
  toolbar: {
    height: '1px'
  }
}));

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function EnhancedTableHead(props) {
  const {
    classes,
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
    headCells,
    pageHasDropdown,
    enableSelection
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead className={classes.header}>
      <TableRow>
        {(enableSelection || pageHasDropdown) && (
          <TableCell padding="checkbox">
            {enableSelection && (
              <Checkbox
                indeterminate={numSelected > 0 && numSelected < rowCount}
                checked={rowCount > 0 && numSelected === rowCount}
                onChange={onSelectAllClick}
                inputProps={{ 'aria-label': 'select all desserts' }}
              />
            )}
            {pageHasDropdown && <IconButton aria-label="expand row" size="small" />}
          </TableCell>
        )}
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            padding={headCell.padding}
            sortDirection={orderBy === headCell.id ? order : false}
            className={`${classes.cell} ${headCell.className}`}>
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : headCell.defaultOrder}
              onClick={createSortHandler(headCell.id)}>
              {headCell.title}
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

const EnhancedTableToolbar = (props) => {
  const classes = useToolbarStyles();
  const { numSelected, tableName, enableFiltering } = props;

  return (
    <AccordionSummary
      className={classes.toolbar}
      expandIcon={<ExpandMore />}
      aria-controls="panel-map-content"
      id="panel-map-header">
      <Toolbar
        className={clsx(classes.root, {
          [classes.highlight]: numSelected > 0
        })}>
        {numSelected > 0 ? (
          <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
            {numSelected} selected
          </Typography>
        ) : (
          <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
            {tableName}
          </Typography>
        )}

        {numSelected > 0 && (
          <Tooltip title="Delete">
            <IconButton aria-label="delete">
              <Delete />
            </IconButton>
          </Tooltip>
        )}
        {enableFiltering && !numSelected && (
          <Tooltip title="Filter list">
            <IconButton aria-label="filter list">
              <FilterList />
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>
    </AccordionSummary>
  );
};

const RecordTableCell = ({ id, align, padding, className, row }) => {
  const classes = useStyles();

  const ifApplicable = (value) =>
    value && String(value).trim().length ? value : <div className={classes.missingValue}>N/A</div>;

  const renderCell = (cells, key) => {
    const cell = cells[key];
    switch (typeof cell) {
      case 'object':
        return React.createElement(TableCell, {
          key: key,
          ...cell
        });
      case 'function':
        return cell(cells);
      case 'string':
      default:
        return ifApplicable(cell);
    }
  };

  return (
    <TableCell component="th" scope="row" align={align} padding={padding} className={className}>
      {renderCell(row, id)}
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
    hasOverflow
  } = props;
  const classes = useStyles();

  const key = row[keyField];
  if (key === undefined) {
    console.log(row, keyField);
    throw new Error('Error: table row has no matching key defined');
  }
  const renderedDropdown = !!dropdown && dropdown(row);
  const labelId = `record-table-checkbox-${key}`;

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
          <TableCell padding="checkbox">
            {enableSelection && (
              <Checkbox checked={isSelected} onClick={toggleSelected} inputProps={{ 'aria-labelledby': labelId }} />
            )}
            {pageHasDropdown && (
              <IconButton aria-label="expand row" size="small">
                {(!!renderedDropdown || hasOverflow) && (isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />)}
              </IconButton>
            )}
          </TableCell>
        )}
        {headers.map((header) => (
          <RecordTableCell
            {...header}
            key={header.id}
            row={row}
            className={`
              ${classes.cell}
              ${header.className}
              ${hasOverflow && (isExpanded ? classes.openRow : classes.closedRow)}
            `}
          />
        ))}
      </TableRow>
      {!!renderedDropdown && (
        <TableRow className={classes.tableRow}>
          <TableCell className={classes.dropdown} colSpan={100}>
            <Collapse in={isExpanded} timeout="auto">
              <Box margin={2}>{renderedDropdown}</Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
};

/*
  OUTDATED:
  headers: an array of (string/numeric) values (or objects if you want to get fancy and define other object cell properties)
  rows: an array of arrays of columns, which can each contain (string/numeric) values or objects defining overrides to each cell
  dropdown: if defined, gives a function to build the content of a dropdown section for each row, based on the 'source' and the current column index
  pagination: object defining pagination settings, or just boolean true to use defaults.  No pagination if undefined/false
  startsOpen: boolean to set the dropdown of each row to open by default or not (default closed)
*/
export interface RecordTablePropType {
  headers: Array<any>;
  rows: any;
  tableName?: string;
  expandable?: boolean;
  startExpanded?: boolean;
  keyField?: string;
  startingOrder?: string;
  startingOrderBy?: string;
  startingRowsPerPage?: number;
  rowsPerPageOptions?: Array<number>;
  densePadding?: boolean;
  padEmptyRows?: boolean;
  enableSelection?: boolean;
  enableFiltering?: boolean;
  className?: any;
  dropdown?: (row: any) => any;
  dropdownLimit?: boolean;
  overflowDropdown?: boolean;
  overflowLimit?: number;
  pagination?: boolean;
}

const RecordTable: React.FC<RecordTablePropType> = (props) => {
  const classes = useStyles();
  const {
    tableName,
    rows,
    keyField = 'id',
    startingOrder = 'asc',
    expandable = true,
    dropdown, // default none
    dropdownLimit = true,
    overflowDropdown = true, // overflow into a dropdown when a cell is very verbose
    overflowLimit = 50, // char limit
    startExpanded = true,
    startingRowsPerPage = 10,
    rowsPerPageOptions = false, // disable ability to change rows per page by default
    enableSelection = false,
    enableFiltering = false,
    pagination = true,
    // className: tableClassName,
    densePadding = false,
    padEmptyRows = false // whitespace added to make the table the same height
    // even on the last page with only e.g. 1 row
  } = props;
  const { headers = rows.length ? Object.keys(rows[0]) : [] } = props;
  const { startingOrderBy = headers.length ? headers[0].id : 'id' } = props; // defaults to the first header
  const headCells: any = headers.map((header: any, i) => {
    if (typeof header === 'string' || typeof header === 'number')
      return {
        id: i,
        title: header
      };
    if (typeof header === 'object')
      return {
        // defaults:
        id: i,
        align: header.numeric ? 'right' : 'left',
        padding: 'default',
        defaultOrder: 'asc',
        ...header
      };
    throw new Error('Table header not defined correctly - must be a string, number or object');
  });

  const [order, setOrder] = useState(startingOrder);
  const [orderBy, setOrderBy] = useState(startingOrderBy);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(startingRowsPerPage);
  const [selected, setSelected] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);

  // sort and limit the rows:
  const pageRows = stableSort(rows, getComparator(order, orderBy)).slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  // determine if any rows on the current page have a dropdown:
  // render all dropdowns
  const renderedDropdowns = pageRows.map((row) => (dropdown ? dropdown(row) : undefined));
  // search for any potential overflows (fields too long).
  // This returns a list of booleans whether each row overflows
  const verboseOverflows = pageRows.map(
    (row) => headCells.filter(({ id }) => String(row[id]).length > overflowLimit).length > 0
  );
  const pageHasDropdown =
    (!!dropdown && renderedDropdowns.filter((rendered) => rendered).length > 0) ||
    (overflowDropdown && verboseOverflows.filter((hasOverflow) => hasOverflow).length > 0);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((row) => row[keyField]);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const selectRow = (key) => {
    const selectedIndex = selected.indexOf(key);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, key);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelectedRow = (key) => selected.indexOf(key) !== -1;
  const isExpandedRow = (key) => expandedRows.indexOf(key) !== -1;

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  const toggleExpandedRow = (key) => {
    if (isExpandedRow(key)) {
      const expandedRows2 = expandedRows;
      delete expandedRows2[expandedRows.indexOf(key)];
      setExpandedRows(expandedRows2.filter((value) => value));
    } else {
      if (dropdownLimit) {
        setExpandedRows([key]);
      } else setExpandedRows([...expandedRows, key]);
    }
  };

  return (
    <div className={clsx(classes.paper)}>
      <Accordion defaultExpanded={startExpanded || !rows.length}>
        <EnhancedTableToolbar
          numSelected={enableSelection && selected.length}
          tableName={tableName}
          enableFiltering={enableFiltering}
        />
        <AccordionDetails className={classes.paper}>
          {!rows.length && <div className={classes.emptyTable}>No data to display</div>}
          {!!rows.length && (
            <TableContainer>
              <Table
                className={classes.table}
                aria-labelledby="tableTitle"
                size={densePadding ? 'small' : 'medium'}
                aria-label="enhanced table">
                <EnhancedTableHead
                  classes={classes}
                  numSelected={selected.length}
                  order={order}
                  orderBy={orderBy}
                  onSelectAllClick={handleSelectAllClick}
                  onRequestSort={handleRequestSort}
                  rowCount={rows.length}
                  headCells={headCells}
                  enableSelection={enableSelection}
                  pageHasDropdown={pageHasDropdown}
                />
                <TableBody>
                  {pageRows.map((row, index) => (
                    <RecordTableRow
                      key={row[keyField]}
                      keyField={keyField}
                      headers={headCells}
                      row={row}
                      dropdown={dropdown}
                      pageHasDropdown={pageHasDropdown}
                      hasOverflow={verboseOverflows[index]}
                      isExpanded={isExpandedRow(row[keyField])}
                      isSelected={isSelectedRow(row[keyField])}
                      enableSelection={enableSelection}
                      toggleExpanded={() => toggleExpandedRow(row[keyField])}
                      toggleSelected={() => selectRow(row[keyField])}
                    />
                  ))}
                  {padEmptyRows && emptyRows > 0 && (
                    <TableRow style={{ height: (densePadding ? 33 : 53) * emptyRows }}>
                      <TableCell colSpan={headCells.length} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {!!rows.length && pagination && (
            <TablePagination
              rowsPerPageOptions={rowsPerPageOptions === false ? undefined : rowsPerPageOptions}
              component="div"
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
            />
          )}
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default RecordTable;
