import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from '../../state/utilities/use_selector';
import { selectBatch } from '../../state/reducers/batch';
import { useDispatch } from 'react-redux';
import { BATCH_CREATE_REQUEST_WITH_CALLBACK, BATCH_RETRIEVE_REQUEST, BATCH_UPDATE_REQUEST } from '../../state/actions';
import Spinner from '../spinner/Spinner';
import { Error } from '@mui/icons-material';
import BatchTable from './BatchTable';
import BatchFileComponent from './BatchFileComponent';
import { file } from '@babel/types';

const BatchMetadata = ({ batch }) => {
  const dispatch = useDispatch();

  function downloadCSV() {
    const dataUrl = `data:text/csv;base64,${btoa(batch['csv_data'] as string)}`;
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', dataUrl);
    downloadLink.setAttribute('download', `InvasivesBC - Batch ${batch.id}.csv`);
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  function uploadRevisedData() {
    dispatch({
      type: BATCH_UPDATE_REQUEST,
      payload: {
        id: batch.id,
        csvData: fileData
      }
    });
  }

  const [fileData, setFileData] = useState(null);
  const [uploadReady, setUploadReady] = useState(false);

  useEffect(() => {
    setUploadReady(fileData !== null);
  }, [fileData]);

  const acceptFileData = (d) => {
    setFileData(d);
  };

  return (
    <Paper>
      <dl>
        <dt>Created At</dt>
        <dd>{batch['created_at']}</dd>

        <dt>Status</dt>
        <dd>{batch['status']}</dd>

        <dt>Template</dt>
        <dd>{batch['template']?.name}</dd>

        <dt>Download CSV Data (for revision)</dt>
        <dd>
          <Button variant={'contained'} onClick={() => downloadCSV()}>
            Download
          </Button>
        </dd>

        {batch['status'] === 'NEW' && (
          <>
            <dt>Upload revised CSV Data</dt>
            <dd>
              <BatchFileComponent setData={acceptFileData} ready={uploadReady} disabled={false} />
              <Button disabled={!uploadReady} variant={'contained'} onClick={() => uploadRevisedData()}>
                Upload
              </Button>
            </dd>
          </>
        )}
      </dl>
    </Paper>
  );
};
const BatchDetail = ({ id }) => {
  const { working, error, item: batch } = useSelector(selectBatch);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({ type: BATCH_RETRIEVE_REQUEST, payload: { id } });
  }, [id]);

  function renderContent() {
    if (working) {
      return <Spinner />;
    }
    if (error) {
      return <Error />;
    }
    if (batch == null) {
      return <span>No batch found</span>;
    }
    return (
      <>
        <BatchMetadata batch={batch}></BatchMetadata>
        <BatchTable jsonRepresentation={batch['json_representation']} />
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
