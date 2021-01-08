import React from 'react';
import { Button } from '@material-ui/core';

export interface ICommonButtonProps {
  variant: any;
  color?: any;
  size?: any;
  icon?: any;
  onButtonClick: Function;
  label: string;
  isDisabled?: boolean;
}

const CommonButton: React.FC<ICommonButtonProps> = (props) => {
  const { size, variant, color, icon, onButtonClick, label, isDisabled } = props;

  return (
    <Button
      size={size || 'medium'}
      variant={variant}
      color={color || 'default'}
      startIcon={icon}
      onClick={() => onButtonClick()}
      disabled={isDisabled}>
      {label}
    </Button>
  );
};

export default CommonButton;
