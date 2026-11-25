import { useParams } from 'react-router';
import BatchDetail from 'UI/Features/Batch/batch-upload/BatchDetail';

const BatchView = () => {
  const { id } = useParams<{ id: string }>();

  return <BatchDetail id={id} />;
};

export default BatchView;
