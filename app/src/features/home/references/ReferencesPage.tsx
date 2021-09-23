import { Container } from '@material-ui/core';
import CachedRecordsList from 'components/activities-list/CachedRecordsList';
import React from 'react';

interface IReferencesPagePage {
  classes?: any;
}

const ReferencesPage: React.FC<IReferencesPagePage> = (props) => {
  return (
    <Container className={props.classes.container}>
      <CachedRecordsList />
    </Container>
  );
};

export default ReferencesPage;
