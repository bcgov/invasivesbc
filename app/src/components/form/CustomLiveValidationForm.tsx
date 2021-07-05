import React from 'react';
import Form from '@rjsf/material-ui';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';

function CustomLiveValidationForm(props) {
  const [formRef, setFormRef] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [alertMsg, setAlertMsg] = React.useState(null);
  const [field, setField] = React.useState('');

  //open dialog window (visual)
  const openDialog = () => {
    setOpen(true);
  };

  //close the dialog windo (visual)
  const handleClose = () => {
    setOpen(false);
  };

  //Dialog Proceed OnClick func
  const proceedClick = () => {
    //setTimeout is called so that the setState works as expected
    setTimeout(() => {
      const $this = formRef;
      //declare and initialize no validation fields array from formData if any
      let noValidationFields: string[] = [];
      if ($this.state.formData.forceNoValidationFields) {
        noValidationFields = [...$this.state.formData.forceNoValidationFields];
      }
      //add field to no validation if not there already
      if (!noValidationFields.includes(field)) {
        noValidationFields.push(field);
      }
      //set new state with updated array of noValidate fields
      let newFormData = $this.state.formData;
      newFormData.forceNoValidationFields = noValidationFields;
      $this.setState({ formData: newFormData }, () => {
        //revalidate formData after the setState is run
        $this.validate($this.state.formData);
        //update formData of the activity via onFormBlur
        props.onFormBlur(formRef.state.formData);
      });
    }, 100);
    handleClose();
  };

  //helper function to get field name from args
  const getFieldNameFromArgs = (args): string => {
    let argumentFieldName;
    if (args[0].includes('root_activity_subtype_data_herbicide_0_')) {
      argumentFieldName = 'root_activity_subtype_data_herbicide_0_';
    } else if (args[0].includes('root_activity_subtype_data_')) {
      argumentFieldName = 'root_activity_subtype_data_';
    } else if (args[0].includes('root_activity_data_')) {
      argumentFieldName = 'root_activity_data_';
    }
    let fieldName = args[0].substr(argumentFieldName.length);
    return fieldName;
  };

  //herlper function to get the path to the field in an oject.
  //if multiple found, stores multiple strings in array
  const getPathToFieldName = (obj: any, predicate: Function) => {
    const discoveredObjects = []; // For checking for cyclic object
    const path = []; // The current path being searched
    const results = []; // The array of paths that satify the predicate === true
    if (!obj && (typeof obj !== 'object' || Array.isArray(obj))) {
      throw new TypeError('First argument of finPropPath is not the correct type Object');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('Predicate is not a function');
    }
    (function find(obj) {
      for (const key of Object.keys(obj)) {
        // use only enumrable own properties.
        if (predicate(key, path, obj) === true) {
          // Found a path
          path.push(key); // push the key
          results.push(path.join('.')); // Add the found path to results
          path.pop(); // remove the key.
        }
        const o = obj[key]; // The next object to be searched
        if (o && typeof o === 'object' && !Array.isArray(o)) {
          // check for null then type object
          if (!discoveredObjects.find((obj) => obj === o)) {
            // check for cyclic link
            path.push(key);
            discoveredObjects.push(o);
            find(o);
            path.pop();
          }
        } else if (o && Array.isArray(o)) {
          //if array
          for (let item1 in o) {
            if (typeof item1 != 'object') {
              path.push(item1);
            }
            for (let item of o) {
              if (typeof item != 'object') path.push(item);
              find(item);
              path.pop();
              path.pop();
            }
          }
        }
      }
    })(obj);
    return results;
  };

  //helper function - find the value of the property given the path to it whithin the oject
  const deepFind = (obj: any, path: string, newValue?: string) => {
    let paths = path.split('.'),
      current = obj;
    for (let i = 0; i < paths.length; ++i) {
      if (current[paths[i]] === undefined) {
        return undefined;
      } else {
        current = current[paths[i]];
      }
    }
    return current;
  };

  //handle blur the field
  const blurHandler = (...args: string[]) => {
    const $this = formRef;
    const field = getFieldNameFromArgs(args);
    const { formData, uiSchema } = $this.state;
    let path = getPathToFieldName(uiSchema, (key) => key === field);
    if (deepFind(uiSchema, path[0] + '')) {
      if (deepFind(uiSchema, path[0] + '.validateOnBlur')) {
        const { errorSchema } = $this.validate(formData);
        let errorPath = getPathToFieldName(errorSchema, (key) => key === field);
        if (deepFind(errorSchema, errorPath[0] + '.__errors.0')) {
          setAlertMsg(deepFind(errorSchema, errorPath[0] + '.__errors.0'));
          setField(field);
          openDialog();
        }
      }
    }
  };

  //handle focus the field
  //onFocus - if the field that is being focused is in forceNoValidation fields, remove it from there,
  //so that the user will be tasked to force the value out of range again
  const focusHandler = (...args: string[]) => {
    let field = getFieldNameFromArgs(args);
    const $this = formRef;
    const { formData } = $this.state;
    if (formData.forceNoValidationFields && formData.forceNoValidationFields.includes(field)) {
      const index = formData.forceNoValidationFields.indexOf(field);
      if (index > -1) {
        formData.forceNoValidationFields.splice(index, 1);
      }
      $this.setState({ formData: formData }, () => {
        props.onFormBlur(formRef.state.formData);
      });
    }
  };

  return (
    <>
      <Form
        {...props}
        ref={(form) => {
          if (form) {
            setFormRef(form);
            props.customRef(form);
          }
        }}
        onFocus={focusHandler}
        onBlur={blurHandler}
      />
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
          <Button onClick={handleClose} color="primary">
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
