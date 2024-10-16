import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
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
  const [selectedTemplate, setSelectedTemplate] = useState<string>();
  const [ready, setReady] = useState<boolean>(false);

  const { working, templates, item } = useSelector(selectBatch);
  const authState = useSelector(selectAuth);

  useEffect(() => {
    setReady(data !== null && selectedTemplate !== undefined);
  }, [data, selectedTemplate]);

  useEffect(() => {
    if (!authState?.authenticated) {
      return;
    }

    dispatch({ type: BATCH_TEMPLATE_LIST_REQUEST });
  }, [authState?.authenticated]);

  const acceptData = (d) => {
    setData(d);
  };

  const doUpload = () => {
    new Promise((resolve, reject) => {
      dispatch({
        type: BATCH_CREATE_REQUEST_WITH_CALLBACK,
        payload: {
          csvData: data,
          template: selectedTemplate,
          resolve,
          reject
        }
      });
    }).then((batchId) => {
      history.push(`/Batch/list/${batchId}`);
    });
  };

  if (templates.length === 0) {
    return null;
  }

  return (
    <div className="batchCreate">
      <h2>Start New Batch Upload</h2>
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
      <div className="batchUploader">
        <BatchFileComponent disabled={!ready} ready={ready} setData={acceptData} />
      </div>
      {working && <Spinner />}

      <Button variant={'contained'} disabled={!ready} onClick={doUpload}>
        Upload CSV
      </Button>
      <div className="batchUploadWarning">
        <div>
          <p>Users might see the error message "Contains system files" when trying to upload a file in batch.</p>
          <p>
            This usually happens because the file is being uploaded from your H:// Drive, which has certain permissions
            set by your system and network policy. To fix this, please move the file to your local storage and try
            uploading it again.
          </p>
        </div>
      </div>
    </div>
  );
};
export default BatchCreate;
