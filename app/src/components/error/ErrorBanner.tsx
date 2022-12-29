import React, {useState} from 'react';
import {IErrorBanner, ErrorContext} from 'contexts/ErrorContext';
import {Alert, AlertColor, AlertTitle, Box} from '@mui/material';
import {useContext, useEffect} from 'react';
import {CONFIG} from "../../state/config";

export const ErrorBanner = (props: IErrorBanner) => {
  const errorContext = useContext(ErrorContext);
  const [severity, setSeverity] = useState<AlertColor>('error');

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

  const message = CONFIG.DEBUG && props.code + ' - ' + props.namespace;

  return (
    <Box margin={2}>
      <Alert variant="filled" severity={severity} onClose={triggerOnClose}>
        <AlertTitle>{message}</AlertTitle>
        {props.message}
      </Alert>
    </Box>
  );
};
