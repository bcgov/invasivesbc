import BatchDetail from 'UI/Features/Batch/batch-upload/BatchDetail';
import { useParams } from 'react-router';

const BatchView = () => {
  const { id } = useParams<{ id: string }>();

  return <BatchDetail id={id} />;
};

export default BatchView;
