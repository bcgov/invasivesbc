import { Button, Dialog, DialogActions, DialogTitle, Grid, Tooltip, Zoom } from '@mui/material';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { useInvasivesApi } from '../../hooks/useInvasivesApi';
import { useSelector } from '../../state/utilities/use_selector';
import { selectAuth } from '../../state/reducers/auth';
import { selectActivity } from 'state/reducers/activity';
import { selectUserSettings } from 'state/reducers/userSettings';
import { useDispatch } from 'react-redux';
import { ACTIVITY_DELETE_SUCCESS, USER_SETTINGS_SET_SELECTED_RECORD_REQUEST } from 'state/actions';

export interface IFormControlsComponentProps {
  classes?: any;
  isDisabled?: boolean;
  onSubmit?: Function;
  onCopy?: Function;
  onPaste?: Function;
  activitySubtype?: string;
  hideCheckFormForErrors?: boolean;
  onSave?: Function;
  onSubmitAsOfficial?: Function;
  onNavBack?: Function;
  isAlreadySubmitted?: () => boolean;
  canBeSubmittedWithoutErrors?: () => boolean;
}

const FormControlsComponent: React.FC<IFormControlsComponentProps> = (props: any) => {
  const dataAccess = useInvasivesApi();
  const history = useHistory();
  const isDisabled = props.isDisabled || false;
  const [open, setOpen] = React.useState(false);
  const { accessRoles, displayName, username } = useSelector(selectAuth);
  const userSettings = useSelector(selectUserSettings);
  const dispatch = useDispatch();

  const activityInState = useSelector(selectActivity);

  const deleteRecord = () => {
    //TODO refactor this all to happen in a side effect triggered by a request action
    // On record deletion, clear selected record
    if (userSettings.activeActivity === activityInState.activity.activity_id) {
      dispatch({
        type: USER_SETTINGS_SET_SELECTED_RECORD_REQUEST,
        payload: {
          activeActivity: null
        }
      });
    }
    const activityIds = [activityInState.activity.activity_id];
    dataAccess.deleteActivities(activityIds).then(() => {
      localStorage.removeItem('activeActivity')
      history.push('/home/activities');
      dispatch({ type: ACTIVITY_DELETE_SUCCESS})
    })
  };

  const checkIfNotAuthorized = () => {
    for (let role of accessRoles) {
      if (role.role_id === 18) {
        return false;
      }
    }

    if (username !== props.activity.created_by) {
      return true;
    }
    return false;
  };

  const deleteTooltipString = () => {
    if (!props.isAlreadySubmitted()) {
      return 'Able to delete the draft record.  Make sure this is what you want if the record is linked to another record!';
    }
    if (checkIfNotAuthorized()) {
      return 'Unauthorized to delete submitted record';
    }
    return 'Able to delete the submitted record.  Be sure this is what you want to do if it is linked to another record!';
  };

  const submitTooltipString = () => {
    if (props.isAlreadySubmitted()) {
      return 'With edit permissions, you can still save edits with the Save button, but this record is already submitted.';
    }
    if (!props.canBeSubmittedWithoutErrors()) {
      return 'Save form without errors first, to be able to submit.';
    }
    return 'Ready to submit, form is validated and has no issues.';
  };

  const DeleteDialog = () => {
    return (
      <Dialog open={open}>
        <DialogTitle>
          Are you sure you want to delete this {props.activity.formStatus} Record? If it is linked to another record
          that link will be lost.
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={!checkIfNotAuthorized()} variant="contained" aria-label="Delete Record" onClick={() => deleteRecord()}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <>
      <Grid container spacing={3}>
        <Grid container item spacing={3}>
          <Grid item>
            {!props.hideCheckFormForErrors && (
              <Button
                disabled={isDisabled}
                variant="contained"
                color="primary"
                onClick={() => {
                  if (!props.onSubmit) {
                    return;
                  }

                  props.onSubmit();
                }}>
                Save Record
              </Button>
            )}
          </Grid>
          <Grid item>
            <Tooltip placement="top" title={deleteTooltipString()}>
              <span>
                <Button
                disabled={isDisabled}
                variant="contained" color="primary" onClick={() => setOpen(true)}>
                  Delete Record
                </Button>
              </span>
            </Tooltip>
          </Grid>
          <Grid item>
            {!props.hideCheckFormForErrors && (
              <Tooltip placement="top" title={submitTooltipString()}>
                <span>
                  <Button
                    disabled={props.isAlreadySubmitted() || !props.canBeSubmittedWithoutErrors()}
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      if (!props.onSubmitAsOfficial) {
                        return;
                      }

                      props.onSubmitAsOfficial();
                    }}>
                    {props.isAlreadySubmitted() ? 'Record Already Submitted' : 'Submit to Database'}
                  </Button>
                </span>
              </Tooltip>
            )}
          </Grid>
          <Grid item>
            {props.onNavBack && (
              <Button disabled={isDisabled} variant="contained" color="primary" onClick={() => props.onNavBack()}>
                Go Back to My Records
              </Button>
            )}
          </Grid>
          {props.onCopy && (
            <Grid item>
              <Tooltip
                TransitionComponent={Zoom}
                title="Copy the data from the fields, so that you can paste it when you create a new record.">
                <span>
                  <Button disabled={isDisabled} variant="contained" color="primary" onClick={() => props.onCopy()}>
                    Copy Form Data
                  </Button>
                </span>
              </Tooltip>
            </Grid>
          )}
          {props.onPaste && (
            <Grid item>
              <Tooltip
                TransitionComponent={Zoom}
                title="Paste the data to the new record from the previously copied fields.">
                <span>
                  <Button disabled={isDisabled} variant="contained" color="primary" onClick={() => props.onPaste()}>
                    Paste Form Data
                  </Button>
                </span>
              </Tooltip>
            </Grid>
          )}

          {/*
          {props.onSave && (
            <Grid item>
              <Tooltip
                TransitionComponent={Zoom}
                title={
                  props.saveStatus === ActivitySyncStatus.SAVE_SUCCESSFUL
                    ? 'This form has been saved to the database where other InvasivesBC staff can reach it, and does not just live on your device.'
                    : 'Save this form to the InvasivesBC database where other staff can reach it.  Currently this data is only on your device.'
                }>
                <Button
                  //  disabled={isDisabled || props.disableSave}
                  variant="contained"
                  color="primary"
                  onClick={() => props.onSave()}>
                  Save To Database
                </Button>
              </Tooltip>
            </Grid>
          )}
          {props.onReview && !props.disableReview && (
            <Grid item>
              <Tooltip TransitionComponent={Zoom} title={ReviewActionDescriptions[props.reviewStatus]}>
                <Button
                  //     disabled={props.disableReview}
                  variant="contained"
                  color="primary"
                  onClick={() => props.onReview()}>
                  Flag For Admin Review
                </Button>
              </Tooltip>
            </Grid>
          )}
          {props.onApprove && !props.disableApprove && (
            <Grid item>
              <Tooltip
                TransitionComponent={Zoom}
                title="Approve this form so it will be visible to all InvasivesBC users">
                <Button
                  //       disabled={props.disableApprove}
                  variant="contained"
                  color="primary"
                  onClick={() => props.onApprove()}>
                  Approve
                </Button>
              </Tooltip>
            </Grid>
          )}
          {props.onDisapprove && props.disableDisapprove && (
            <Grid item>
              {props.disableDisapprove ? (
                <Tooltip
                  TransitionComponent={Zoom}
                  title="Disapprove this form and kick it back to the original author for revisions">
                  <Button variant="contained" color="primary" onClick={() => props.onDisapprove()}>
                    Disapprove
                  </Button>
                </Tooltip>
              ) : (
                <></>
              )}
            </Grid>
              */}
        </Grid>
      </Grid>
      <DeleteDialog />
    </>
  );
};

export default FormControlsComponent;
