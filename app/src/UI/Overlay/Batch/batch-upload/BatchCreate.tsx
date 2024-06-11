import React, { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import BatchFileComponent from './BatchFileComponent';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'utils/use_selector';
import { selectBatch } from 'state/reducers/batch';
import { BATCH_CREATE_REQUEST_WITH_CALLBACK, BATCH_TEMPLATE_LIST_REQUEST } from 'state/actions';
import Spinner from 'UI/Spinner/Spinner';
import { selectAuth } from 'state/reducers/auth';

const BatchCreate = () => {
  const dispatch = useDispatch();

  const history = useHistory();

  const [data, setData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(undefined);
  const [ready, setReady] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const { working, templates, item } = useSelector(selectBatch);
  const authState = useSelector(selectAuth);

  useEffect(() => {
    setReady(data !== null && selectedTemplate !== undefined);
  }, [data, selectedTemplate]);

  useEffect(() => {
    if (!authState?.authenticated) {
      return;
    }

    dispatch(BATCH_TEMPLATE_LIST_REQUEST());
  }, [authState?.authenticated]);

  const acceptData = (d) => {
    setData(d);
  };

  const doUpload = () => {
    new Promise((resolve, reject) => {
      dispatch(
        BATCH_CREATE_REQUEST_WITH_CALLBACK({
          csvData: data,
          template: selectedTemplate,
          resolve,
          reject
        })
      );
    }).then((batchId) => {
      history.push(`/Batch/list/${batchId}`);
    });
  };

  if (templates.length === 0) {
    return null;
  }

  return (
    <Box mx={3} my={3} py={3}>
      <Typography variant={'h4'}>Start New Batch Upload</Typography>

      <p>Which template are you uploading?</p>
      <select onChange={(e) => setSelectedTemplate(e.target.value)} value={selectedTemplate}>
        <option>Select a template</option>
        {templates.map((t) => (
          <option value={t.key} key={t.key}>
            {t.name}
          </option>
        ))}
      </select>

      <p>File</p>

      <BatchFileComponent disabled={disabled} ready={ready} setData={acceptData} />

      {working && <Spinner />}

      <Button variant={'contained'} disabled={!ready || disabled} onClick={() => doUpload()}>
        Upload CSV
      </Button>
    </Box>
  );
};
export default BatchCreate;
