import React, { useContext, useEffect, useState } from 'react';
import { CONFIG } from 'configuration';
import { useNavigate } from 'react-router';
import { AuthContext } from 'client';
import { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { customizedAgTheme } from 'ag-theme';

interface IAPPSummary {
  site_id: string;
  survey_date: string;
  record_type: string;
  species: string;
}

interface IAPPSummaryResponse {
  results: IAPPSummary[];
}

const IAPPList: React.FC = () => {
  const [result, setResult] = useState<IAPPSummaryResponse | undefined>(undefined);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { state: auth } = useContext(AuthContext);

  const navigate = useNavigate();

  // Column Definitions: Defines the columns to be displayed.
  const colDefs: ColDef[] = [
    {
      field: 'site_id',
      headerName: 'Site ID',
      cellRenderer: (params) => {
        return (
          <a href={`/iapp/${params.value}/django`} className={'id-link'}>
            {params.value}
          </a>
        );
      }
    },
    { field: 'record_type' },
    { field: 'survey_date' },
    { field: 'species', headerName: 'Species' }
  ];

  useEffect(() => {
    setLoading(true);
    setErrorMessage('');
    setError(false);

    fetch(`${CONFIG.API_URL}/iapp`, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
      // method: 'POST',
    })
      .then(async (res) => {
        setLoading(false);
        if (res.status === 200) {
          const serverResult: IAPPSummaryResponse = await res.json();
          setResult(serverResult);
        } else {
          setResult(undefined);
          setError(true);
          let extraMessage = '';
          if (res.status === 403) {
            extraMessage = `You should request access to this page, providing your SSO subject [${auth.user_details?.sub || ''}]`;
          }
          setErrorMessage(`response status code was [${res.status} ${res.statusText}] ${extraMessage}`);
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
          rowData={result?.results || []}
          columnDefs={colDefs}
          onRowClicked={(e) => {
            navigate(`/iapp/${e.data.id}/django`);
          }}
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
export default IAPPList;
