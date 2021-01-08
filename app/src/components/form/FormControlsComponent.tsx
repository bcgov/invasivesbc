import { Grid } from '@material-ui/core';
import React from 'react';
import CommonButton from 'components/common/CommonButton';

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
            <CommonButton
              isDisabled={isDisabled}
              variant="contained"
              color="primary"
              onButtonClick={() => {
                if (!props.onSubmit) {
                  return;
                }

                props.onSubmit();
              }}
              label="Check Form For Errors"
            />
          </Grid>
          {props.onCopy && (
            <Grid item>
              <CommonButton
                isDisabled={isDisabled}
                variant="contained"
                color="primary"
                onButtonClick={() => props.onCopy()}
                label="Copy Form Data"
              />
            </Grid>
          )}
          {sessionStorage.getItem('copiedFormData') &&
            sessionStorage.getItem('activitySubtype') === props.activitySubtype &&
            props.onPaste && (
              <Grid item>
                <CommonButton
                  isDisabled={isDisabled}
                  variant="contained"
                  color="primary"
                  onButtonClick={() => props.onPaste()}
                  label="Paste Form Data"
                />
              </Grid>
            )}
        </Grid>
      </Grid>
    </>
  );
};

export default FormControlsComponent;
