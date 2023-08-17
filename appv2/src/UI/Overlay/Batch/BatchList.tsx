import React from 'react';
import Container from '@mui/material/Container';
import BatchLayout from './BatchLayout';
import BatchUploadList from './batch-upload/BatchUploadList';

const BatchList = () => {

  return (
    <BatchLayout>
      <Container maxWidth={'lg'}>
        <BatchUploadList/>
      </Container>
    </BatchLayout>

  );
};

export default BatchList;
