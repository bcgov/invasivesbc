import { Typography } from '@mui/material';
import { useEffect } from 'react';
import TemplatePreview from 'UI/Features/Batch/batch-upload/TemplatePreview';
import { useDispatch } from 'react-redux';
import { useSelector } from 'utils/use_selector';
import { selectBatch } from 'state/reducers/batch';
import Spinner from 'UI/Reusable/Spinner/Spinner';
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

  const filteredTemplates = templates.filter((t) => {
    const name = t.name.toLowerCase();
    return !name.includes('temp') && !name.includes('old');
  });

  return (
    <>
      <Typography variant={'h4'}>Available Templates</Typography>
      {filteredTemplates.map((t) => (
        <TemplatePreview name={t.name} id={t.key} key={t.key} />
      ))}
    </>
  );
};

export default TemplateDownloadList;
