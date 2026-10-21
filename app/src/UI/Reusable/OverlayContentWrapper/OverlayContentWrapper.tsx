import { PropsWithChildren } from 'react';
import './overlayContentWrapper.css';
import BackButton from '../BackButton/BackButton';

interface PropTypes extends PropsWithChildren {
  backButton?: boolean;
}
const OverlayContentWrapper = ({ backButton, children }: PropTypes) => {
  return (
    <div className={`overlay-content-wrapper`}>
      {backButton && (
        <div className="back-button">
          <BackButton />
        </div>
      )}
      {children}
    </div>
  );
};
export default OverlayContentWrapper;
