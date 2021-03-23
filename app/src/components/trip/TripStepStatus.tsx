import { makeStyles } from '@material-ui/core';
import React from 'react';
import CheckCircleTwoToneIcon from '@material-ui/icons/CheckCircleTwoTone';
import HighlightOffTwoToneIcon from '@material-ui/icons/HighlightOffTwoTone';
import CancelTwoToneIcon from '@material-ui/icons/CancelTwoTone';
import AutorenewTwoToneIcon from '@material-ui/icons/AutorenewTwoTone';

const useStyles = makeStyles((theme) => ({
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

  if (props.statusCode == TripStatusCode.initial) {
    return (
      <>
        <CheckCircleTwoToneIcon color="disabled" fontSize="large" />
      </>
    );
  } else if (props.statusCode == TripStatusCode.ready) {
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
