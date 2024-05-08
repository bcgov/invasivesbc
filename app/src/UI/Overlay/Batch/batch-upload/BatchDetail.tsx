import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Error } from '@mui/icons-material';
import BatchTable from './BatchTable';
import BatchFileComponent from './BatchFileComponent';
import { useSelector } from 'utils/use_selector';
import { selectBatch } from 'state/reducers/batch';
import Spinner from 'UI/Spinner/Spinner';
import { BATCH_EXECUTE_REQUEST, BATCH_RETRIEVE_REQUEST, BATCH_UPDATE_REQUEST } from 'state/actions';

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

  function doBatchExec() {
    dispatch({
      type: BATCH_EXECUTE_REQUEST,
      payload: {
        id: batch.id,
        desiredActivityState: execFinalState,
        treatmentOfErrorRows: execErrorRowsTreatment
      }
    });
  }

  const [fileData, setFileData] = useState(null);
  const [uploadReady, setUploadReady] = useState(false);

  const [execFinalState, setExecFinalState] = useState('');
  const [execErrorRowsTreatment, setExecErrorRowsTreatment] = useState('');

  useEffect(() => {
    setUploadReady(fileData !== null);
  }, [fileData]);

  const acceptFileData = (d) => {
    setFileData(d);
  };

  return (
    <Paper>
      <table className={'batch-details'}>
        <tbody>
          <tr>
            <td style={{ width: '20%' }}>Created At</td>
            <td>{batch['created_at']}</td>
          </tr>
          <tr>
            <td>Status</td>
            <td>{batch['status']}</td>
          </tr>
          <tr>
            <td>Template</td>
            <td>{batch['template']?.name}</td>
          </tr>
          <tr>
            <td>Download CSV Data (for revision)</td>
            <td>
              <Button variant={'contained'} onClick={() => downloadCSV()}>
                Download
              </Button>
            </td>
          </tr>
          {batch['status'] === 'NEW' && (
            <>
              <tr>
                <td>Upload revised CSV Data</td>
                <td>
                  <BatchFileComponent setData={acceptFileData} ready={uploadReady} disabled={false} />
                  <Button disabled={!uploadReady} variant={'contained'} onClick={() => uploadRevisedData()}>
                    Upload
                  </Button>
                </td>
              </tr>
              <tr>
                <td>Execute Batch</td>
                <td>&nbsp;</td>
              </tr>
              <tr>
                <td>State for created activities:</td>
                <td>
                  <select
                    value={execFinalState}
                    onChange={(e) => {
                      console.log('changed');
                      setExecFinalState(e.target.value);
                    }}>
                    <option value="" disabled>
                      Select
                    </option>
                    <option value={'Draft'}>Draft</option>
                    <option value={'Submitted'}>Submitted</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>&nbsp;</td>
                <td>
                  <Button
                    variant={'contained'}
                    onClick={() => doBatchExec()}
                    disabled={!execFinalState || !batch?.canProceed}>
                    Execute
                  </Button>
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </Paper>
  );
};

const BatchGlobalValidationErrors = ({ batch }) => {
  if (batch?.globalValidationMessages?.length === 0) {
    return null;
  }

  return (
    <div className={'batch-errors'}>
      <h3>Batch Validation Errors</h3>
      <ul>
        {batch?.globalValidationMessages?.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
    </div>
  );
};

const BatchDetail = ({ id }) => {
  const { working, error, item: batch, errorMessage } = useSelector(selectBatch);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({ type: BATCH_RETRIEVE_REQUEST, payload: { id } });
  }, [id]);

  function renderContent() {
    if (working) {
      return <Spinner />;
    }
    if (error) {
      return (
        <>
          <Error />
          {errorMessage}
        </>
      );
    }
    if (batch == null) {
      return <span>No batch found</span>;
    }
    return (
      <>
        <BatchMetadata batch={batch}></BatchMetadata>
        <BatchGlobalValidationErrors batch={batch} />
        <BatchTable
          jsonRepresentation={batch['json_representation']}
          created_activities={batch['created_activities']}
        />
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
