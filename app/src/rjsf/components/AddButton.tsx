import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import { AddButtonProps } from '@rjsf/core';
import React from 'react';

const AddButton: React.FC<AddButtonProps> = (props) => (
  <Button variant="contained" {...props} color="primary">
    <AddIcon /> Add Item
  </Button>
);

export default AddButton;
