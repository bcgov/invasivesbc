import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

const BatchOverview = () => {
  return (
    <Paper>
      <Box mx={3} my={3} py={3}>
        <Typography variant={'h4'}>Batch Uploader</Typography>
        <p>
          This section of the site is for bulk uploads of data. You can download templates, view your existing batch
          uploads (including any records they created), create, and submit new batch upload requests.
        </p>
      </Box>
    </Paper>
  );
};
export default BatchOverview;
