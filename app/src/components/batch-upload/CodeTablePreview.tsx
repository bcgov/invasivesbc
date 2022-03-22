import React, { useEffect, useState } from 'react';
import { useInvasivesApi } from '../../hooks/useInvasivesApi';
import { Button } from '@mui/material';

type CodeTablesPreviewProps = {
  codeTableId: string;
};

const CodeTablesPreview: React.FC<CodeTablesPreviewProps> = ({ codeTableId }) => {
  const api = useInvasivesApi();

  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codeValues, setCodeValues] = useState([]);

  useEffect(() => {
    if (showPreview) {
      setLoading(true);
      api.fetchCodeTable(codeTableId).then((response) => {
        setCodeValues(response);
        setLoading(false);
      });
    }
  }, [codeTableId, showPreview, api]);

  if (loading) {
    return <span>Preview loading...</span>;
  }

  if (showPreview) {
    return (
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {codeValues.map((code) => (
            <tr key={code.code}>
              <td>{code.code}</td>
              <td>{code.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  } else {
    return <Button onClick={() => setShowPreview(true)}>Preview Values</Button>;
  }
};

export default CodeTablesPreview;
