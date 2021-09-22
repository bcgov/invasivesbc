import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Button,
  Collapse,
  IconButton,
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
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import { DatabaseContext2 } from 'contexts/DatabaseContext2';
import { useDataAccess } from 'hooks/useDataAccess';

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

const CreateAccordionTable = ({ row }) => {
  // json to use const obj = row?.tempObj.activity_payload;
  return (
    <Table size="small">
      <TableBody>
        <StyledTableRow>
          <StyledTableCell>Created Date</StyledTableCell>
          <StyledTableCell>{row.obj.activity_payload.date_created}</StyledTableCell>
        </StyledTableRow>
        <StyledTableRow>
          <StyledTableCell>Created By</StyledTableCell>
          <StyledTableCell>{row.obj.activity_payload.created_by}</StyledTableCell>
        </StyledTableRow>
        <StyledTableRow>
          <StyledTableCell>Ownership</StyledTableCell>
          <StyledTableCell>{row.obj.ownership}</StyledTableCell>
        </StyledTableRow>
        <StyledTableRow>
          <StyledTableCell>Moti District</StyledTableCell>
          <StyledTableCell>{row.obj.moti_districts}</StyledTableCell>
        </StyledTableRow>
        <StyledTableRow>
          <StyledTableCell>Regional Districts</StyledTableCell>
          <StyledTableCell>{row.obj.regional_districts}</StyledTableCell>
        </StyledTableRow>
        <StyledTableRow>
          <StyledTableCell>Invasive Speciecs Agency Code</StyledTableCell>
          <StyledTableCell>
            {row.obj.activity_payload.form_data.activity_data.invasive_species_agency_code}
          </StyledTableCell>
        </StyledTableRow>
      </TableBody>
    </Table>
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

export const RenderTableActivity = ({ rows, setRows }) => {
  const [rowsPerPage, setRowsPerPage] = useState(5);
  //const [emptyRows, setEmptyRows] = useState(0);
  const [page, setPage] = useState(0);
  const databaseContext = useContext(DatabaseContext2);
  const dataAccess = useDataAccess();

  const history = useHistory();

  const labels = ['ID', 'Activity Type', 'SubType'];

  /*useEffect(() => {
    if (rows) {
      setEmptyRows(rowsPerPage - Math.min(rowsPerPage, rows?.length - page * rowsPerPage));
    }
  }, [rows]);*/

  const updateRow = (row, fieldsToUpdate: Object) => {
    var arrLen = rows.length;
    if (arrLen > 0) {
      var index;
      for (let i in rows) {
        if (rows[i].obj.activity_id === row.obj.activity_id) {
          index = i;
        }
      }
      const rowsBefore = [...rows.slice(0, index)];
      const rowsAfter = [...rows.slice(index)];
      const oldRow = rows[index];
      const updatedRow = { ...oldRow, ...fieldsToUpdate };
      rowsAfter[0] = updatedRow;
      setRows([...rowsBefore, ...rowsAfter]);
    }
  };

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
        {(rowsPerPage > 0 ? rows?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : rows).map((row) => (
          <>
            <StyledTableRow key={row?.obj.activity_id}>
              <StyledTableCell
                style={{ display: 'flex', flexflow: 'row nowrap', marginRight: -20 }}
                component="th"
                scope="row">
                <IconButton size="small" onClick={() => updateRow(row, { open: !row.open })}>
                  {row?.open ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
                </IconButton>
                <Button
                  size="small"
                  onClick={async () => {
                    var id = row.obj.activity_id;
                    await dataAccess.setAppState({ activeActivity: id }, databaseContext);
                    history.push({ pathname: `/home/activity` });
                  }}>
                  {row?.obj.activity_payload.short_id}
                </Button>
              </StyledTableCell>
              <StyledTableCell style={{ marginRight: -40 }}>{row?.obj.activity_payload.activity_type}</StyledTableCell>
              <StyledTableCell>{row?.obj.activity_payload.activity_subtype.split('_')[2]}</StyledTableCell>
            </StyledTableRow>
            <TableRow>
              <Collapse in={row?.open} timeout="auto" unmountOnExit>
                <CreateAccordionTable row={row} />
              </Collapse>
            </TableRow>
          </>
        ))}
        {/*emptyRows > 0 && <CreateEmptyRows emptyRows={emptyRows} />*/}
        <CreateTableFooter
          records={rows}
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
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  //const emptyRows = rowsPerPage - Math.min(rowsPerPage, records?.length - page * rowsPerPage);

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
        <>
          {(rowsPerPage > 0 ? records?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : records).map(
            (row) => (
              <>
                <StyledTableRow key={row?.properties.WELL_TAG_NUMBER}>
                  <StyledTableCell component="th" scope="row">
                    {row.properties.AQUIFER_ID}
                  </StyledTableCell>
                  <StyledTableCell>
                    {row.geometry.coordinates[0].toFixed(2)},{row.geometry.coordinates[1].toFixed(2)}
                  </StyledTableCell>
                  <StyledTableCell>{row.properties.STREET_ADDRESS}</StyledTableCell>
                </StyledTableRow>
              </>
            )
          )}
        </>
        {/*emptyRows > 0 && <CreateEmptyRows emptyRows={emptyRows} />*/}
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
