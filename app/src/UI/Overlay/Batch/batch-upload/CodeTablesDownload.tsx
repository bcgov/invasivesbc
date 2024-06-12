import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useInvasivesApi } from 'hooks/useInvasivesApi';

const CodeTablesDownload: React.FC = () => {
  const api = useInvasivesApi();

  const [codeTablesList, setCodeTablesList] = useState<
    {
      code_table: string;
      title: string;
      description: string;
    }[]
  >([]);

  useEffect(() => {
    api.listCodeTables().then((response) => {
      setCodeTablesList(response);
    });
  }, [api]);

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
                    onClick={() => downloadCodeTable(code.code_table, code.title)}
                  >
                    Download (CSV)
                  </span>
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
