import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  Collapse,
  FormControlLabel,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Switch,
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

/*
const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    textAlign: 'left',
    color: theme.palette.text.primary
  },
  table: {
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
    width: 1
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
    width: '1px'
  },
  openRow: {
    overflow: 'inherit',
    whiteSpace: 'inherit'
  },
  closedRow: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  }
}));

export interface RecordTablePropType {
  headers: Array<any | object>;
  rows: Array<Array<string | object> | object>;
  dropdown?: (index: number) => any;
  pagination?: boolean | object;
  startsOpen?: boolean;
}
*/

/*
  headers: an array of (string/numeric) values (or objects if you want to get fancy and define other object cell properties)
  rows: an array of arrays of columns, which can each contain (string/numeric) values or objects defining overrides to each cell
  dropdown: if defined, gives a function to build the content of a dropdown section for each row, based on the 'source' and the current column index
  pagination: object defining pagination settings, or just boolean true to use defaults.  No pagination if undefined/false
  startsOpen: boolean to set the dropdown of each row to open by default or not (default closed)
*/
/*
// general table with pagination
const RecordTable: React.FC<RecordTablePropType> = (props) => {
  const { headers, rows, dropdown = undefined, pagination = undefined, startsOpen = undefined } = props;

  const classes = useStyles();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const startingRow = page * rowsPerPage;

  const ifApplicable = (value) =>
    value && String(value).trim().length ? value : <div className={classes.missingValue}>N/A</div>;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const IAPPBodyRow = ({ row, index }) => {
    const [open, setOpen] = useState(startsOpen);

    const renderedDropdown = dropdown ? dropdown(index) : null;
    // allow the row to override standard rendering if it is a string or element
    const renderedCells =
      typeof row === 'string' || React.isValidElement(row) ? row : row.map((cell, j) => renderCell(cell, j, open));

    return (
      <React.Fragment key={index}>
        <TableRow className={classes.tableRow} onClick={() => setOpen(!open)}>
          {dropdown && (
            <TableCell className={classes.dropdownCol}>
              {renderedDropdown !== null && (
                <IconButton aria-label="expand row" size="small">
                  {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                </IconButton>
              )}
            </TableCell>
          )}
          {renderedCells}
        </TableRow>
        {dropdown && renderedDropdown !== null && (
          <TableRow className={classes.tableRow}>
            <TableCell className={classes.dropdown} colSpan={100}>
              <Collapse in={open} timeout="auto">
                <Box margin={2}>{renderedDropdown}</Box>
              </Collapse>
            </TableCell>
          </TableRow>
        )}
      </React.Fragment>
    );
  };

  const renderCell = (cell, i, open = false) =>
    typeof cell === 'object' ? (
      React.createElement(TableCell, {
        key: i,
        ...cell,
        className: `${classes.cell} ${cell.className} ${open ? classes.openRow : classes.closedRow}`
      })
    ) : (
      <TableCell key={i} className={classes.cell}>
        {ifApplicable(cell)}
      </TableCell>
    );
  const renderedHeaders = headers.map((cell, i) => renderCell(cell, i));
  const renderedRows = rows
    .slice(startingRow, startingRow + rowsPerPage)
    .map((row, i) => <IAPPBodyRow row={row} index={startingRow + i} key={startingRow + i} />);

  return !rows?.length ? (
    <div>No Data</div>
  ) : (
    <TableContainer component={Paper} className={classes.tableContainer}>
      <Table className={classes.table} aria-label="mechanical treatments">
        <TableHead className={classes.header}>
          <TableRow>
            {dropdown && <TableCell className={classes.dropdownCol} />}
            {renderedHeaders}
          </TableRow>
        </TableHead>
        <TableBody>{renderedRows}</TableBody>
      </Table>
      {pagination && rows && rows.length > rowsPerPage && (
        <TablePagination
          rowsPerPageOptions={[rowsPerPage]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      )}
    </TableContainer>
  );
};

export default RecordTable;
*/

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

/*
const headCells = [
  { id: 'name', disablePadding: true, label: 'Dessert (100g serving)' },
  { id: 'calories', numeric: true, label: 'Calories' },
  { id: 'fat', numeric: true, label: 'Fat (g)' },
  { id: 'carbs', numeric: true, label: 'Carbs (g)' },
  { id: 'protein', numeric: true, label: 'Protein (g)' },
];
*/

function EnhancedTableHead(props) {
  const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, headCells } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all desserts' }}
          />
        </TableCell>
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
              {headCell.label}
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
  }
}));

const EnhancedTableToolbar = (props) => {
  const classes = useToolbarStyles();
  const { numSelected, tableName, expanded, setExpanded } = props;

  return (
    <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-map-content" id="panel-map-header">
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

        {numSelected > 0 ? (
          <Tooltip title="Delete">
            <IconButton aria-label="delete">
              <Delete />
            </IconButton>
          </Tooltip>
        ) : (
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

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%'
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
    padding: theme.spacing(2),
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
    width: '1px'
  },
  openRow: {
    overflow: 'inherit',
    whiteSpace: 'inherit'
  },
  closedRow: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  }
}));

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

  dropdown?: (index: number) => any;
  pagination?: boolean | object;
  startsOpen?: boolean;
}

const RecordTable: React.FC<RecordTablePropType> = (props) => {
  const classes = useStyles();
  const {
    tableName,
    rows,
    keyField = 'id',
    startingOrder = 'asc',
    expandable = true,
    startExpanded = true,
    startingRowsPerPage = 10,
    rowsPerPageOptions = false, // disable ability to change rows per page by default
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
        label: header
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
    throw 'Table header not defined correctly - must be a string, number or object';
  });

  const [order, setOrder] = useState(startingOrder);
  const [orderBy, setOrderBy] = useState(startingOrderBy);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(startingRowsPerPage);
  const [selected, setSelected] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [dense, setDense] = useState(densePadding);
  const [expanded, setExpanded] = useState(startExpanded);

  // sort and limit the rows:
  const pageRows = stableSort(rows, getComparator(order, orderBy)).slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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

  const selectRow = (event, key) => {
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

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const isSelectedRow = (key) => selected.indexOf(key) !== -1;
  const isExpandedRow = (key) => expandedRows.indexOf(key) !== -1;

  const ifApplicable = (value) =>
    value && String(value).trim().length ? value : <div className={classes.missingValue}>N/A</div>;

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  const renderCell = (row, id) => {
    const cell = row[id];
    switch (typeof cell) {
      case 'object':
        return React.createElement(TableCell, {
          key: id,
          ...cell
        });
      case 'function':
        return cell(row);
      default:
      case 'string':
        return ifApplicable(cell);
    }
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Accordion defaultExpanded={false}>
          <EnhancedTableToolbar
            numSelected={selected.length}
            tableName={tableName}
            expanded={expanded}
            setExpanded={setExpanded}
          />
          <AccordionDetails className={classes.paper}>
            <TableContainer>
              <Table
                className={classes.table}
                aria-labelledby="tableTitle"
                size={dense ? 'small' : 'medium'}
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
                />
                <TableBody>
                  {pageRows.map((row) => {
                    const key = row[keyField];
                    if (!key) throw 'Error: table row has no matching key defined';
                    const isItemSelected = isSelectedRow(key);
                    const labelId = `enhanced-table-checkbox-${key}`;

                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={key}
                        selected={isItemSelected}
                        className={isExpandedRow(row[keyField]) ? classes.openRow : classes.closedRow}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isItemSelected}
                            onClick={(event) => selectRow(event, key)}
                            inputProps={{ 'aria-labelledby': labelId }}
                          />
                        </TableCell>
                        {headCells.map(({ id, numeric, align, padding, className }, i) => (
                          <TableCell
                            component="th"
                            id={labelId}
                            key={id}
                            scope="row"
                            align={align}
                            padding={padding}
                            className={`${classes.cell} ${row[id].className}`}>
                            {renderCell(row, id)}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                  {padEmptyRows && emptyRows > 0 && (
                    <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                      <TableCell colSpan={headCells.length} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={rowsPerPageOptions === false ? undefined : rowsPerPageOptions}
              component="div"
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
            />
          </AccordionDetails>
        </Accordion>
      </Paper>
    </div>
  );
};

export default RecordTable;
