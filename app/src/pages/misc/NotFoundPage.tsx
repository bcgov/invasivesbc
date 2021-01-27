import { Box, Button, Container, makeStyles, Typography } from '@material-ui/core';
import { ArrowBack, Warning } from '@material-ui/icons';
import React from 'react';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  warningIcon: {
    verticalAlign: 'middle',
    fontSize: '3rem',
    marginRight: '1rem'
  }
}));

export const NotFoundPage = () => {
  const classes = useStyles();

  const history = useHistory();

  const navigateToHome = () => {
    history.push('/home');
  };

  return (
    <Container>
      <Box my={6}>
        <Box mb={3}>
          <Typography variant="h1">
            <Warning className={classes.warningIcon} />
            Page not found
          </Typography>
        </Box>
        <Box>
          <Button variant="text" color="primary" startIcon={<ArrowBack />} onClick={navigateToHome}>
            <Typography variant="body1">Go back to the home page</Typography>
          </Button>
        </Box>
      </Box>
    </Container>
  );
};
