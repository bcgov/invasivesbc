import { useEffect, useState } from 'react';
import './ErrorHandler.css';
import { Button } from '@mui/material';
import { PersistorContext } from 'utils/PersistorContext';

export const ErrorHandler = ({ detail }) => {
  const [errorText, setErrorText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setErrorText(JSON.stringify(detail, null, 2));
    setCopied(false);
  }, [detail]);

  return (
    <PersistorContext.Consumer>
      {(persistor) => (
        <div className={'errorHandler'}>
          <h2>An Unhandled Error Has Occurred</h2>
          <p>
            The application cannot continue. Please refresh the page and try again. If that doesn't work, click{' '}
            <b>'Clear app data'</b> to reset your cache. Please note that this will{' '}
            <span>reset your record sets and boundaries</span>.
          </p>
          <p>
            If the issue persists, contact the system administrator. Your situation will be logged for their reference,
            and the details will be available for you to share in your communication.
          </p>
          <h3>Error Detail</h3>

          <pre className={'detail'}>{errorText}</pre>
          <div className="controls">
            <Button
              disabled={copied}
              onClick={() => {
                navigator.clipboard.writeText(errorText);
                setCopied(true);
              }}
            >
              {copied ? 'Copied!' : 'Copy Error Detail To Clipboard'}
            </Button>
            <Button
              sx={{ margin: '0.5rem' }}
              variant={'contained'}
              color="error"
              id={'clearAndReload'}
              onClick={() => {
                if (persistor) {
                  persistor.purge().then(() => {
                    window.location.reload();
                  });
                } else {
                  window.location.reload();
                }
              }}
            >
              Clear App Data
            </Button>
          </div>
        </div>
      )}
    </PersistorContext.Consumer>
  );
};
