import React, {useEffect, useState} from 'react';
import {Box, Button, Paper, Typography} from '@mui/material';
import BatchFileComponent from "./BatchFileComponent";
import {useDispatch} from "react-redux";
import {BATCH_CREATE_REQUEST} from "../../state/actions";
import Spinner from "../spinner/Spinner";
import {useSelector} from "../../state/utilities/use_selector";
import {selectBatch} from "../../state/reducers/batch";

const BatchCreate = () => {

  const dispatch = useDispatch();

  const [data, setData] = useState(null);
  const [ready, setReady] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const {working, item} = useSelector(selectBatch);


  useEffect(() => {
    setReady(data !== null);
  }, [data]);

  const acceptData = (d) => {
    console.log('set data');
    setData(d);
  };

  const doUpload = () => {
    dispatch({
      type: BATCH_CREATE_REQUEST, payload: {
        csvData: data
      }
    });
  }

  return (
    <Box mx={3} my={3} py={3}>
      <Typography variant={'h4'}>Start New Batch Upload</Typography>
      <BatchFileComponent disabled={disabled} ready={ready} setData={acceptData}/>

      {working && <Spinner/>}
      <Button variant={'contained'} disabled={!ready || disabled} onClick={() => doUpload()}>Upload CSV</Button>
    </Box>
  );
};
export default BatchCreate;
