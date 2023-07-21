import 'styles/batch.scss';
import { Box, Paper, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from '../../state/utilities/use_selector';
import { selectBatch } from '../../state/reducers/batch';
import { useDispatch } from 'react-redux';
import { BATCH_DELETE_REQUEST, BATCH_LIST_REQUEST } from '../../state/actions';
import Spinner from '../spinner/Spinner';
import { Error } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { selectUserSettings } from 'state/reducers/userSettings';

const BatchUploadList = () => {
  const { working, error, list, templates, errorMessage } = useSelector(selectBatch);
  const dispatch = useDispatch();
  const {darkTheme} = useSelector(selectUserSettings);
  const [serial, setSerial] = useState(1);

  useEffect(() => {
    dispatch({ type: BATCH_LIST_REQUEST });
  }, [serial]);

  function deleteBatch(batchId) {
    dispatch({ type: BATCH_DELETE_REQUEST, payload: { id: batchId } });
  }

  function renderError() {
    return (
    <>
        <Error /> { errorMessage }
    </>
    )
  }

  function renderContent() {
    if (working) {
      return <Spinner />;
    }
    if (list !== null && list?.length === 0) {
      return <span>No batches found</span>;
    }
    return (
      <>
        <p>Batch uploads. Click a row for a detailed view.</p>
        <table className={`batchList ${darkTheme? 'batchDarkList' : ''}`}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Date</th>
              <th>Template</th>
              <th>Link</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {list?.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.status}</td>
                <td>{b.created_at}</td>
                <td>{templates.find(t => b.template === t.key)?.name}</td>
                <td>
                  <Link to={`/home/batch/${b.id}`}>View This Batch</Link>
                </td>
                <td>{b.status == 'NEW' ? <button onClick={() => deleteBatch(b.id)}>Delete</button> : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }

  return (
    <Paper>
      <Box mx={3} my={3} py={3}>
        <Typography variant={'h4'}>Batch Uploads</Typography>
        { error ? renderError() : ''}
        {renderContent()}
      </Box>
    </Paper>
  );
};
export default BatchUploadList;
