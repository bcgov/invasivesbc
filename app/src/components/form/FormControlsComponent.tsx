import { Button, Grid } from '@material-ui/core';
import React from 'react';

export interface IFormControlsComponentProps {
  classes?: any;
  isDisabled?: boolean;
  onSubmit?: Function;
  onCopy?: Function;
  onPaste?: Function;
  activitySubtype?: string;
}

const FormControlsComponent: React.FC<IFormControlsComponentProps> = (props) => {
  const isDisabled = props.isDisabled || false;

  return (
    <>
      <Grid container spacing={3}>
        <Grid container item spacing={3}>
          <Grid item>
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
          </Grid>
          <Grid item>
            <Button
              disabled={isDisabled}
              variant="contained"
              color="primary"
              onClick={() => {
                if (!props.onCopy) {
                  return;
                }

                props.onCopy();
              }}>
              Copy Form Data
            </Button>
          </Grid>
          {
            sessionStorage.getItem('copiedFormData') &&
            sessionStorage.getItem('activitySubtype') === props.activitySubtype &&
            (
              <Grid item>
                <Button
                  disabled={isDisabled}
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    if (!props.onPaste) {
                      return;
                    }

                    props.onPaste();
                  }}>
                  Paste Form Data
                </Button>
              </Grid>
            )
          }
        </Grid>
      </Grid>
    </>
  );
};

export default FormControlsComponent;
