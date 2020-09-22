import { Container } from '@material-ui/core';
import React from 'react';

interface IMapProps {
  classes?: any;
}

const ActivityPage: React.FC<IMapProps> = (props) => {

  return <Container className={props.classes.container}>Add Activity Components to me!</Container>;
};

export default ActivityPage;
