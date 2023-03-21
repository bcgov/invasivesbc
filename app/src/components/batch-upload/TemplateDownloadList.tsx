import { Typography } from '@mui/material';
import React, { useEffect } from 'react';
import TemplatePreview from './TemplatePreview';
import { BATCH_TEMPLATE_LIST_REQUEST } from '../../state/actions';
import { useDispatch } from 'react-redux';
import { useSelector } from '../../state/utilities/use_selector';
import { selectBatch } from '../../state/reducers/batch';
import Spinner from '../spinner/Spinner';

const TemplateDownloadList = () => {
  const dispatch = useDispatch();
  const { templates, working, error } = useSelector(selectBatch);

  useEffect(() => {
    dispatch({ type: BATCH_TEMPLATE_LIST_REQUEST });
  }, []);

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
