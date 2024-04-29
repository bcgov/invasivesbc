import React from 'react';
import './ErrorHandler.css';

export const ConnectivityErrorHandler = () => {

  return (
    <div className={'connectivityError'}>
      <h2>An temporary connectivity error has occurred</h2>

      <p>
        The application will attempt to recover. Please wait while connectivity is restored. If this message persists
        for more than 1 minute, try refreshing your browser.
      </p>

    </div>
  );
};
