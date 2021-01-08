import React from 'react';
import { Button } from '@material-ui/core';

export interface ICommonButtonProps {
  variant: any;
  color: any;
  icon: any;
  onButtonClick: Function;
  label: string;
}

const CommonButton: React.FC<ICommonButtonProps> = (props) => {
  const { variant, color, icon, onButtonClick, label } = props;

  return (
    <Button variant={variant} color={color} startIcon={icon} onClick={() => onButtonClick()}>
      {label}
    </Button>
  );
};

export default CommonButton;
