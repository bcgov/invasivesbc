import { ReactNode } from 'react';
import Spinner from 'UI/Reusable/Spinner/Spinner';
import BackButton from 'UI/Reusable/BackButton/BackButton';
import './loadingPage.css';

/**
 * @param {ReactNode} msg Optional message override for Loading Pages
 */
type PropTypes = {
  msg?: ReactNode | string;
};

const LoadingPage = ({ msg }: PropTypes) => {
  return (
    <div id="system-status-loading">
      <BackButton className="back-btn" />
      <div className="content">
        {msg ? msg : <p>Getting requested data...</p>}
        <Spinner />
      </div>
    </div>
  );
};
export default LoadingPage;
