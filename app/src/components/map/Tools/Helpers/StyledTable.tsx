import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Theme } from '@material-ui/core';
import { createStyles, withStyles } from '@material-ui/styles';

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
  shortID: string,
  date_created: string,
  activity_type: string,
  subtype: string,
  _areas: string
) => {
  return { shortID, date_created, activity_type, subtype, _areas };
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
  return (
    <Table size="small">
      <TableHead>
        <StyledTableRow>
          <StyledTableCell>ID</StyledTableCell>
          <StyledTableCell>Date Created</StyledTableCell>
          <StyledTableCell>Activity Type</StyledTableCell>
          <StyledTableCell>Subtype</StyledTableCell>
        </StyledTableRow>
      </TableHead>
      {records?.rows.map((row) => (
        <TableBody>
          <StyledTableRow key={row.activity_id}>
            <StyledTableCell commponent="th" scope="row">
              {row?.activity_payload.short_id}
            </StyledTableCell>
            <StyledTableCell>{row?.activity_payload.date_created}</StyledTableCell>
            <StyledTableCell>{row?.activity_payload.activity_type}</StyledTableCell>
            <StyledTableCell>{row?.activity_payload.activity_subtype}</StyledTableCell>
          </StyledTableRow>
        </TableBody>
      ))}
    </Table>
  );
};
