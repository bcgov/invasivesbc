import { Container } from '@material-ui/core';
import ReferenceActivitiesList from 'components/activities-list/ReferenceActivitiesList';
import React from 'react';

interface IReferenceActivitiesPage {
  classes?: any;
}

const ReferenceActivitiesPage: React.FC<IReferenceActivitiesPage> = (props) => {
  return (
    <Container className={props.classes.container}>
      <ReferenceActivitiesList />
    </Container>
  );
};

export default ReferenceActivitiesPage;
