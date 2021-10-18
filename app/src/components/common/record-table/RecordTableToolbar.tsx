import { AccordionSummary, Box, IconButton, makeStyles, Toolbar, Tooltip, Typography } from '@material-ui/core';
import { ExpandMore, FilterList } from '@material-ui/icons';
import { lighten } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';
import { getRecordTableActions } from './RecordTableAction';

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
  const {
    selectedRows,
    tableName,
    enableFiltering,
    actions,
    fetchRows,
    errorMessage,
    setErrorMessage,
    setWarningDialog
  } = props;
  const totalSelected = selectedRows?.length || 0;

  const bulkActions = getRecordTableActions({
    context: 'bulk',
    actions,
    affectedRows: selectedRows,
    fetchRows,
    setErrorMessage,
    setWarningDialog
  });

  const globalActions = getRecordTableActions({
    context: 'global',
    actions,
    affectedRows: selectedRows,
    fetchRows,
    setErrorMessage,
    setWarningDialog
  });

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
