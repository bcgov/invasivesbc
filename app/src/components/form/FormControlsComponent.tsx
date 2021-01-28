import { Button, Grid } from '@material-ui/core';
import React from 'react';

export interface IFormControlsComponentProps {
  classes?: any;
  isDisabled?: boolean;
  onSubmit?: Function;
  onCopy?: Function;
  onPaste?: Function;
  activitySubtype?: string;
  hideCheckFormForErrors?: boolean;
}

const FormControlsComponent: React.FC<IFormControlsComponentProps> = (props) => {
  const isDisabled = props.isDisabled || false;

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
                Check Form For Errors
              </Button>
            )}
          </Grid>
          {props.onCopy && (
            <Grid item>
              <Button disabled={isDisabled} variant="contained" color="primary" onClick={() => props.onCopy()}>
                Copy Form Data
              </Button>
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
        </Grid>
      </Grid>
    </>
  );
};

export default FormControlsComponent;
