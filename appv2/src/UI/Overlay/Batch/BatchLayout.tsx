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
            <Link to={'/Batch/list'}>
              My Batches
            </Link>
            <Link to={'/Batch/new'}>
              Create New
            </Link>
            <Link to={'/Batch/templates'}>
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
