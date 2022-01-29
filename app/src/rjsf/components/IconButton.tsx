import { Button, IconButtonProps as MuiIconButtonProps } from '@mui/material';
import Add from '@mui/icons-material/Add';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import Remove from '@mui/icons-material/Remove';
import React from 'react';

const mappings: any = {
  remove: <Remove />,
  plus: <Add />,
  'arrow-up': <ArrowUpward />,
  'arrow-down': <ArrowDownward />
};

type IconButtonProps = MuiIconButtonProps & {
  icon: string;
};

const IconButton = (props: IconButtonProps) => {
  const { icon, className, ...otherProps } = props;
  return (
    <Button variant="outlined" size="small">
      {mappings[icon]}
    </Button>
  );
};

export default IconButton;
