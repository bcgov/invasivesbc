import { Box, Button, Container, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ArrowBack, Warning } from '@mui/icons-material';
import React from 'react';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => ({
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
    history.push('/home/landing');
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
