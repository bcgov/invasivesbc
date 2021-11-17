import React, {useEffect, useState} from 'react';
import {Box, Paper, Typography} from '@material-ui/core';
import {useInvasivesApi} from "../../hooks/useInvasivesApi";

const TemplateDownload: React.FC = () => {
  const api = useInvasivesApi();

  const downloadTemplate = async (version) => {
    let downloadAPICall;

    if (version === 'v2') {
      downloadAPICall = api.downloadTemplateV2;
    } else {
      downloadAPICall = api.downloadTemplate;
    }

    const data = await downloadAPICall();
    const dataUrl = `data:text/csv;base64,${btoa(data)}`;

    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', dataUrl);
    downloadLink.setAttribute('download', 'plant-template.csv');
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <Paper>
      <Box mx={3} my={3} py={3}>
        <Typography variant={"h4"}>CSV Template Download</Typography>
        <ul>
          <li><span onClick={() => downloadTemplate('v1')}>Download Plant Form Template</span></li>
          <li><span onClick={() => downloadTemplate('v2')}>Download Plant Form Template (v2)</span></li>
        </ul>
      </Box>
    </Paper>
  );
};
export default TemplateDownload;
