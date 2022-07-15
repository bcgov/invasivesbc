import React, { useState } from 'react';
import { IErrorBanner, ErrorContext } from 'contexts/ErrorContext';
import { Alert, AlertColor, AlertTitle, Box } from '@mui/material';
import { useContext, useEffect } from 'react';

export const ErrorBanner = (props: IErrorBanner) => {
  const errorContext = useContext(ErrorContext);
  const [severity, setSeverity]: AlertColor = useState('error');

  const triggerOnClose = () => {
    errorContext.clearError({
      message: props.message,
      code: props.code,
      namespace: props.namespace
    });
  };

  useEffect(() => {
    switch (props.code) {
      case 401:
        setSeverity('warning');
        break;
      default:
        setSeverity('error');
    }
  });

  useEffect(() => {
    if (errorContext) {
      setTimeout(() => {
        triggerOnClose();
      }, 5000);
    }
  }, [errorContext]);

  const message = process.env.REACT_APP_REAL_NODE_ENV !== 'production' && props.code + ' - ' + props.namespace;

  return (
    <Box margin={2}>
      <Alert variant="filled" severity={severity} onClose={triggerOnClose}>
        <AlertTitle>{message}</AlertTitle>
        {props.message}
      </Alert>
    </Box>
  );
};
