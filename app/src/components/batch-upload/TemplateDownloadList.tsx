import {Box, Button, Paper, Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {useInvasivesApi} from '../../hooks/useInvasivesApi';
import Spinner from '../spinner/Spinner';
import TemplatePreview from './TemplatePreview';
import {Download} from "@mui/icons-material";

const TemplateDownloadList = () => {
  const api = useInvasivesApi();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);

  useEffect(async () => {
    setLoading(true);
    const data = await api.getTemplateList();
    console.dir(data);
    setTemplates(data);
    setLoading(false);
  }, []);

  const downloadTemplate = async (key: string) => {
    const downloadAPICall = api.downloadTemplate;

    const data = await downloadAPICall(key, 'csv', false);
    const dataUrl = `data:text/csv;base64,${btoa(data)}`;

    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', dataUrl);
    downloadLink.setAttribute('download', `InvasivesBC ${key} template.csv`);
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  if (loading) {
    return <Spinner/>;
  }

  return (
    <Paper>
      <Box mx={3} my={3} py={3}>
        <Typography variant={'h4'}>Available Templates</Typography>
        {templates.map((t) => (
          <div className='template-description' key={t.name}>
            <h5>{t.name}</h5>
            <Button
              variant={'contained'}
              className={'template-download-link'}
              onClick={() => {
                downloadTemplate(t.key);
              }}>
              Download Template CSV
              <Download fontSize={"medium"}/>
            </Button>
            <TemplatePreview id={t.key}/>
          </div>
        ))}
      </Box>
    </Paper>
  );
};

export default TemplateDownloadList;
