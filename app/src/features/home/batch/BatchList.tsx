import React from 'react';
import BatchUploadList from "../../../components/batch-upload/BatchUploadList";
import BatchLayout from "./BatchLayout";
import Container from '@mui/material/Container';

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
