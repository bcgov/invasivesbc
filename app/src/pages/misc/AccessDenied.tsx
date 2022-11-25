import { Box, Button, Container, Typography } from '@mui/material';
import { ArrowBack, Login} from '@mui/icons-material';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AUTH_SIGNIN_REQUEST } from 'state/actions';

const AccessDenied = () => {
  const history = useHistory();

  const dispatch = useDispatch();

  const navigateToHome = () => {
    history.push('/home/landing');
  };

  const login = () => {
    dispatch({ type: AUTH_SIGNIN_REQUEST });
  };
  return (
    <Container>
      <Box my={6}>
        <Box>
          <Button variant="text" color="primary" startIcon={<Login />} onClick={login}>
            <Typography variant="body1">Log in to view page</Typography>
          </Button>
          or
          <Button variant="text" color="primary" startIcon={<ArrowBack />} onClick={navigateToHome}>
            <Typography variant="body1">Go back to the home page</Typography>
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default AccessDenied;
