import React, {useContext, useEffect, useState} from 'react';
import {API_URL} from 'constants';
import './activities.scss';
import {useNavigate} from 'react-router';
import {AuthContext} from 'client';
import {ColDef} from "ag-grid-community";
import {AgGridReact} from "ag-grid-react";
import {customizedAgTheme} from "ag-theme";

interface MigrationStatus {
  activity_id: string;
  timestamp: string;
}

const MigrationStatusList: React.FC = () => {
  const [migrations, setMigrations] = useState<MigrationStatus[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const {state: auth} = useContext(AuthContext);

  const navigate = useNavigate();

  // Column Definitions: Defines the columns to be displayed.
  const colDefs: ColDef[] = [
    {
      field: "activity_id",
      onCellClicked: (e) => (navigate(`/activities/${e.value}/migration`)),
      headerName: "ID"
    },
    {field: "timestamp", headerName: "Import Timestamp"},
  ];

  useEffect(() => {
    setLoading(true);
    setErrorMessage('');
    setError(false);

    fetch(`${API_URL}/migrations/failed`, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      },
      // method: 'POST',
    })
      .then(async (res) => {
        setLoading(false);
        if (res.status === 200) {
          setMigrations(await res.json());
        } else {
          setMigrations([]);
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
      <div style={{height: '80dvh'}}>
        <AgGridReact
          loading={loading}
          rowData={migrations}
          columnDefs={colDefs}
          defaultColDef={{
            flex: 1
          }}
          theme={customizedAgTheme}
          pagination
        />
      </div>
    </>
  )
};
export default MigrationStatusList;
