import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from 'client';
import { CONFIG } from 'configuration';
import { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { customizedAgTheme } from 'ag-theme';

const MapGenerationRequestsTable: React.FC = () => {
  const [requests, setRequests] = useState<unknown[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { state: auth } = useContext(AuthContext);

  const colDefs: ColDef[] = [
    { field: 'file_name', headerName: 'File' },
    {
      field: 'status',
      headerName: 'Status',
      cellRenderer: (params) => {
        return <a href={`/map/monitor/${params.data.id}`}>{params.value} (View Status)</a>;
      }
    },
    { field: 'total_tile_count', headerName: 'Tile Count' },
    { field: 'minimum_zoom', headerName: 'Min' },
    { field: 'maximum_zoom', headerName: 'Max' },
    { field: 'updated', headerName: 'Updated' }
  ];

  useEffect(() => {
    setLoading(true);
    setErrorMessage('');
    setError(false);

    fetch(`${CONFIG.API_URL}/maps/requests`, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
      .then(async (res) => {
        setLoading(false);
        if (res.status === 200) {
          const serverResult: unknown[] = await res.json();
          setRequests(serverResult);
        } else {
          setRequests([]);
          setError(true);
        }
      })
      .catch((reason) => {
        setLoading(false);
        setError(true);
        setErrorMessage(`${reason}`);
      });
  }, []);
  return (
    <>
      {error && <pre>{errorMessage}</pre>}
      <div style={{ height: '80dvh' }}>
        <AgGridReact
          loading={loading}
          rowData={requests}
          columnDefs={colDefs}
          defaultColDef={{
            flex: 1
          }}
          theme={customizedAgTheme}
          pagination
        />
      </div>
    </>
  );
};

export default MapGenerationRequestsTable;
