import Container from '@mui/material/Container';
import BatchLayout from 'UI/Features/Batch/BatchLayout';
import BatchUploadList from 'UI/Features/Batch/batch-upload/BatchUploadList';

const BatchList = () => {
  return (
    <BatchLayout>
      <Container maxWidth={'lg'}>
        <BatchUploadList />
      </Container>
    </BatchLayout>
  );
};

export default BatchList;
