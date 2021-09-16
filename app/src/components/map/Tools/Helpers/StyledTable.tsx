import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Theme
} from '@material-ui/core';
import { createStyles, withStyles } from '@material-ui/styles';
import TablePaginationActions from '@material-ui/core/TablePagination/TablePaginationActions';
import { useHistory } from 'react-router-dom';

const CreateTableHead = ({ labels }) => {
  return (
    <TableHead>
      <StyledTableRow>
        {labels.map((label) => (
          <StyledTableCell>{label}</StyledTableCell>
        ))}
      </StyledTableRow>
    </TableHead>
  );
};

const CreateEmptyRows = ({ emptyRows }) => {
  return (
    <StyledTableRow style={{ height: 34 * emptyRows }}>
      <StyledTableCell colSpan={6} />
    </StyledTableRow>
  );
};

const CreateTableFooter = ({ records, rowsPerPage, page, handleChangePage, handleChangeRowsPerPage }) => {
  return (
    <TableFooter>
      <TableRow>
        <TablePagination
          count={records?.length}
          rowsPerPageOptions={[5]}
          rowsPerPage={rowsPerPage}
          page={page}
          SelectProps={{
            inputProps: { 'aria-label': 'rows per page' },
            native: true
          }}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          ActionsComponent={TablePaginationActions}
        />
      </TableRow>
    </TableFooter>
  );
};

export const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    body: {
      fontSize: 12
    }
  })
)(TableCell);

export const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover
      }
    }
  })
)(TableRow);

export const createDataUTM = (name: string, value: any) => {
  return { name, value };
};

export const createDataActivity = (
  activity_id: string,
  shortID: string,
  date_created: string,
  activity_type: string,
  subtype: string
) => {
  return { activity_id, shortID, date_created, activity_type, subtype };
};

export const RenderTablePosition = ({ rows }) => {
  return (
    <TableBody>
      {rows &&
        rows?.map((row) => (
          <StyledTableRow key={row.name}>
            <StyledTableCell component="th" scope="row">
              {row.name}
            </StyledTableCell>
            <StyledTableCell>{row.value}</StyledTableCell>
          </StyledTableRow>
        ))}
    </TableBody>
  );
};

export const RenderTableActivity = ({ records }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const history = useHistory();

  const labels = ['ID', 'Date Created', 'Activity Type', 'SubType'];

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, records?.length - page * rowsPerPage);

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Table size="small">
      <CreateTableHead labels={labels} />
      <TableBody>
        {records && (
          <>
            {(rowsPerPage > 0 ? records?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : records).map(
              (row) => (
                <StyledTableRow key={row?.activity_id}>
                  <StyledTableCell component="th" scope="row">
                    <Button size="small" onClick={() => history.push('/home/activities')}>
                      {row.activity_payload.short_id}
                    </Button>
                  </StyledTableCell>
                  <StyledTableCell>{row.activity_payload.date_created}</StyledTableCell>
                  <StyledTableCell>{row.activity_payload.activity_type}</StyledTableCell>
                  <StyledTableCell>{row.activity_payload.activity_subtype}</StyledTableCell>
                </StyledTableRow>
              )
            )}
          </>
        )}
        {emptyRows > 0 && <CreateEmptyRows emptyRows={emptyRows} />}
        <CreateTableFooter
          records={records}
          rowsPerPage={rowsPerPage}
          page={page}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </TableBody>
    </Table>
  );
};

export const RenderTableDataBC = ({ records }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, records?.length - page * rowsPerPage);

  const labels = ['AQUIFER ID', 'Coordinates', 'Street Address'];

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Table size="small">
      <CreateTableHead labels={labels} />
      <TableBody>
        {records && (
          <>
            {(rowsPerPage > 0 ? records?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : records).map(
              (row) => (
                <StyledTableRow key={row?.properties.WELL_TAG_NUMBER}>
                  <StyledTableCell component="th" scope="row">
                    {row.properties.AQUIFER_ID}
                  </StyledTableCell>
                  <StyledTableCell>
                    {row.geometry.coordinates[0].toFixed(2)},{row.geometry.coordinates[1].toFixed(2)}
                  </StyledTableCell>
                  <StyledTableCell>{row.properties.STREET_ADDRESS}</StyledTableCell>
                </StyledTableRow>
              )
            )}
          </>
        )}
        {emptyRows > 0 && <CreateEmptyRows emptyRows={emptyRows} />}
        <CreateTableFooter
          records={records}
          rowsPerPage={rowsPerPage}
          page={page}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </TableBody>
    </Table>
  );
};
