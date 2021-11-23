import Button from '@material-ui/core/Button';
import { IconButtonProps as MuiIconButtonProps } from '@material-ui/core/IconButton';
import Add from '@material-ui/icons/Add';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Remove from '@material-ui/icons/Remove';
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
    <Button variant="outlined" {...otherProps} size="small">
      {mappings[icon]}
    </Button>
  );
};

export default IconButton;
