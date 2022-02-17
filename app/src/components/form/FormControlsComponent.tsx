import { Button, Grid, Tooltip, Zoom } from '@mui/material';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { ActivitySyncStatus, ReviewActionDescriptions } from '../../constants/activities';

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

const FormControlsComponent: React.FC<IFormControlsComponentProps> = (props) => {
  const isDisabled = props.isDisabled || false;
  const history = useHistory();

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
            {!props.hideCheckFormForErrors && (
              <Tooltip
                title={
                  props.isAlreadySubmitted()
                    ? 'With edit permissions, you can still save edits with the Save button, but this record is already submitted.'
                    : !props.canBeSubmittedWithoutErrors()
                    ? 'Save form without errors first, to be able to submit.'
                    : 'Ready to submit, form is validated and has no issues.'
                }>
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
          {sessionStorage.getItem('copiedFormData') &&
            sessionStorage.getItem('activitySubtype') === props.activitySubtype &&
            props.onPaste && (
              <Grid item>
                <Button disabled={isDisabled} variant="contained" color="primary" onClick={() => props.onPaste()}>
                  Paste Form Data
                </Button>
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
    </>
  );
};

export default FormControlsComponent;
