import { red, green, blue } from '@mui/material/colors';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Container,
  Grid,
  SelectChangeEvent,
  Tooltip,
  Typography
} from '@mui/material';
import { DataGrid, GridColDef, GridRowId, GridValueGetterParams } from '@mui/x-data-grid';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import React, { useEffect, useState } from 'react';
import { selectAuth } from 'state/reducers/auth';
import { useSelector } from 'utils/use_selector';
import { CustomNoRowsOverlay } from '../CustomNoRowsOverlay';
import EmailSetup from '../email-setup/EmailSetup';
import { bcYellow, black } from 'constants/colors';
import Spinner from 'UI/Spinner/Spinner';
import QuickSearchToolbar from './QuickSearchToolbar';
import AccessRequestModal from '../modals/AccessRequestModal';
import ApproveDeclineModal from '../modals/ApproveDeclineModal';
import GrantRevokeRoleModal from '../modals/GrantRevokeRoleModal';
import DetailsModal from '../modals/DetailsModal';
import { SortFilter } from 'interfaces/filterParams';

interface IAccessRequestPage {
  classes?: any;
}

const UserAccessPage: React.FC<IAccessRequestPage> = (props) => {
  const nilRole = '';
  enum Mode {
    GRANT,
    REVOKE,
    APPROVE,
    DECLINE
  }

  const api = useInvasivesApi();
  const authState = useSelector(selectAuth);

  const [usersTableLoading, setUsersTableLoading] = useState(false);
  const [requestTableLoading, setRequestTableLoading] = useState(false);

  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [requestRows, setRequestRows] = useState<Record<string, any>[]>([]);
  const [searchedRows, setSearchedRows] = useState<any[]>([]);

  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Record<string, any>[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [detailsDialogUser, setDetailsDialogUser] = useState<any>({});
  const [detailsDialogUserLoaded, setDetailsDialogUserLoaded] = useState(false);
  const [accessRequests, setAccessRequests] = useState<any[]>([]);

  const [selectedRequestUsers, setSelectedRequestUsers] = useState<Record<string, any>[]>([]);
  const [detailsDialogRequestUser, setDetailsDialogRequestUser] = useState<any>({});
  const [detailsDialogRequestUserLoaded, setDetailsDialogRequestUserLoaded] = useState(false);
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [requestDetailsDialogOpen, setRequestDetailsDialogOpen] = useState(false);
  const [approveDeclineDialogOpen, setApproveDeclineDialogOpen] = useState(false);

  const [availableRoles, setAvailableRoles] = useState<Record<string, any>[]>([]);
  const [agencyCodes, setAgencyCodes] = useState<Record<string, any>[]>([]);
  const [employerCodes, setEmployerCodes] = useState<Record<string, any>[]>([]);

  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>(nilRole);

  const [searchText, setSearchText] = React.useState('');

  const [mode, setMode] = useState<any>(Mode.GRANT);

  /*
    ================================================================================================
    ROW DATA CONTROLS
    ================================================================================================
  */

  const renderDetailsButton = (params: GridValueGetterParams) => {
    return (
      <Tooltip title="View Details" classes={{ tooltip: 'toolTip' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            openDetailsDialog(params.row);
          }}
        >
          Details
        </Button>
      </Tooltip>
    );
  };

  const renderRequestDetailsButton = (params: GridValueGetterParams) => {
    return (
      <Tooltip title="View Details" classes={{ tooltip: 'toolTip' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            openRequestDetailsDialog(params.row);
          }}
        >
          Details
        </Button>
      </Tooltip>
    );
  };

  const renderStatus = (params: GridValueGetterParams) => {
    let color = 'white';
    let text = params.row.status;
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

  const renderType = (params: GridValueGetterParams) => {
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

  const handleRowClick = (param, event) => {
    event.stopPropagation();
  };

  const handleRowSelection = (ids) => {
    setSelectedUserIds(ids);
    const selectedUsers: Record<string, any>[] = [];
    for (let i = 0; i < ids.length; i++) {
      const user = users.find((u) => u.user_id === ids[i]);
      if (user) {
        selectedUsers.push(user);
      }
    }
    setSelectedUsers(selectedUsers);
  };

  const handleAccessRequestRowSelection = (ids) => {
    // Get user details from ids
    const requests: Record<string, any>[] = [];
    for (const id of ids) {
      const user = accessRequests.find((u) => u.access_request_id === id);
      if (user) {
        requests.push(user);
      }
    }
    setSelectionModel(ids);
    setSelectedRequestUsers(requests);
  };

  /*
    ================================================================================================
    ROWS
    ================================================================================================
  */

  const getRows = (users: any) => {
    const rows: Record<string, any>[] = [];
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      rows.push({
        id: user.user_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        accountStatus: user.account_status === 1 ? 'Active' : 'Inactive',
        activationStatus: user.activation_status === 1 ? 'Complete' : 'Pending',
        bceidUserId: user.bceid_userid,
        expiryDate: new Date(user.expiry_date).toLocaleString(),
        idirUserId: user.idir_userid,
        preferredUsername: user.preferred_username,
        createdAt: new Date(user.created_at).toLocaleString(),
        idirAccountName: user.idir_account_name,
        bceidAccountName: user.bceid_account_name,
        workPhoneNumber: user.work_phone_number,
        fundingAgencies: user.funding_agencies,
        employer: user.employer,
        pacNumber: user.pac_number,
        pacServiceNumber1: user.pac_service_number_1,
        pacServiceNumber2: user.pac_service_number_2
      });
    }
    setRows(rows);
  };

  const getRequestRows = (requests: any) => {
    const formatStatus = (arg): string => {
      if (arg === 'NOT_APPROVED') return 'PENDING';
      if (arg === 'REMOVED') return 'DECLINED';
      return arg;
    };
    const rows: Record<string, any>[] = [];
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
    setRequestRows(rows);
  };

  /*
    ================================================================================================
    COLUMNS
    ================================================================================================
  */

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'firstName', headerName: 'First Names', width: 130 },
    { field: 'lastName', headerName: 'Last Name', width: 130 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'expiryDate', headerName: 'Expiry Date', width: 200 },
    { field: 'role', headerName: 'Role(s)', width: 358 },
    { field: 'accountStatus', headerName: 'Account Status', width: 200 },
    { field: 'activationStatus', headerName: 'Activation Status', width: 200 },
    { field: 'bceidUserId', headerName: 'BCEID User ID', width: 200 },
    { field: 'idirUserId', headerName: 'IDIR User ID', width: 200 },
    { field: 'preferredUsername', headerName: 'Preferred Username', width: 200 },
    { field: 'createdAt', headerName: 'Created At', width: 200 },
    { field: 'idirAccountName', headerName: 'IDIR Account Name', width: 200 },
    { field: 'bceidAccountName', headerName: 'BCEID Account Name', width: 200 },
    { field: 'workPhoneNumber', headerName: 'Work Phone Number', width: 200 },
    { field: 'fundingAgencies', headerName: 'Funding Agencies', width: 200 },
    { field: 'employer', headerName: 'Employer', width: 200 },
    { field: 'pacNumber', headerName: 'PAC Number', width: 200 },
    { field: 'pacServiceNumber1', headerName: 'PAC Service Number 1', width: 200 },
    { field: 'pacServiceNumber2', headerName: 'PAC Service Number 2', width: 200 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (row) => renderDetailsButton(row as GridValueGetterParams)
    }
  ];

  const initHiddenFields = {
    accountStatus: false,
    activationStatus: false,
    bceidUserId: false,
    idirUserId: false,
    preferredUsername: false,
    createdAt: false,
    idirAccountName: false,
    bceidAccountName: false,
    workPhoneNumber: false,
    fundingAgencies: false,
    employer: false,
    pacNumber: false,
    pacServiceNumber1: false,
    pacServiceNumber2: false
  };

  const requestColumns: GridColDef[] = [
    //1185 max width
    { field: 'id', headerName: 'ID', width: 50 },
    {
      field: 'requestType',
      headerName: 'Type',
      width: 100,
      renderCell: (row) => renderType(row as GridValueGetterParams)
    },
    { field: 'firstName', headerName: 'First Name', width: 120 },
    { field: 'lastName', headerName: 'Last Name', width: 120 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'dateRequested', headerName: 'Date Requested', width: 200 },
    {
      field: 'status',
      headerName: 'Status',
      width: 159,
      renderCell: (data) => renderStatus(data as GridValueGetterParams)
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (row) => renderRequestDetailsButton(row as GridValueGetterParams)
    }
  ];

  /*
    ================================================================================================
    SEARCH
    ================================================================================================
  */

  const requestSearch = (searchValue: string) => {
    setSearchText(searchValue);
    const filteredRows = rows.filter((row: any) => {
      return Object.values(row).some((field: any) => {
        if (field != null) {
          return field.toString().includes(searchValue);
        } else {
          return false;
        }
      });
    });
    setSearchedRows(filteredRows);
  };

  React.useEffect(() => {
    setSearchedRows(rows);
  }, [rows]);

  /* ON MOUNT */

  useEffect(() => {
    if (!authState?.authenticated) {
      return;
    }
    loadUsers();
    getAvailableRoles();
    getFundingAgencies();
    getEmployers();
  }, [authState?.authenticated]);

  /*
    ================================================================================================
    LOAD INFO
    ================================================================================================
  */

  const loadUsers = () => {
    setUsersTableLoading(true);
    setRequestTableLoading(true);
    api.getApplicationUsers().then(async (res) => {
      setUsers(res);
      getRows(res);
      setUsersTableLoading(false);
    });

    api.getAccessRequests().then(async (res) => {
      setAccessRequests(res);
      getRequestRows(res);
      setRequestTableLoading(false);
    });
  };

  const getFundingAgencies = () => {
    api.getFundingAgencies().then((res) => {
      const agencies: Record<string, any>[] = [];
      for (let i = 0; i < res.length; i++) {
        agencies.push({
          value: res[i].code_name,
          description: res[i].code_description
        });
      }
      setAgencyCodes(agencies);
    });
  };

  const getAvailableRoles = () => {
    api.getRoles().then((res) => {
      const roles: Record<string, any>[] = [];
      for (let i = 0; i < res.length; i++) {
        roles.push({
          id: res[i].role_id,
          name: res[i].role_name,
          description: res[i].role_description
        });
      }
      setAvailableRoles(roles);
    });
  };

  const getEmployers = () => {
    api.getEmployers().then((res) => {
      const employers: Record<string, any>[] = [];
      for (let i = 0; i < res.length; i++) {
        employers.push({
          value: res[i].code_name,
          description: res[i].code_description
        });
      }
      setEmployerCodes(employers);
    });
  };

  /*
    ================================================================================================
    DIALOG CONTROLS
    ================================================================================================
  */

  const openDetailsDialog = (user: any) => {
    setDetailsDialogUser(user);
    setDetailsDialogUserLoaded(true);
    setDetailsDialogOpen(true);
  };

  const closeDetailsDialog = () => {
    setDetailsDialogUser({});
    setDetailsDialogUserLoaded(false);
    setDetailsDialogOpen(false);
  };

  const openRequestDetailsDialog = (user: any) => {
    setDetailsDialogRequestUser(user);
    setDetailsDialogRequestUserLoaded(true);
    setRequestDetailsDialogOpen(true);
  };

  const closeRequestDetailsDialog = () => {
    setDetailsDialogRequestUser({});
    setDetailsDialogRequestUserLoaded(false);
    setRequestDetailsDialogOpen(false);
  };

  const openApproveDeclineDialog = (mode: any) => {
    if (mode === Mode.APPROVE) {
      setMode(Mode.APPROVE);
    } else {
      setMode(Mode.DECLINE);
    }
    setApproveDeclineDialogOpen(true);
  };

  const closeApproveDeclineDialog = () => {
    setApproveDeclineDialogOpen(false);
  };

  const openRoleDialog = (mode: any) => {
    if (mode === Mode.GRANT) {
      setMode(Mode.GRANT);
      setRoleDialogOpen(true);
    } else {
      api.getRolesForUser(selectedUsers[0].user_id).then((res) => {
        const roles: Record<string, any>[] = [];
        for (const role of res) {
          roles.push({
            id: role.role_id,
            name: role.role_name,
            description: role.role_description
          });
        }
        setUserRoles(roles);
        setMode(Mode.REVOKE);
        setRoleDialogOpen(true);
      });
    }
  };

  const closeRoleDialog = () => {
    setRoleDialogOpen(false);
    setSelectedRole(nilRole);
  };

  /* API CALLS */

  const grantRole = () => {
    api.batchGrantRoleToUser(selectedUserIds, selectedRole).then(() => {
      setRoleDialogOpen(false);
      loadUsers();
      setSelectedRole(nilRole);
    });
  };

  const revokeRole = () => {
    api.revokeRoleFromUser(selectedUserIds[0], selectedRole).then((res) => {
      setRoleDialogOpen(false);
      loadUsers();
      setSelectedRole(nilRole);
    });
  };

  const approveUsers = () => {
    // TODO: Handle multiple types of requests
    api.approveAccessRequests(selectedRequestUsers).then(() => {
      closeApproveDeclineDialog();
      loadUsers();
      setSelectionModel([]);
      setSelectedRequestUsers([]);
    });
  };

  const declineUser = () => {
    if (selectedRequestUsers[0].request_type === 'UPDATE') {
      api.declineUpdateRequest(selectedRequestUsers[0]).then(() => {
        closeApproveDeclineDialog();
        loadUsers();
        setSelectionModel([]);
        setSelectedRequestUsers([]);
      });
    } else {
      api.declineAccessRequest(selectedRequestUsers[0]).then(() => {
        closeApproveDeclineDialog();
        loadUsers();
        setSelectedRequestUsers([]);
        setSelectionModel([]);
      });
    }
  };

  const renewUser = () => {
    api.renewUser(detailsDialogUser.id).then(() => {
      loadUsers();
      closeDetailsDialog();
    });
  };

  /*
    ================================================================================================
    FORM CONTROLS
    ================================================================================================
  */

  const handleSelectedRoleChange = (event: SelectChangeEvent<any>) => {
    setSelectedRole(parseInt(event.target.value) || nilRole);
  };
  if (!authState?.roles.some((role) => role.role_name === 'master_administrator')) {
    return <Spinner />;
  }
  return (
    <Container style={{ paddingBottom: '50px' }}>
      <Grid container spacing={4} style={{ paddingTop: '2rem' }}>
        <Grid item xs={12}>
          <Typography variant="h4" align="center">
            Grant or Revoke Roles for Existing Users
          </Typography>
        </Grid>
        {/* USERS */}
        <Grid item xs={12}>
          <Card elevation={8}>
            <CardContent>
              <Grid>
                <div style={{ height: 550, width: '100%' }}>
                  <DataGrid
                    loading={usersTableLoading}
                    components={{ Toolbar: QuickSearchToolbar, NoRowsOverlay: CustomNoRowsOverlay }}
                    componentsProps={{
                      toolbar: {
                        value: searchText,
                        onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
                          requestSearch(event.target.value);
                        },
                        clearSearch: () => requestSearch('')
                      }
                    }}
                    sortModel={[{ field: 'id', sort: SortFilter.Asc }]}
                    onRowSelectionModelChange={handleRowSelection}
                    rows={searchedRows}
                    columns={columns}
                    initialState={{
                      columns: {
                        columnVisibilityModel: {
                          ...initHiddenFields
                        }
                      }
                    }}
                    checkboxSelection
                    onCellClick={handleRowClick}
                    onRowClick={handleRowClick}
                  />
                </div>
              </Grid>
            </CardContent>
            <CardActions>
              <Grid container direction="row" spacing={5} justifyContent="flex-end">
                <Grid item>
                  <Button
                    disabled={!selectedUsers || selectedUsers.length === 0}
                    variant="contained"
                    color="primary"
                    onClick={() => openRoleDialog(Mode.GRANT)}
                  >
                    Select Role to Grant
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    disabled={!selectedUsers || selectedUsers.length > 1 || selectedUsers.length === 0}
                    variant="contained"
                    color="error"
                    onClick={() => openRoleDialog(Mode.REVOKE)}
                  >
                    Revoke Role
                  </Button>
                </Grid>
              </Grid>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* ACCESS REQUESTS */}
      <Grid container spacing={4} style={{ paddingTop: '2rem' }}>
        <Grid item xs={12}>
          <Typography variant="h4" align="center">
            Approve or Decline Requests
          </Typography>
        </Grid>
        {/* Approve or decline checked users */}
        <Grid item xs={12}>
          <Card elevation={8}>
            <CardContent>
              <Grid>
                <Box style={{ height: 550, width: '100%' }}>
                  <DataGrid
                    loading={requestTableLoading}
                    components={{
                      NoRowsOverlay: CustomNoRowsOverlay
                    }}
                    initialState={{
                      filter: {
                        filterModel: {
                          items: [{ field: 'status', operator: 'equals', value: 'PENDING' }]
                        }
                      }
                    }}
                    rowSelectionModel={selectionModel}
                    onRowSelectionModelChange={handleAccessRequestRowSelection}
                    rows={requestRows}
                    columns={requestColumns}
                    sortModel={[{ field: 'dateRequested', sort: SortFilter.Desc }]}
                    checkboxSelection
                    onCellClick={handleRowClick}
                    onRowClick={handleRowClick}
                  />
                </Box>
              </Grid>
            </CardContent>
            <CardActions>
              <Grid container direction="row" spacing={5} justifyContent="flex-end">
                <Grid item>
                  <Button
                    disabled={!selectedRequestUsers || selectedRequestUsers.length === 0}
                    variant="contained"
                    color="primary"
                    onClick={() => openApproveDeclineDialog(Mode.APPROVE)}
                  >
                    Approve Selected Users
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    disabled={
                      !selectedRequestUsers || selectedRequestUsers.length === 0 || selectedRequestUsers.length > 1
                    }
                    variant="contained"
                    color="error"
                    onClick={() => openApproveDeclineDialog(Mode.DECLINE)}
                  >
                    Decline Selected User
                  </Button>
                </Grid>
              </Grid>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      <EmailSetup />

      {/*
        ================================================================================================
        DIALOGS
        ================================================================================================
      */}

      {detailsDialogUserLoaded && (
        <DetailsModal
          open={detailsDialogOpen}
          closeDetailsDialog={closeDetailsDialog}
          detailsDialogUser={detailsDialogUser}
          employerCodes={employerCodes}
          agencyCodes={agencyCodes}
          renewUser={renewUser}
        />
      )}

      {detailsDialogRequestUserLoaded && (
        <AccessRequestModal
          closeRequestDetailsDialog={closeRequestDetailsDialog}
          requestDetailsDialogOpen={requestDetailsDialogOpen}
          detailsDialogRequestUser={detailsDialogRequestUser}
          employerCodes={employerCodes}
          agencyCodes={agencyCodes}
          availableRoles={availableRoles}
        />
      )}

      <GrantRevokeRoleModal
        open={roleDialogOpen}
        mode={mode}
        selectedUsers={selectedUsers}
        selectedRole={selectedRole}
        availableRoles={availableRoles}
        userRoles={userRoles}
        closeRoleDialog={closeRoleDialog}
        handleSelectedRoleChange={handleSelectedRoleChange}
        grantRole={grantRole}
        revokeRole={revokeRole}
      />

      <ApproveDeclineModal
        open={approveDeclineDialogOpen}
        mode={mode}
        selectedRequestUsers={selectedRequestUsers}
        closeApproveDeclineDialog={closeApproveDeclineDialog}
        approveUsers={approveUsers}
        declineUser={declineUser}
      />
    </Container>
  );
};

export default UserAccessPage;
