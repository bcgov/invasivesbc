import React from 'react';
import { IErrorBanner, ErrorContext } from 'contexts/ErrorContext';
import { Alert, AlertTitle, Box } from '@mui/material';
import { useContext } from 'react';

export const ErrorBanner = (props: IErrorBanner) => {
  const errorContext = useContext(ErrorContext);

  const triggerOnClose = () => {
    errorContext.clearError({
      message: props.message,
      code: props.code,
      namespace: props.namespace
    });
  };

  const message = process.env.REACT_APP_REAL_NODE_ENV !== 'production' && props.code + ' - ' + props.namespace;

  return (
    <Box margin={2}>
      <Alert variant="filled" severity="error" onClose={triggerOnClose}>
        <AlertTitle>{message}</AlertTitle>
        {props.message}
      </Alert>
    </Box>
  );
};
