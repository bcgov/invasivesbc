import React, {useCallback, useEffect, useState} from 'react';
import {Box, Button, Paper, Typography} from '@material-ui/core';
import {useInvasivesApi} from "../../hooks/useInvasivesApi";
import {useDropzone} from 'react-dropzone'
import BatchUploadList from "./BatchUploadList";
import BatchUploader from "./BatchUploader";
import TemplateDownload from "./TemplateDownload";

const BatchUpload: React.FC = (props) => {

  const [serial, setSerial] = useState(0);

  const incrementSerial = () => {
    setSerial(serial + 1);
  };

  return (
    <Box>
      <BatchUploadList serial={serial} />
      <BatchUploader onUploadComplete={incrementSerial} />
      <TemplateDownload />
    </Box>
  );
};

export default BatchUpload;
