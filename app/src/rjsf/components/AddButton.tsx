import { Button } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import { AddButtonProps } from '@rjsf/core';
import React from 'react';
import { useSelector } from 'utils/use_selector';

const AddButton: React.FC<AddButtonProps> = (props) => {
  const { darkTheme } = useSelector((state: any) => state.UserSettings || ({} as any));

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
