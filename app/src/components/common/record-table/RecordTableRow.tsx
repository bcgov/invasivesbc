import { Box, Button, Checkbox, Collapse, IconButton, TableCell, TableRow } from '@material-ui/core';
import { KeyboardArrowUp, KeyboardArrowDown } from '@material-ui/icons';
import { notifyError } from '../../../utils/NotificationUtils';
import React, { useState } from 'react';
import { getValue, useStyles, ACTION_TIMEOUT, ACTION_ERROR_TIMEOUT } from '../RecordTable';

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

export default RecordTableRow;
