import {
  Box,
  Collapse,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow
} from '@material-ui/core';
import { KeyboardArrowUp, KeyboardArrowDown, ExpandMore } from '@material-ui/icons';
import React from 'react';

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

/*
  headers: an array of (string/numeric) values (or objects if you want to get fancy and define other object cell properties)
  rows: an array of arrays of columns, which can each contain (string/numeric) values or objects defining overrides to each cell
  dropdown: if defined, gives a function to build the content of a dropdown section for each row, based on the 'source' and the current column index
  pagination: object defining pagination settings, or just boolean true to use defaults.  No pagination if undefined/false
  startsOpen: boolean to set the dropdown to open by default or not (default closed)
*/
// general table with pagination
const RecordTable: React.FC<RecordTablePropType> = (props) => {
  const { headers, rows, dropdown = undefined, pagination = undefined, startsOpen = undefined } = props;

  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
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
    const [open, setOpen] = React.useState(startsOpen);

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