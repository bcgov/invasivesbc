import { Container } from '@material-ui/core';
import FormContainer from 'components/form/FormContainer';
import React from 'react';

interface IMonitoringProps {
  classes?: any;
  activity: any;
}

const Monitoring: React.FC<IMonitoringProps> = (props) => {
  return (
    <Container className={props.classes.container}>
      <FormContainer {...props} />
    </Container>
  );
};

export default Monitoring;
