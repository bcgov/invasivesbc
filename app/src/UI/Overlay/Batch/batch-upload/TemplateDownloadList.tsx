import { Typography } from '@mui/material';
import React, { useEffect } from 'react';
import TemplatePreview from './TemplatePreview';
import { useDispatch } from 'react-redux';
import { useSelector } from 'utils/use_selector';
import { selectBatch } from 'state/reducers/batch';
import Spinner from 'UI/Spinner/Spinner';
import { selectAuth } from 'state/reducers/auth';
import BatchActions from 'state/actions/batch/BatchActions';

const TemplateDownloadList = () => {
  const dispatch = useDispatch();
  const { templates, working, error } = useSelector(selectBatch);
  const authState = useSelector(selectAuth);

  useEffect(() => {
    if (!authState?.authenticated) {
      return;
    }
    dispatch(BatchActions.templateList());
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
