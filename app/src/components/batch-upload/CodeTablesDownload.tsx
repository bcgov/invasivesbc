import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography } from '@material-ui/core';
import { useInvasivesApi } from '../../hooks/useInvasivesApi';
import CodeTablePreview from './CodeTablePreview';

const CodeTablesDownload: React.FC = () => {
  const api = useInvasivesApi();

  const [codeTablesList, setCodeTablesList] = useState([]);

  useEffect(() => {
    api.listCodeTables().then((result) => {
      setCodeTablesList(result);
    });
  }, []);

  const downloadCodeTable = async (codeHeaderId, codeTableName) => {
    const data = await api.fetchCodeTable(codeHeaderId, true);
    const dataUrl = `data:text/csv;base64,${btoa(data)}`;
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', dataUrl);
    downloadLink.setAttribute('download', `codes-${codeTableName}.csv`);
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <Paper>
      <Box mx={3} my={3} py={3}>
        <Typography variant={'h4'}>Code Tables Download</Typography>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {codeTablesList.map((code) => (
              <tr key={code.code_table}>
                <td>{code.title}</td>
                <td>{code.description}</td>
                <td>
                  <span
                    style={{ textDecoration: 'underline', cursor: 'pointer' }}
                    onClick={() => downloadCodeTable(code.code_table, code.title)}>
                    Download (CSV)
                  </span>
                </td>
                <td>
                  <CodeTablePreview codeTableId={code.code_table} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Paper>
  );
};
export default CodeTablesDownload;
