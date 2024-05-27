import React, { useEffect, useState } from 'react';
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
          <h2>An unhandled error has occurred</h2>

          <p>
            The application cannot continue. Please refresh the page and try again. If refreshing does not work please
            click 'Clear app data' to reset your cache and try again. This will reset your record sets and boundaries.
            If the problem persists, please contact the system administrator. This information will be logged for
            admins, and the details are also provided here for you to reference in communications.
          </p>

          <h4>Error Detail</h4>

          <pre className={'detail'}>{errorText}</pre>

          <Button
            disabled={copied}
            onClick={() => {
              navigator.clipboard.writeText(errorText);
              setCopied(true);
            }}>
            {copied ? 'Copied!' : 'Copy Error Detail To Clipboard'}
          </Button>

          <Button
            sx={{ margin: '0.5rem' }}
            variant={'contained'}
            id={'clearAndReload'}
            onClick={() => {
              if (persistor) {
                persistor.purge().then(() => {
                  window.location.reload();
                });
              } else {
                window.location.reload();
              }
            }}>
            Clear App Data
          </Button>
        </div>
      )}
    </PersistorContext.Consumer>
  );
};
