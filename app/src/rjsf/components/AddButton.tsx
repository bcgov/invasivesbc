import { Button } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import React from 'react';
import { useSelector } from 'utils/use_selector';

const AddButton = (props) => {
  const { darkTheme } = useSelector((state) => state.UserSettings);

  return (
    <>
      <Button
        variant="contained"
        className={props.className}
        disabled={props.disabled}
        onClick={props.onClick}
        color={darkTheme ? 'secondary' : 'primary'}
      >
        <AddIcon /> Add Item
      </Button>
    </>
  );
};

export default AddButton;
