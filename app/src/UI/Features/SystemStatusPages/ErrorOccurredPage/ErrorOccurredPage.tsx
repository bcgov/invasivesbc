import { ReactNode } from 'react';
import BackButton from 'UI/Reusable/BackButton/BackButton';
import './errorOccurredPage.css';

type PropTypes = {
  msg?: ReactNode | string;
};
const ErrorOccurredPage = ({ msg }: PropTypes) => {
  // @TODO: Link to bug report page when created.
  return (
    <div id="system-status-error">
      <BackButton className="back-btn" />
      <div className="content">
        {msg ? (
          msg
        ) : (
          <>
            <p>Something went wrong on our end. Please try refreshing the page, or check back in a few minutes.</p>
            <p>If the problem continues, feel free to contact our support team.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ErrorOccurredPage;
