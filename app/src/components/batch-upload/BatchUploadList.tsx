import { Box, Paper, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useInvasivesApi } from '../../hooks/useInvasivesApi';

const batchTableStyle = {
  width: '100%'
};

type BatchUploadListProps = {
  serial?: number;
};

const BatchUploadList: React.FC<BatchUploadListProps> = ({ serial }) => {
  const api = useInvasivesApi();

  const [batchUploads, setBatchUploads] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    api.getBatchUploads().then((data) => {
      setBatchUploads(data);
      setExpandedRow(null);
    });
  }, [serial, api]);

  return (
    <Paper>
      <Box mx={3} my={3} py={3}>
        <Typography variant={'h4'}>Batch Uploads</Typography>
        <p>The last 10 batch uploads. Click a row to expand validation messages.</p>
        <table style={batchTableStyle}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Validated?</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {batchUploads.map((d, i) => (
              <>
                <tr
                  key={`row-${i}`}
                  onClick={() => {
                    if (expandedRow === i) {
                      setExpandedRow(null);
                    } else {
                      setExpandedRow(i);
                    }
                  }}>
                  <td>{d.id}</td>
                  <td>{d.status}</td>
                  <td>{d.validation_status}</td>
                  <td>{d.created_at}</td>
                </tr>
                {expandedRow === i && (
                  <tr key={`validation-${i}`}>
                    <td colSpan={5}>
                      <pre>{JSON.stringify(d.validation_messages, null, 2)}</pre>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </Box>
    </Paper>
  );
};
export default BatchUploadList;
