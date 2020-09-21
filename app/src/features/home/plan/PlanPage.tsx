import { Container } from '@material-ui/core';
import React from 'react';

interface IPlanPageProps {
  classes?: any;
}

const PlanPage: React.FC<IPlanPageProps> = (props) => {
  return <Container className={props.classes.container}>Add Plan Components to me!</Container>;
};

export default PlanPage;
