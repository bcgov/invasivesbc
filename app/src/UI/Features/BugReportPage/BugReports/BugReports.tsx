import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';

import './bugReports.css';
import { BugReportRowOut } from 'api/api-schema';

import { CustomNoRowsOverlay } from 'UI/Features/Admin/components/CustomNoRowsOverlay';
import { useSelector } from 'utils/use_selector';
import Button from 'UI/Reusable/Button/Button';
import useBugReportPage from 'UI/Features/BugReportPage/bugReportPage.hooks';
import LoadingPage from 'UI/Features/SystemStatusPages/LoadingPage/LoadingPage';

// TODO - Add actions for changing status of report (Closed, Resolved)
const BugReports = () => {
  const { fetchBugReports } = useBugReportPage();
  const navigate = useNavigate();
  const bugIssueTypeCodes = useSelector((state) => state.ActivityPage?.formCodes?.BugReportTypeCode);

  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const load = async () => {
    setLoading(true);

    try {
      const res = await fetchBugReports();
      if (res?.ok) {
        const reports = await res.json();
        buildRowModel(reports.entries);
      }
    } catch (e) {
      console.error('[onSubmit]', e);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    load();
  }, []);

  const buildRowModel = (requests: BugReportRowOut[]) => {
    const rows: BugReportRowOut[] = [];
    for (const request of requests) {
      const issueType = bugIssueTypeCodes.find((code) => code.code === request.issue_type)?.full_name || '';

      rows.push({
        ...request,
        issue_type: issueType
      });
    }
    setRows(rows);
  };

  const requestColumns: GridColDef[] = [
    //1185 max width
    { field: 'id', headerName: 'ID', width: 50 },
    {
      field: 'date',
      headerName: 'Date',
      width: 120
    },
    {
      field: 'time',
      headerName: 'Time',
      width: 120
    },
    { field: 'title', headerName: 'Title', width: 200 },
    { field: 'reproducible', headerName: 'Reproducible', width: 120 },
    { field: 'issue_type', headerName: 'Issue Type', width: 200 },
    { field: 'device', headerName: 'Device', width: 120 },
    { field: 'offline_online', headerName: 'Offline or Online', width: 120 },
    {
      field: 'status',
      headerName: 'Status',
      width: 159
    },
    {
      cellClassName: 'grid-action-cell',
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (row) => renderViewReportButton(row)
    }
  ];

  const renderViewReportButton = (params) => {
    return (
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          navigate(`/Admin/bugReports/${params.row.id}`);
        }}
      >
        View
      </Button>
    );
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <>
      <h2>Bug Reports</h2>

      <DataGrid
        initialState={{
          sorting: {
            sortModel: [{ field: 'date', sort: 'desc' }]
          }
        }}
        loading={loading}
        slots={{
          noRowsOverlay: CustomNoRowsOverlay
        }}
        rows={rows}
        columns={requestColumns}
      />
    </>
  );
};

export default BugReports;
