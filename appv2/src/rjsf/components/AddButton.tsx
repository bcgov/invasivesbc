import { Button } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import { AddButtonProps } from '@rjsf/core';
import React from 'react';
import { useSelector } from 'util/use_selector';
import { selectUserSettings } from 'state/reducers/userSettings';

const AddButton: React.FC<AddButtonProps> = (props) => {
  const { darkTheme } = useSelector(selectUserSettings);

  return (
    <>
      <Button
        variant="contained"
        className={props.className}
        disabled={props.disabled}
        onClick={props.onClick}
        color={darkTheme ? 'secondary' : 'primary'}>
        <AddIcon /> Add Item
      </Button>
    </>
  );
};

export default AddButton;