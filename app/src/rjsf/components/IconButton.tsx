import Add from '@mui/icons-material/Add';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import Remove from '@mui/icons-material/Remove';
import React from 'react';
import { Button } from '@mui/material';

const mappings = {
  remove: <Remove />,
  plus: <Add />,
  'arrow-up': <ArrowUpward />,
  'arrow-down': <ArrowDownward />
};

const IconButton = (props) => {
  const { icon, className, ...otherProps } = props;
  return (
    <Button variant="outlined" {...otherProps} size="small">
      {mappings[icon]}
    </Button>
  );
};

export default IconButton;
