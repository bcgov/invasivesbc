import React, { useState } from 'react';
import { Box, Button, Container, Grid, Stack, Typography } from '@mui/material';
import TemplateDownloadList from "../../../components/batch-upload/TemplateDownloadList";
import BatchUploadList from "../../../components/batch-upload/BatchUploadList";
import BatchOverview from '../../../components/batch-upload/BatchOverview';

const BatchUploadPage = () => {

  const [displayMode, setDisplayMode] = useState('overview');

  return (
    <Container fixed sx={{paddingTop: '2rem', marginBottom: '5rem'}}>

      <Grid container spacing={1}>
        <Grid item xs={3}>
          <Typography variant={'overline'}>Navigation</Typography>

          <Stack>
            <Button onClick={() => setDisplayMode('batches')}>My Batches</Button>
            <Button onClick={() => setDisplayMode('create')}>Create New</Button>
            <Button onClick={() => setDisplayMode('templates')}>Templates</Button>
          </Stack>

        </Grid>
        <Grid item xs={9}>

          {displayMode === 'overview' && <BatchOverview />}

          {displayMode === 'templates' && <TemplateDownloadList />}

          {displayMode === 'batches' && <BatchUploadList />}

        </Grid>


      </Grid>
    </Container>

  );
};

export default BatchUploadPage;
