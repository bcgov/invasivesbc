import { Button, Grid } from '@mui/material';
import React from 'react';
export interface IPasteButtonComponentProps {
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

const PasteButtonComponent: React.FC<IPasteButtonComponentProps> = (props) => {
  const isDisabled = props.isDisabled || false;

  return (
    <>
      <Grid container>
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
    </>
  );
};

export default PasteButtonComponent;
