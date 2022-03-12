import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';
import HighlightOffTwoToneIcon from '@mui/icons-material/HighlightOffTwoTone';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  status: {}
}));

export interface ITripStepStatus {
  statusCode: TripStatusCode;
}

export enum TripStatusCode {
  initial = 'initial',
  ready = 'ready',
  error = 'error'
}

export const TripStepStatus: React.FC<ITripStepStatus> = (props) => {
  useStyles();

  if (props.statusCode === TripStatusCode.initial) {
    return (
      <>
        <CheckCircleTwoToneIcon color="disabled" fontSize="large" />
      </>
    );
  } else if (props.statusCode === TripStatusCode.ready) {
    return (
      <>
        <CheckCircleTwoToneIcon color="primary" fontSize="large" />
      </>
    );
  } else {
    return (
      <>
        <HighlightOffTwoToneIcon color="error" fontSize="large" />
      </>
    );
  }
};

export default TripStepStatus;
