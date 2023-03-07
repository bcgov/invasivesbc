import React from 'react';
import {Box, Container, Typography} from '@mui/material';
import TemplateDownloadList from "../../../components/batch-upload/TemplateDownloadList";

const BatchUploadPage = () => {

  return (
    <Container>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h4">Batch Uploads</Typography>
      </Box>

      <TemplateDownloadList/>

    </Container>

  );
};

export default BatchUploadPage;
