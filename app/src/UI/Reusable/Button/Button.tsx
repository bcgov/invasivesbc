import { ComponentPropsWithoutRef } from 'react';
import './button.css';

interface InputButtonProps extends ComponentPropsWithoutRef<'button'> {
  size?: 'sm' | 'med' | 'lg';
}

const Button = ({ size = 'med', className = '', ...props }: InputButtonProps) => (
  <button type="button" className={`invasives-button ${className} ${size}`} {...props} />
);

export default Button;
