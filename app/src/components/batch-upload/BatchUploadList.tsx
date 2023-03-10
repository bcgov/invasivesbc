import {Box, Paper, Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {useSelector} from "../../state/utilities/use_selector";
import {selectBatch} from "../../state/reducers/batch";
import {useDispatch} from "react-redux";
import {BATCH_LIST_REQUEST} from "../../state/actions";
import Spinner from "../spinner/Spinner";
import {Error} from "@mui/icons-material";

const BatchUploadList = () => {

  const {working, error, list} = useSelector(selectBatch);
  const dispatch = useDispatch();
  const [serial, setSerial] = useState(1);

  useEffect(() => {
    dispatch({type: BATCH_LIST_REQUEST});
  }, [serial]);

  function renderContent() {
    if (working) {
      return (<Spinner/>);
    }
    if (error) {
      return (<Error/>);
    }
    if (list !== null && list.length === 0) {
      return (<span>No batches found</span>);
    }
    return (
      <>
        <p>Batch uploads. Click a row for a detailed view.</p>
        <table>
          <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
          </thead>
          <tbody>
          {list.map(b => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.status}</td>
              <td>{b.created_at}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </>
    )


  }

  return (
    <Paper>
      <Box mx={3} my={3} py={3}>
        <Typography variant={'h4'}>Batch Uploads</Typography>
        {renderContent()}
      </Box>
    </Paper>
  );
};
export default BatchUploadList;
