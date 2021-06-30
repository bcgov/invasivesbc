import React, { useRef, useEffect } from 'react';
import Form from '@rjsf/material-ui';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';

function CustomLiveValidationForm(props) {
  const myRef = useRef(props.customRef);

  const [open, setOpen] = React.useState(false);
  const [alertMsg, setAlertMsg] = React.useState(null);
  const [field, setField] = React.useState('');

  const openDialog = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const proceedClick = () => {
    const $this = myRef.current;
    let noValidationFields: string[] = [];
    if ($this.state.formData.forceNoValidationFields) {
      noValidationFields = [...$this.state.formData.forceNoValidationFields];
    }
    if (!noValidationFields.includes(field)) {
      noValidationFields.push(field);
    }
    $this.setState(
      (prevState) => ({
        ...prevState,
        formData: { ...prevState.formData, forceNoValidationFields: noValidationFields }
      }),
      () => {
        console.log($this.state.formData);
        $this.validate($this.state.formData);
      }
    );

    handleClose();
  };

  const cancelClick = () => {
    /* TODO: implement cancel */
    handleClose();
  };

  const blurHandler = (...args: string[]) => {
    if (args[0].includes('root_activity_subtype_data_')) {
      const $this = myRef.current;
      const field = args[0].substr('root_activity_subtype_data_'.length);
      const { formData, uiSchema } = $this.state;
      if (uiSchema.activity_subtype_data[field]) {
        if (uiSchema.activity_subtype_data[field] && uiSchema.activity_subtype_data[field].validateOnBlur) {
          const { errorSchema } = $this.validate(formData);
          if (errorSchema.activity_subtype_data[field]['__errors'][0]) {
            setAlertMsg(errorSchema.activity_subtype_data[field]['__errors'][0]);
            setField(field);
            openDialog();
          }
        }
      }
    }
  };

  const focusHandler = (...args: string[]) => {
    // if (args[0].includes('root_activity_subtype_data_')) {
    //   const field = args[0].substr('root_activity_subtype_data_'.length);
    //   const $this = myRef.current;
    //   const { formData, uiSchema, errorSchema } = $this.state;
    //   if (formData.forceNoValidationFields && formData.forceNoValidationFields.includes(field)) {
    //     formData.forceNoValidationFields.pop(field);
    //   }
    // }
  };

  return (
    <>
      <Form {...props} ref={myRef} onFocus={focusHandler} onBlur={blurHandler} />
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{'Are you sure?'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{alertMsg}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelClick} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              proceedClick();
            }}
            color="primary"
            autoFocus>
            Proceed
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default CustomLiveValidationForm;
