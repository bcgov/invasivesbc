import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import BatchFileComponent from 'UI/Features/Batch/batch-upload/BatchFileComponent';
import { useDispatch } from 'react-redux';
import { useSelector } from 'utils/use_selector';
import { selectBatch } from 'state/reducers/batch';
import Spinner from 'UI/Reusable/Spinner/Spinner';
import { selectAuth } from 'state/reducers/auth';
import BatchActions from 'state/actions/batch/BatchActions';
import { useNavigate } from 'react-router';

const BatchCreate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>();
  const [ready, setReady] = useState<boolean>(false);

  const { working, templates } = useSelector(selectBatch);
  const authState = useSelector(selectAuth);

  useEffect(() => {
    setReady(data !== null && !!selectedTemplate);
  }, [data, selectedTemplate]);

  useEffect(() => {
    if (!authState?.authenticated) {
      return;
    }
    dispatch(BatchActions.templateList());
  }, [authState?.authenticated]);

  const acceptData = (d) => {
    setData(d);
  };

  const doUpload = () => {
    new Promise<void>((resolve, reject) => {
      dispatch(
        BatchActions.createWithCallback({
          csvData: data,
          template: selectedTemplate,
          resolve,
          reject
        })
      );
    }).then((batchId) => {
      navigate(`/Batch/list/${batchId}`);
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
        <option value={''}>Select a template</option>
        {templates.map((t) => (
          <option value={t.key} key={t.key}>
            {t.name}
          </option>
        ))}
      </select>

      <h3>File</h3>
      <div className="batchUploader">
        <BatchFileComponent ready={!!data} setData={acceptData} />
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
