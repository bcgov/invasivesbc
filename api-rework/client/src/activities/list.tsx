import React, {useContext, useEffect, useState} from 'react';
import {API_URL} from 'constants';
import './activities.scss';
import {useNavigate} from 'react-router';
import {AuthContext} from 'client';
import {ColDef} from "ag-grid-community";
import {AgGridReact} from "ag-grid-react";
import {customizedAgTheme} from "ag-theme";

interface ActivitySummary {
  id: string;
  type: string;
  subtype: string;
  date: string;
  has_migration_remarks: boolean;
}


const ActivitiesList: React.FC = () => {
  const [activities, setActivities] = useState<ActivitySummary[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const {state: auth} = useContext(AuthContext);

  const navigate = useNavigate();

  // Column Definitions: Defines the columns to be displayed.
  const colDefs: ColDef[] = [
    {field: "id", onCellClicked: (e) => (navigate(`/activities/${e.value}/django`)), headerName: "ID"},
    {field: "type"},
    {field: "subtype"},
    {field: "date", headerName: "Activity Date"},
    {field: "has_migration_remarks", headerName: "Has Migration Remarks?"}
  ];

  useEffect(() => {
    setLoading(true);
    setErrorMessage('');
    setError(false);

    fetch(`${API_URL}/activities`, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      },
      // method: 'POST',
    })
      .then(async (res) => {
        setLoading(false);
        if (res.status === 200) {
          setActivities(await res.json());
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
      <AgGridReact
        loading={loading}
        rowData={activities}
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
export default ActivitiesList;
