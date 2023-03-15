import {Accordion, AccordionDetails, AccordionSummary, Box, Button, Typography} from '@mui/material';
import React from 'react';
import {useInvasivesApi} from '../../hooks/useInvasivesApi';
import TemplatePreview from './TemplatePreview';
import {Download} from "@mui/icons-material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const TemplateDownloadList = ({templates}) => {
  const api = useInvasivesApi();

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

  return (
    <>
      <Typography variant={'h4'}>Available Templates</Typography>
      {templates.map((t) => (

        <Accordion key={t.name} sx={{marginBottom: '0.5rem'}}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'inline-flex', justifyContent: 'space-between', width: '100%' }}>
              <Typography>{t.name}</Typography>
              <Button
                variant={'contained'}
                className={'template-download-link'}
                onClick={() => {
                  downloadTemplate(t.key);
                }}>
                Download Template CSV
                <Download fontSize={"medium"} />
              </Button>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <div className="template-description">

              <TemplatePreview id={t.key} />
            </div>
          </AccordionDetails>
        </Accordion>

      ))}
    </>
  );
};

export default TemplateDownloadList;
