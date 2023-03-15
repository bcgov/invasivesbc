import React, {useEffect, useState} from 'react';
import {Button, Container, Grid, Stack, Typography} from '@mui/material';
import TemplateDownloadList from "../../../components/batch-upload/TemplateDownloadList";
import BatchUploadList from "../../../components/batch-upload/BatchUploadList";
import BatchOverview from '../../../components/batch-upload/BatchOverview';
import BatchCreate from "../../../components/batch-upload/BatchCreate";
import {useInvasivesApi} from "../../../hooks/useInvasivesApi";
import Spinner from "../../../components/spinner/Spinner";

const BatchUploadPage = () => {

  const [displayMode, setDisplayMode] = useState('overview');

  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const api = useInvasivesApi();

  useEffect(async () => {
    setLoading(true);
    const data = await api.getTemplateList();
    setTemplates(data);
    setLoading(false);
  }, []);

  if (loading) {
    return (<Spinner/>);
  }

  return (
    <Container sx={{paddingTop: '2rem', marginBottom: '5rem'}}>

      <Grid container spacing={1}>
        <Grid item xs={3}>
          <Typography variant={'overline'}>Navigation</Typography>

          <Stack>
            <Button disabled onClick={() => setDisplayMode('batches')}>My Batches</Button>
            <Button disabled onClick={() => setDisplayMode('create')}>Create New</Button>
            <Button onClick={() => setDisplayMode('templates')}>Templates</Button>
          </Stack>

        </Grid>
        <Grid item xs={9}>

          {displayMode === 'overview' && <BatchOverview/>}

          {displayMode === 'create' && <BatchCreate templates={templates}/>}

          {displayMode === 'templates' && <TemplateDownloadList templates={templates}/>}

          {displayMode === 'batches' && <BatchUploadList/>}

        </Grid>


      </Grid>
    </Container>

  );
};

export default BatchUploadPage;
