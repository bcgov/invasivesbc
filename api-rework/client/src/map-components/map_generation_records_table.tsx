import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from 'client';
import { API_URL } from 'constants';
import { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { customizedAgTheme } from 'ag-theme';

interface MapRecord {
  minimum_zoom: number;
  maximum_zoom: number;
  file_name: string;
  file_size: string;
  raster: boolean;
  updated: Date;
  bounds: GeoJSON.Polygon;
  centroid: GeoJSON.Point;
}

const MapGenerationRecordsTable: React.FC<{ setMap: (m: MapRecord) => void; source: 'owned' | 'public' }> = ({
  setMap,
  source = 'owned'
}) => {
  const [records, setRecords] = useState<MapRecord[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { state: auth } = useContext(AuthContext);

  const colDefs: ColDef[] = [
    { field: 'file_name', headerName: 'File' },
    { field: 'file_size', headerName: 'Size' },
    { field: 'minimum_zoom', headerName: 'Min' },
    { field: 'maximum_zoom', headerName: 'Max' },
    { field: 'updated', headerName: 'Updated' },
    {
      field: 'raster',
      headerName: 'type',
      cellRenderer: (params) => {
        return params.value ? 'Raster' : 'Vector';
      }
    }
  ];

  useEffect(() => {
    setLoading(true);
    setErrorMessage('');
    setError(false);

    fetch(`${API_URL}/maps/records/${source}`, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
      .then(async (res) => {
        setLoading(false);
        if (res.status === 200) {
          const serverResult: MapRecord[] = await res.json();
          setRecords(serverResult);
        } else {
          setRecords([]);
          setError(true);
        }
      })
      .catch((reason) => {
        setLoading(false);
        setError(true);
        setErrorMessage(`${reason}`);
      });
  }, [source]);
  return (
    <>
      {error && <pre>{errorMessage}</pre>}
      <div style={{ height: '80dvh' }}>
        <AgGridReact
          loading={loading}
          rowData={records}
          columnDefs={colDefs}
          defaultColDef={{
            flex: 1
          }}
          onRowClicked={(e) => {
            setMap(e.data);
          }}
          theme={customizedAgTheme}
          pagination
        />
      </div>
    </>
  );
};

export type { MapRecord };
export default MapGenerationRecordsTable;
