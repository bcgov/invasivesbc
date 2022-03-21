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

  return (
    <Box margin={2}>
      <Alert variant="filled" severity="error" onClose={triggerOnClose}>
        <AlertTitle>
          {props.code} - {props.namespace}
        </AlertTitle>
        {props.message}
      </Alert>
    </Box>
  );
};
