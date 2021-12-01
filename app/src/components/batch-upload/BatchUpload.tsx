import { Box } from '@material-ui/core';
import React, { useState } from 'react';
import BatchUploader from './BatchUploader';
import BatchUploadList from './BatchUploadList';
import TemplateDownload from './TemplateDownload';
import CodeTablesDownload from './CodeTablesDownload';

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
      <CodeTablesDownload/>
    </Box>
  );
};

export default BatchUpload;
