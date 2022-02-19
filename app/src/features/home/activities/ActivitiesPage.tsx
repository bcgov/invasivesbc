import { Container } from '@mui/material';
import React from 'react';
import ActivitiesList from '../../../components/activities-list/ActivitiesList';
import ActivitiesList2 from '../../../components/activities-list/ActivitiesList2';

interface IStatusPageProps {
  classes?: any;
}

const ActivitiesPage: React.FC<IStatusPageProps> = (props) => {
  return (
    <Container maxWidth={false} className={props.classes.container}>
      {/* <ActivitiesList /> */}
      <ActivitiesList2 />
    </Container>
  );
};

export default ActivitiesPage;
