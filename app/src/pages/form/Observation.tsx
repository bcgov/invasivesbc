import { Container } from '@material-ui/core';
import FormContainer from 'components/form/FormContainer';
import React from 'react';

interface IObservationProps {
  classes?: any;
  activity: any;
}

const Observation: React.FC<IObservationProps> = (props) => {
  return (
    <Container className={props.classes.container}>
      <FormContainer {...props} />
    </Container>
  );
};

export default Observation;
