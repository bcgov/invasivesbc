import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { CONFIG } from 'configuration';
import { NavLink, useNavigate } from 'react-router';
import { AuthContext } from 'client';
import { ColDef, IDatasource, IGetRowsParams } from 'ag-grid-community';
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
  count: number;
}

const IAPPList: React.FC = () => {
  const { state: auth } = useContext(AuthContext);
  const tokenRef = useRef<string | null>(auth.token);
  useEffect(() => {
    tokenRef.current = auth.token;
  }, [auth.token]);

  const navigate = useNavigate();

  // Column Definitions: Defines the columns to be displayed.
  const colDefs: ColDef[] = [
    {
      field: 'site_id',
      headerName: 'Site ID',
      cellRenderer: (params) => {
        return <NavLink to={`/iapp/${params.value}/django`}>{params.value}</NavLink>;
      }
    },
    { field: 'record_type' },
    { field: 'survey_date' },
    { field: 'species', headerName: 'Species' }
  ];

  const ds = useMemo<IDatasource>(() => {
    return {
      getRows: async (params: IGetRowsParams) => {
        const { startRow, endRow, successCallback, failCallback } = params;
        const count = endRow - startRow;

        try {
          const fetchResult = await fetch(`${CONFIG.API_URL}/iapp?offset=${startRow}&limit=${count}`, {
            headers: {
              Authorization: `Bearer ${tokenRef.current}`
            }
          });

          const result: IAPPSummaryResponse = await fetchResult.json();

          successCallback(result.results, result.count);
        } catch {
          failCallback();
        }
      }
    };
  }, []);

  return (
    <>
      <div style={{ height: '80dvh' }}>
        <AgGridReact
          columnDefs={colDefs}
          onRowClicked={(e) => {
            navigate(`/iapp/${e.data.site_id}/django`);
          }}
          defaultColDef={{
            flex: 1,
            sortable: false
          }}
          theme={customizedAgTheme}
          rowModelType={'infinite'}
          datasource={ds}
          cacheBlockSize={500}
          maxBlocksInCache={5}
          blockLoadDebounceMillis={300}
        />
      </div>
    </>
  );
};
export default IAPPList;
