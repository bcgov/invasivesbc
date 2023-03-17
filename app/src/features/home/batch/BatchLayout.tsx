import React from 'react';
import {Box, Container, Stack} from '@mui/material';
import {Link} from "react-router-dom";

const BatchLayout = ({children}) => {

  return (

    <>
      <Box className={'batchNav'}>
        <Container maxWidth={'lg'}>
          <Stack
            direction="row"
            justifyContent="start"
            alignItems="center"
            spacing={6}
          >
            <Link className={'batchNav'} to={'/home/batch'}>My Batches</Link>
            <Link className={'batchNav'} to={'/home/batch/new'}>Create New</Link>
            <Link className={'batchNav'} to={'/home/batch/templates'}>Templates</Link>
          </Stack>
        </Container>
      </Box>

    <Box sx={{paddingTop: '2rem', marginBottom: '5rem'}}>
      {children}
    </Box>
      </>
  );
};

export default BatchLayout;
