import { Box, Button, Container, Typography } from '@mui/material';
import { ArrowBack} from '@mui/icons-material';
import React from 'react';
import { useHistory } from 'react-router-dom';

const AccessDenied = () => {
  const history = useHistory();

  const navigateToHome = () => {
    history.push('/home/landing');
  };

  return (
    <Container>
      <Box my={6}>
        <Box>
          <Button variant="text" color="primary" startIcon={<ArrowBack />} onClick={navigateToHome}>
            <Typography variant="body1">Go back to the home page</Typography>
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default AccessDenied;
