import React from 'react';
import BatchDetail from './batch-upload/BatchDetail';
import BatchLayout from './BatchLayout';
import { useParams } from 'react-router-dom';

const BatchView = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <BatchLayout>
      <BatchDetail id={id} />
    </BatchLayout>
  );
};

export default BatchView;
