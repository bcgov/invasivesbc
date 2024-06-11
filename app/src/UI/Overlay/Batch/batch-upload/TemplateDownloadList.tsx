import { Typography } from '@mui/material';
import React, { useEffect } from 'react';
import TemplatePreview from './TemplatePreview';
import { useDispatch } from 'react-redux';
import { useSelector } from 'utils/use_selector';
import { selectBatch } from 'state/reducers/batch';
import { BATCH_TEMPLATE_LIST_REQUEST } from 'state/actions';
import Spinner from 'UI/Spinner/Spinner';
import { selectAuth } from 'state/reducers/auth';

const TemplateDownloadList = () => {
  const dispatch = useDispatch();
  const { templates, working, error } = useSelector(selectBatch);
  const authState = useSelector(selectAuth);

  useEffect(() => {
    if (!authState?.authenticated) {
      return;
    }

    dispatch(BATCH_TEMPLATE_LIST_REQUEST());
  }, [authState?.authenticated]);

  if (working) {
    return <Spinner />;
  }

  if (error || templates == null) {
    return <p>Error</p>;
  }

  return (
    <>
      <Typography variant={'h4'}>Available Templates</Typography>
      {templates.map((t) => (
        <TemplatePreview name={t.name} id={t.key} key={t.key} />
      ))}
    </>
  );
};

export default TemplateDownloadList;
