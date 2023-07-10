import React from 'react';
import { Box, Container, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUserSettings } from 'state/reducers/userSettings';


const BatchLayout = ({ children }) => {
  const {darkTheme} = useSelector(selectUserSettings);
  return (
    <>
      <Box className={`batchNav ${darkTheme? 'batchDarkNav' : ''}`}>
        <Container maxWidth={'lg'}>
          <Stack direction="row" justifyContent="start" alignItems="center" spacing={6}>
            <Link to={'/home/batch'}>
              My Batches
            </Link>
            <Link to={'/home/batch/new'}>
              Create New
            </Link>
            <Link to={'/home/batch/templates'}>
              Templates
            </Link>
          </Stack>
        </Container>
      </Box>

      <Box sx={{ paddingTop: '2rem', marginBottom: '5rem' }}>{children}</Box>
    </>
  );
};

export default BatchLayout;
