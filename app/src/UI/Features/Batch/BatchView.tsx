import BatchDetail from 'UI/Features/Batch/batch-upload/BatchDetail';
import BatchLayout from 'UI/Features/Batch/BatchLayout';
import { useParams } from 'react-router';

const BatchView = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <BatchLayout>
      <BatchDetail id={id} />
    </BatchLayout>
  );
};

export default BatchView;
