import { Container } from '@material-ui/core';
import FormContainer from 'components/form/FormContainer';
import React from 'react';

interface ITreatmentProps {
  classes?: any;
  activity: any;
}

const Treatment: React.FC<ITreatmentProps> = (props) => {
  return (
    <Container className={props.classes.container}>
      <FormContainer {...props} />
    </Container>
  );
};

export default Treatment;
