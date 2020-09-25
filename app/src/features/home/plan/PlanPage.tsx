import { Container } from '@material-ui/core';
import ManageDatabaseContainer from 'components/database/ClearDatabase';
import React from 'react';

interface IPlanPageProps {
  classes?: any;
}

const PlanPage: React.FC<IPlanPageProps> = (props) => {
  return (
    <Container className={props.classes.container}>
      <ManageDatabaseContainer />
    </Container>
  );
};

export default PlanPage;
