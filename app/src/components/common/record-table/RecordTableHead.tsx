import {
  Checkbox,
  IconButton,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip
} from '@material-ui/core';
import { DEFAULT_PAGE_SIZE } from 'constants/database';
import { useStyles } from '../RecordTable';
import React from 'react';


// header: defines each header column in headers
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

function RecordTableHead(props) {
  const {
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

  const classes = useStyles();
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

export default RecordTableHead;
