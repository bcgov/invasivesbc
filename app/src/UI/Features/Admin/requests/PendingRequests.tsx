import { Button, Chip } from '@mui/material';
import { DataGrid, GridColDef, GridRowId, GridRowSelectionModel } from '@mui/x-data-grid';
import React, { useState } from 'react';
import { CustomNoRowsOverlay } from 'UI/Features/Admin/components/CustomNoRowsOverlay';
import { blue, green, red } from '@mui/material/colors';
import { bcYellow, black } from 'constants/colors';
import ApproveDeclineModal, { Mode } from 'UI/Features/Admin/requests/ApproveDeclineModal';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import AccessRequestModal from 'UI/Features/Admin/requests/AccessRequestModal';
import useUserAccessReferenceData from 'UI/Features/Admin/components/useUserAccessReferenceData';
import Spinner from 'UI/Reusable/Spinner/Spinner';

const PendingRequests: React.FC = () => {
  const api = useInvasivesApi();

  const [accessRequests, setAccessRequests] = useState<Record<string, unknown>[]>([]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedRequests, setSelectedRequests] = useState<Record<string, unknown>[]>([]);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set<GridRowId>([])
  });

  const [approveDeclineDialogOpen, setApproveDeclineDialogOpen] = useState(false);

  const [detailsDialogRequestUser, setDetailsDialogRequestUser] = useState<unknown>({});
  const [detailsDialogRequestUserLoaded, setDetailsDialogRequestUserLoaded] = useState(false);
  const [requestDetailsDialogOpen, setRequestDetailsDialogOpen] = useState(false);

  const { employerCodes, agencyCodes, availableRoles, loading: referenceDataLoading } = useUserAccessReferenceData();

  const load = () => {
    setLoading(true);

    api.getAccessRequests().then(async (res) => {
      setAccessRequests(res);
      buildRowModel(res);
      setLoading(false);
    });
  };

  React.useEffect(() => {
    load();
  }, []);

  const renderRequestDetailsButton = (params) => {
    return (
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          openRequestDetailsDialog(params.row);
        }}
      >
        Details
      </Button>
    );
  };

  const openRequestDetailsDialog = (user) => {
    setDetailsDialogRequestUser(user);
    setDetailsDialogRequestUserLoaded(true);
    setRequestDetailsDialogOpen(true);
  };

  const closeRequestDetailsDialog = () => {
    setDetailsDialogRequestUser({});
    setDetailsDialogRequestUserLoaded(false);
    setRequestDetailsDialogOpen(false);
  };

  const [mode, setMode] = useState<Mode>(Mode.APPROVE);

  const renderStatus = (params) => {
    const color = 'white';
    const text = params.row.status;
    let bgcolor = 'white';
    if (params.row.status === 'APPROVED') {
      bgcolor = green[600];
    } else if (text === 'DECLINED') {
      bgcolor = red[700];
    } else if (text === 'PENDING') {
      bgcolor = blue[500];
    }
    return <Chip label={text} sx={{ bgcolor, color }} />;
  };

  const renderType = (params) => {
    let color = 'white';
    let bgcolor = 'white';
    if (params.row.requestType === 'ACCESS') {
      bgcolor = green[600];
    } else if (params.row.requestType === 'UPDATE') {
      bgcolor = bcYellow;
      color = black;
    }
    return <Chip label={params.row.requestType} sx={{ bgcolor, color }} />;
  };

  const buildRowModel = (requests) => {
    const formatStatus = (arg): string => {
      if (arg === 'NOT_APPROVED') return 'PENDING';
      if (arg === 'REMOVED') return 'DECLINED';
      return arg;
    };
    const rows: Record<string, unknown>[] = [];
    for (const request of requests) {
      rows.push({
        id: request.access_request_id,
        requestType: request.request_type || 'ACCESS',
        firstName: request.first_name,
        lastName: request.last_name,
        email: request.primary_email,
        employer: request.employer,
        pacNumber: request.pac_number,
        status: formatStatus(request.status),
        requestedRoles: request.requested_roles,
        bceidAccountName: request.bceid_account_name,
        bceidUserId: request.bceid_userid,
        comments: request.comments,
        fundingAgencies: request.funding_agencies,
        idirAccountName: request.idir_account_name,
        idirUserId: request.idir_userid,
        pacServiceNumber1: request.pac_service_number_1,
        pacServiceNumber2: request.pac_service_number_2,
        workPhoneNumber: request.work_phone_number,
        dateRequested: new Date(request.updated_at).toLocaleString()
      });
    }
    setRows(rows);
  };

  const openApproveDeclineDialog = (mode: Mode) => {
    setMode(mode);
    setApproveDeclineDialogOpen(true);
  };

  const closeApproveDeclineDialog = () => {
    setApproveDeclineDialogOpen(false);
  };

  const approveUsers = () => {
    // TODO: Handle multiple types of requests
    api.approveAccessRequests(selectedRequests).then(() => {
      closeApproveDeclineDialog();
      load();
      setSelectionModel({
        type: 'include',
        ids: new Set([])
      });
      setSelectedRequests([]);
    });
  };

  const declineUser = () => {
    if (selectedRequests[0].request_type === 'UPDATE') {
      api.declineUpdateRequest(selectedRequests[0]).then(() => {
        closeApproveDeclineDialog();
        load();
        setSelectionModel({
          type: 'include',
          ids: new Set([])
        });
        setSelectedRequests([]);
      });
    } else {
      api.declineAccessRequest(selectedRequests[0]).then(() => {
        closeApproveDeclineDialog();
        load();
        setSelectedRequests([]);
        setSelectionModel({
          type: 'include',
          ids: new Set([])
        });
      });
    }
  };

  const handleSelection = (model: GridRowSelectionModel) => {
    // Get user details from ids
    const requests: Record<string, unknown>[] = [];
    for (const id of model.ids) {
      const user = accessRequests.find((u) => u.access_request_id === id);
      if (user) {
        requests.push(user);
      }
    }
    setSelectionModel({
      type: 'include',
      ids: new Set(model.ids)
    });
    setSelectedRequests(requests);
  };

  const requestColumns: GridColDef[] = [
    //1185 max width
    { field: 'id', headerName: 'ID', width: 50 },
    {
      field: 'requestType',
      headerName: 'Type',
      width: 100,
      renderCell: (row) => renderType(row)
    },
    { field: 'firstName', headerName: 'First Name', width: 120 },
    { field: 'lastName', headerName: 'Last Name', width: 120 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'dateRequested', headerName: 'Date Requested', width: 200 },
    {
      field: 'status',
      headerName: 'Status',
      width: 159,
      renderCell: (data) => renderStatus(data)
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (row) => renderRequestDetailsButton(row)
    }
  ];

  if (referenceDataLoading) {
    return <Spinner />;
  }

  return (
    <>
      <ApproveDeclineModal
        open={approveDeclineDialogOpen}
        mode={mode}
        selectedRequestUsers={selectedRequests}
        closeApproveDeclineDialog={closeApproveDeclineDialog}
        approveUsers={approveUsers}
        declineUser={declineUser}
      />
      {detailsDialogRequestUserLoaded && (
        <AccessRequestModal
          closeRequestDetailsDialog={closeRequestDetailsDialog}
          requestDetailsDialogOpen={requestDetailsDialogOpen}
          detailsDialogRequestUser={detailsDialogRequestUser as Record<string, unknown>}
          employerCodes={employerCodes}
          agencyCodes={agencyCodes}
          availableRoles={availableRoles}
        />
      )}

      <h2>Access Requests</h2>

      <DataGrid
        loading={loading}
        slots={{
          noRowsOverlay: CustomNoRowsOverlay
        }}
        initialState={{
          filter: {
            filterModel: {
              items: [{ field: 'status', operator: 'equals', value: 'PENDING' }]
            }
          }
        }}
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={handleSelection}
        rows={rows}
        columns={requestColumns}
        sortModel={[{ field: 'dateRequested', sort: 'desc' }]}
        checkboxSelection
      />

      <Button
        disabled={!selectedRequests || selectedRequests.length === 0}
        variant="contained"
        color="primary"
        onClick={() => openApproveDeclineDialog(Mode.APPROVE)}
      >
        Approve Selected Users
      </Button>

      <Button
        disabled={!selectedRequests || selectedRequests.length === 0 || selectedRequests.length > 1}
        variant="contained"
        color="error"
        onClick={() => openApproveDeclineDialog(Mode.DECLINE)}
      >
        Decline Selected User
      </Button>
    </>
  );
};

export default PendingRequests;
