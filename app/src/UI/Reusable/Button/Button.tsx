import { ComponentPropsWithoutRef } from 'react';
import './button.css';

interface InputButtonProps extends ComponentPropsWithoutRef<'button'> {
  size?: 'sm' | 'med' | 'lg';
  variant?: 'contained' | 'outlined' | 'none';
}

const Button = ({ size = 'med', className = '', variant = 'outlined', ...props }: InputButtonProps) => (
  <button type="button" className={`invasives-button ${className} ${size} ${variant}`} {...props} />
);

export type { InputButtonProps };
export default Button;
