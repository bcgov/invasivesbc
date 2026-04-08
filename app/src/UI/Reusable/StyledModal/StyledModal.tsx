/**
 * Blank Modal container with predefined style types for header, content and control
 * To use: Import StyledModal, and supply containers with the classes
 * <div className="header" />
 * <div className="content" />
 * <div className="control" />
 */
import { PropsWithChildren } from 'react';
import './StyledModal.css';

type PropTypes = {
  open: boolean;
  variant?: 'primary' | 'secondary' | 'blank'; // Can extend this later to add colour types for different use cases
  onClose: () => void;
  className?: string;
  id?: string;
} & PropsWithChildren;

const StyledModal = ({ open, variant = 'primary', onClose, className = '', id = '', children }: PropTypes) => {
  if (!open) return;
  return (
    <div id="styled-modal-outter" data-testid="styled-modal" onClick={onClose}>
      <div className={`styled-modal ${variant} ${className}`} id={id} onClick={(evt) => evt.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default StyledModal;
