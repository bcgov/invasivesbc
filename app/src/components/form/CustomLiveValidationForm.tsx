import React, { useRef, useEffect } from 'react';
import Form from '@rjsf/material-ui';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';

function CustomLiveValidationForm(props) {
  const myRef = useRef(props.customRef);

  const [open, setOpen] = React.useState(false);
  const [alertMsg, setAlertMsg] = React.useState(null);
  const [field, setField] = React.useState('');
  const [activityDataTypeName, setActivityDataTypeName] = React.useState('');

  //open dialog window (visual)
  const openDialog = () => {
    setOpen(true);
  };

  //close the dialog windo (visual)
  const handleClose = () => {
    setOpen(false);
  };

  //Dialog Cancel OnClick func
  const cancelClick = () => {
    /* TODO: implement cancel */
    const $this = myRef.current;
    let newFormData = $this.state.formData;

    newFormData[activityDataTypeName][field] = isNaN(newFormData[activityDataTypeName][field]) ? '' : 0;
    console.log(myRef.current.state.formData);
    handleClose();
  };

  //Dialog Proceed OnClick func
  const proceedClick = () => {
    setTimeout(() => {
      const $this = myRef.current;
      let noValidationFields: string[] = [];
      if ($this.state.formData.forceNoValidationFields) {
        noValidationFields = [...$this.state.formData.forceNoValidationFields];
      }
      if (!noValidationFields.includes(field)) {
        noValidationFields.push(field);
      }
      let newFormData = $this.state.formData;
      newFormData.forceNoValidationFields = noValidationFields;
      $this.setState({ formData: newFormData }, () => {
        $this.validate($this.state.formData);
        console.log(myRef.current.state.formData);
      });
    }, 100);
    handleClose();
  };

  //handle blur the field
  const blurHandler = (...args: string[]) => {
    let activityDataType = args[0].includes('root_activity_subtype_data_')
      ? 'root_activity_subtype_data_'
      : 'root_activity_data_';
    setAlertMsg(args);
    setActivityDataTypeName(
      args[0].includes('root_activity_subtype_data_') ? 'activity_subtype_data' : 'activity_data'
    );
    let activityDataTypeName = args[0].includes('root_activity_subtype_data_')
      ? 'activity_subtype_data'
      : 'activity_data';
    const $this = myRef.current;
    const field = args[0].substr(activityDataType.length);
    const { formData, uiSchema } = $this.state;
    if (uiSchema[activityDataTypeName][field]) {
      if (uiSchema[activityDataTypeName][field] && uiSchema[activityDataTypeName][field].validateOnBlur) {
        const { errorSchema } = $this.validate(formData);
        if (errorSchema[activityDataTypeName][field]['__errors'][0]) {
          setAlertMsg(errorSchema[activityDataTypeName][field]['__errors'][0]);
          setField(field);
          openDialog();
        }
      }
    }
  };

  //handle focus the field
  const focusHandler = (...args: string[]) => {
    if (args[0].includes('root_activity_subtype_data_')) {
      const field = args[0].substr('root_activity_subtype_data_'.length);
      const $this = myRef.current;
      const { formData, uiSchema, errorSchema } = $this.state;
      if (formData.forceNoValidationFields && formData.forceNoValidationFields.includes(field)) {
        formData.forceNoValidationFields.pop(field);
      }
      console.log(formData);
    }
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
