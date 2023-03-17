import {Box, Grid, Paper, Typography} from '@mui/material';
import React, {useEffect} from 'react';
import {useSelector} from '../../state/utilities/use_selector';
import {selectBatch} from '../../state/reducers/batch';
import {useDispatch} from 'react-redux';
import {BATCH_RETRIEVE_REQUEST} from '../../state/actions';
import Spinner from '../spinner/Spinner';
import {Error} from '@mui/icons-material';
import BatchTable from "./BatchTable";

const BatchMetadata = ({batch}) => {
  return (
    <Paper>
      <dl>
        <dt>Created At</dt>
        <dd>{batch['created_at']}</dd>

        <dt>Status</dt>
        <dd>{batch['status']}</dd>

        <dt>Template</dt>
        <dd>{batch['template']?.name}</dd>

      </dl>
    </Paper>
  );
};

const BatchDetail = ({id}) => {
  const {working, error, item: batch} = useSelector(selectBatch);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({type: BATCH_RETRIEVE_REQUEST, payload: {id}});
  }, [id]);

  function renderContent() {
    if (working) {
      return <Spinner/>;
    }
    if (error) {
      return <Error/>;
    }
    if (batch == null) {
      return <span>No batch found</span>;
    }
    return (
      <>
        <BatchMetadata batch={batch}></BatchMetadata>
        <BatchTable jsonRepresentation={batch['json_representation']}/>
      </>
    );
  }

  return (
    <>
      <Box mx={3} my={3} py={3}>
        <Typography variant={'h4'}>Batch {id}</Typography>
        {renderContent()}
      </Box>
    </>
  );
};
export default BatchDetail;
