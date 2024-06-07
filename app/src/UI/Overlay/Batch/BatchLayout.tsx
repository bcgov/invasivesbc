import React from 'react';
import { Box, Container, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUserSettings } from 'state/reducers/userSettings';
import './Batch.css';

const BatchLayout = ({ children }) => {
  const { darkTheme } = useSelector(selectUserSettings);
  const url = window.location.href;
  return (
    <>
      <Box className={`batchNav ${darkTheme ? 'batchDarkNav' : ''}`}>
        <Container maxWidth={'lg'}>
          <Stack direction="row" justifyContent="start" alignItems="center" spacing={6}>
            <Link to={'/Batch/list'} className={url.includes('Batch/list') ? 'current_batch_link' : ''}>
              My Batches
            </Link>
            <Link to={'/Batch/new'} className={url.includes('/Batch/new') ? 'current_batch_link' : ''}>
              Create New
            </Link>
            <Link to={'/Batch/templates'} className={url.includes('/Batch/templates') ? 'current_batch_link' : ''}>
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
