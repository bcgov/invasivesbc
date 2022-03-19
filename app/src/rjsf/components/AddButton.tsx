import { Button } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import { AddButtonProps } from '@rjsf/core';
import React, { useContext } from 'react';
import { ThemeContext } from 'utils/CustomThemeProvider';

const AddButton: React.FC<AddButtonProps> = (props) => {
  const { themeType } = useContext(ThemeContext);

  return (
    <>
      <Button
        variant="contained"
        className={props.className}
        disabled={props.disabled}
        onClick={props.onClick}
        color={themeType ? 'secondary' : 'primary'}>
        <AddIcon /> Add Item
      </Button>
    </>
  );
};

export default AddButton;
