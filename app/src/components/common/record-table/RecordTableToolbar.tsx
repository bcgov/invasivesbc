import {
  AccordionSummary,
  Box,
  Button,
  IconButton,
  makeStyles,
  Toolbar,
  Tooltip,
  Typography
} from '@material-ui/core';
import { ExpandMore, FilterList } from '@material-ui/icons';
import { lighten } from '@material-ui/core/styles';
import { notifyError } from '../../../utils/NotificationUtils';
import clsx from 'clsx';
import React from 'react';
import { ACTION_TIMEOUT, ACTION_ERROR_TIMEOUT } from '../RecordTable';

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

const RecordTableToolbar = (props) => {
  const classes = useToolbarStyles();
  const { selectedRows, tableName, enableFiltering, actions, databaseContext, fetchRows, errorMessage, setErrorMessage } = props;
  const totalSelected = selectedRows?.length || 0;

  const bulkActions: Array<any> = Object.values(actions)
    .filter((action: any) => action.bulkAction)
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
    .filter((action: any) => action.globalAction)
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

export default RecordTableToolbar;