import React, {useState} from 'react';
import { Box, Paper, Typography } from '@mui/material';
import BatchFileComponent from "./BatchFileComponent";

const BatchCreate = ({templates}) => {

  const [data, setData] = useState(null);

  const acceptData = (data) => {
    setData(data);
  };

  return (
    <Paper>
      <Box mx={3} my={3} py={3}>
        <Typography variant={'h4'}>Start New Batch Upload</Typography>
        <BatchFileComponent disabled={false} ready={false} setData={acceptData}/>
      </Box>
    </Paper>
  );
};
export default BatchCreate;
