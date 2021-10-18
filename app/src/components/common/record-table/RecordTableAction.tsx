import { Button } from '@material-ui/core';
import { notifyError } from '../../../utils/NotificationUtils';
import { DatabaseContext } from '../../../contexts/DatabaseContext';
import React, { useContext } from 'react';
import { useStyles } from '../RecordTable';

export const ACTION_TIMEOUT = 1500; // 1.5s
export const ACTION_ERROR_TIMEOUT = 15000; // 15s


// action: look and feel, context, and click effect definitions for a button (or other actions in future e.g. sliders)
export interface IRecordTableAction {
  // id: self-reflection so an action object knows the key it's being refered as. e.g. "edit"
  id: string;
  // enabled: if false, will hide action entirely.  Useful for defining actions generally for all RecordTable instances but only enabling them in appropriate contexts
  enabled?: boolean;
  // label: english text to display on buttons. e.g. "Edit Activity"
  label: string;
  // icon: icon to accompany label in button content
  icon?: any;
  // action: function to call when an action is clicked.  If it's a "bulk" or "global" action, it will apply to all currently-selected rows in the table.
  // If it's a "row" action, it will apply to only the current row being clicked and "selectedRows" will be length 1.
  // This single-definiton is useful since usually what you want to do for all selected rows is the same as a single row.
  action: (selectedRows: Array<any>) => any;
  // displayInvalid: what to do when an action is invalid (e.g. it fails its rowCondition check)
  displayInvalid?: DisplayInvalid;
  // invalidError: default message to display when the action is invalid and displayInvalid = 'error'.
  // Note that customized errors can be thrown by the actual action() function which may be more descriptive to what went wrong
  invalidError?: string;
  // rowAction: whether to present this action as a button in each row
  rowAction?: boolean;
  // rowCondition: function determining whether the action is valid in a row.  e.g. if only some rows allow this particular action.
  // displayInvalid determines behavior when it returns false.   Not needed if rowAction is false (disabled).
  rowCondition?: (selectedRows: Array<any>) => boolean;
  // bulkAction: whether to present this action as a button when a user has selected one or more rows (e.g. bulk edits/deletes)
  bulkAction?: boolean;
  // rowCondition: function determining whether the action is valid for the given selected rows.  e.g. if they must all be a certain type
  // displayInvalid determines behavior when it returns false.  Not needed if bulkAction is false (disabled).
  bulkCondition?: (selectedRows: Array<any>) => boolean;
  // globalAction: whether to present this action as a button in the toolbar, regardless of selected rows (usually used for "create" actions)
  globalAction?: boolean;
  // rowCondition: function determining whether the action is valid in the toolbar.
  // displayInvalid determines behavior when it returns false.  Not needed if globalAction is false (disabled).
  globalCondition?: (selectedRows: Array<any>) => boolean;
  
  // warningDialog: whether to display a warning dialog before confirming an action
  hasWarningDialog?: boolean;
  // warningDialogMessage: function generating a string message
  warningDialogMessage?: (affectedRows: Array<any>) => string;
}
enum DisplayInvalid {
  disable = 'disable', // grey-out the action button and make it unclickable
  hidden = 'hidden', // hide the action button
  error = 'error' // show the action button as normal, but display an error on click
}

export const getRecordTableActions = (props) => {
  const { context, actions, affectedRows, fetchRows, setErrorMessage, setWarningDialog } = props;
  return Object.values(actions)
  .filter((action: any) => {
    switch(context) {
      case 'row':
        if (action.rowAction) return true; break;
      case 'bulk':
        if (action.bulkAction) return true; break;
      case 'global':
        if (action.globalAction) return true; break;
  }})
  .map((action: any) => <RecordTableAction
    {...action}
    {...{context, affectedRows, fetchRows, setErrorMessage, setWarningDialog}}
  />)
  .filter((action) => action); // remove hidden actions
}

export const RecordTableAction = (props) => {
  const {
    context,
    affectedRows,
    fetchRows,
    setErrorMessage,
    setWarningDialog,
    rowCondition,
    bulkCondition,
    globalCondition,
    displayInvalid,
    id,
    icon,
    invalidError,
    action, // the actual function call
    hasWarningDialog,
    warningDialogMessage,
    triggerReload,
    label
  } = props;

  const classes = useStyles();
  const databaseContext = useContext(DatabaseContext);

  let isValid = true;
  switch(context) {
    case 'row':
      if (rowCondition)
        isValid = rowCondition(affectedRows);
      break;
    case 'bulk':
      if (bulkCondition)
        isValid = bulkCondition(affectedRows);
      break;
    case 'global':
      if (globalCondition)
        isValid = globalCondition(affectedRows)
      if (bulkCondition)
        isValid = isValid && bulkCondition(affectedRows)
      if (rowCondition)
        isValid = isValid && affectedRows.filter((row) => !rowCondition([row]))?.length > 0;
      break;
  }

  if ((!displayInvalid || displayInvalid === 'hidden') && !isValid) return null;
  return (
    <Button
      id={id}
      variant="contained"
      size="small"
      color={context !== 'global' && "primary" || undefined}
      disabled={displayInvalid === 'disable' && !isValid}
      className={classes.button}
      startIcon={icon}
      onClick={async (e) => {
        e.stopPropagation();
        try {
          if (displayInvalid === 'error' && !isValid && invalidError)
            throw new Error(invalidError);
          if (hasWarningDialog) {
            setWarningDialog({
              dialogOpen: true,
              dialogTitle: 'Are you sure?',
              dialogContentText: warningDialogMessage && warningDialogMessage(affectedRows) || '',
              dialogActions: [
                {
                  actionName: 'No',
                  actionOnClick: async () => { setWarningDialog({dialogOpen: false})}
                },
                {
                  actionName: 'Yes',
                  actionOnClick: async () => { 
                    setWarningDialog({dialogOpen: false});
                    await action(affectedRows);
                    if (triggerReload) setTimeout(fetchRows, ACTION_TIMEOUT);
                  },
                  autoFocus: true
                }
              ]
            });
          } else {
            await action(affectedRows);
            if (triggerReload) setTimeout(fetchRows, ACTION_TIMEOUT);
          }
        } catch (error) {
          setErrorMessage(error?.message || error);
          setTimeout(() => setErrorMessage(''), ACTION_ERROR_TIMEOUT);
          notifyError(databaseContext, error?.message || error || invalidError);
        }
      }}>
      {label}
    </Button>
  );
}
    

export default RecordTableAction;
