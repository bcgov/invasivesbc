import { Container, Grid } from '@mui/material';
import React from 'react';
import EmailSettings from './EmailSettings';
import EmailTemplates from './EmailTemplates';

const EmailSetup = (props) => {

  return (
    <Container style={{ padding: '2rem' }}>
      <Grid container spacing={4}>
        <EmailSettings />
        <EmailTemplates />
      </Grid>
    </Container>
  );
};
export default EmailSetup;
