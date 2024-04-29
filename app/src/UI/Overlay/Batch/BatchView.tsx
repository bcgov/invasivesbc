import React from 'react';
import {RouteComponentProps} from 'react-router';
import BatchDetail from './batch-upload/BatchDetail';
import BatchLayout from "./BatchLayout";

interface BatchViewProps
  extends RouteComponentProps<{
    id: string;
  }> {
}

const BatchView: React.FC<BatchViewProps> = ({match}) => {

  return (
    <BatchLayout>
      <BatchDetail id={match.params.id}/>
    </BatchLayout>
  );
};

export default BatchView;
