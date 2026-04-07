import React, { useContext, useEffect, useState } from 'react';
import { API_URL } from 'constants';
import './activities.scss';
import { useNavigate } from 'react-router';
import { AuthContext } from 'client';
import { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { customizedAgTheme } from 'ag-theme';

interface ActivitySummary {
  id: string;
  type: string;
  subtype: string;
  date: string;
  has_migration_remarks: boolean;
}

const ActivitiesList: React.FC = () => {
  const [activities, setActivities] = useState<ActivitySummary[]>([]);

  const [distinctSubtypes, setDistinctSubtypes] = useState<string[]>([]);
  const [subtypeFilter, setSubtypeFilter] = useState<string>("Unfiltered");

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { state: auth } = useContext(AuthContext);

  const navigate = useNavigate();

  // Column Definitions: Defines the columns to be displayed.
  const colDefs: ColDef[] = [
    { field: 'id',
      headerName: 'ID',
      cellRenderer: (params) => {
        return <a href={`/activities/${params.value}/django`} className={'idLink'}>{params.value}</a>;
      }
    },
    { field: 'type' },
    { field: 'subtype' },
    { field: 'date', headerName: 'Activity Date' },
    {
      field: 'has_migration_remarks',
      headerName: 'Has Migration Remarks?',
      cellRenderer: (params) => {
        return <span className={params.value ? 'warning' : ''}>{params.value ? 'Yes' : 'No'}</span>;
      }
    }
  ];

  useEffect(() => {
    setLoading(true);
    setErrorMessage('');
    setError(false);

    fetch(`${API_URL}/activities`, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
      // method: 'POST',
    })
      .then(async (res) => {
        setLoading(false);
        if (res.status === 200) {
          const serverResult: ActivitySummary[] = await res.json();
          setActivities(serverResult);
          setDistinctSubtypes([...new Set(serverResult.map( as => as.subtype).sort())])
        } else {
          setActivities([]);
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
        Filter By Subtype:
        <select onChange={(e) => {setSubtypeFilter(e.target.value)}}>
          <option value={'Unfiltered'}>All</option>
        {distinctSubtypes.map( st => (<option key={st} value={st}>{st}</option>))}
        </select>
        <AgGridReact
          loading={loading}
          rowData={activities.filter( x => subtypeFilter == 'Unfiltered' || x.subtype == subtypeFilter)}
          columnDefs={colDefs}
          onRowClicked={(e) => {
            navigate(`/activities/${e.data.id}/django`);
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
export default ActivitiesList;
