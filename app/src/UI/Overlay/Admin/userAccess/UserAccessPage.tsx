import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { red, green, blue } from '@mui/material/colors';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  MenuItem,
  SelectChangeEvent,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridToolbarColumnsButton,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridValueGetterParams
} from '@mui/x-data-grid';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import React, { useEffect, useState } from 'react';
import { selectAuth } from 'state/reducers/auth';
import { useSelector } from 'utils/use_selector';
import { CustomNoRowsOverlay } from '../CustomNoRowsOverlay';
import EmailSetup from '../email-setup/EmailSetup';
import { bcBlue, bcYellow, black } from 'constants/colors';
import Spinner from 'UI/Spinner/Spinner';

interface IAccessRequestPage {
  classes?: any;
}

interface QuickSearchToolbarProps {
  clearSearch: () => void;
  onChange: () => void;
  value: string;
}

function QuickSearchToolbar(props: QuickSearchToolbarProps) {
  return (
    <Box
      sx={{
        p: 2,
        pb: 1,
        justifyContent: 'space-between',
        display: 'flex',
        alignItems: 'flex-start',
        flexWrap: 'wrap'
      }}
    >
      <div>
        <GridToolbarColumnsButton style={{ color: bcBlue }} onResize={undefined} onResizeCapture={undefined} />
        <GridToolbarFilterButton style={{ color: bcBlue }} onResize={undefined} onResizeCapture={undefined} />
        <GridToolbarExport
          style={{ color: bcBlue }}
          csvOptions={{
            includeHeaders: true,
            allColumns: true,
            fileName: 'InvasivesBC - Application Users (' + new Date().toISOString() + ')'
          }}
        />
      </div>
      <TextField
        variant="standard"
        value={props.value}
        onChange={props.onChange}
        placeholder="Search…"
        InputProps={{
          startAdornment: <SearchIcon fontSize="small" />,
          endAdornment: (
            <IconButton
              title="Clear"
              aria-label="Clear"
              size="small"
              style={{ visibility: props.value ? 'visible' : 'hidden' }}
              onClick={props.clearSearch}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          )
        }}
        sx={{
          width: {
            xs: 1,
            sm: 'auto'
          },
          m: (theme) => theme.spacing(1, 0.5, 1.5),
          '& .MuiSvgIconRoot': {
            mr: 0.5
          },
          '& .MuiInputUnderline:before': {
            borderBottom: 1,
            borderColor: 'divider'
          }
        }}
      />
    </Box>
  );
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
    for (let i = 0; i < ids.length; i++) {
      const user = accessRequests.find((u) => u.access_request_id === ids[i]);
      if (user) {
        requests.push(user);
      }
    }
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
    for (let i = 0; i < requests.length; i++) {
      rows.push({
        id: requests[i].access_request_id,
        requestType: requests[i].request_type || 'ACCESS',
        firstName: requests[i].first_name,
        lastName: requests[i].last_name,
        email: requests[i].primary_email,
        employer: requests[i].employer,
        pacNumber: requests[i].pac_number,
        status: formatStatus(requests[i].status),
        requestedRoles: requests[i].requested_roles,
        bceidAccountName: requests[i].bceid_account_name,
        bceidUserId: requests[i].bceid_userid,
        comments: requests[i].comments,
        fundingAgencies: requests[i].funding_agencies,
        idirAccountName: requests[i].idir_account_name,
        idirUserId: requests[i].idir_userid,
        pacServiceNumber1: requests[i].pac_service_number_1,
        pacServiceNumber2: requests[i].pac_service_number_2,
        workPhoneNumber: requests[i].work_phone_number,
        dateRequested: new Date(requests[i].created_at).toLocaleString()
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
    { field: 'preferredUsername', headerName: 'Preferred Username', width: 200, },
    { field: 'createdAt', headerName: 'Created At', width: 200 },
    { field: 'idirAccountName', headerName: 'IDIR Account Name', width: 200 },
    { field: 'bceidAccountName', headerName: 'BCEID Account Name', width: 200 },
    { field: 'workPhoneNumber', headerName: 'Work Phone Number', width: 200 },
    { field: 'fundingAgencies', headerName: 'Funding Agencies', width: 200 },
    { field: 'employer', headerName: 'Employer', width: 200 },
    { field: 'pacNumber', headerName: 'PAC Number', width: 200 },
    { field: 'pacServiceNumber1', headerName: 'PAC Service Number 1', width: 200 },
    { field: 'pacServiceNumber2', headerName: 'PAC Service Number 2', width: 200 },
    { field: 'actions', headerName: 'Actions', width: 100, renderCell: (row) => renderDetailsButton(row as GridValueGetterParams) }
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
    pacServiceNumber2: false,
  }

  const requestColumns: GridColDef[] = [
    //1185 max width
    { field: 'id', headerName: 'ID', width: 50 },
    { field: 'requestType', headerName: 'Type', width: 100, renderCell: (row) => renderType(row as GridValueGetterParams) },
    { field: 'firstName', headerName: 'First Name', width: 120 },
    { field: 'lastName', headerName: 'Last Name', width: 120 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'dateRequested', headerName: 'Date Requested', width: 200 },
    { field: 'pacNumber', headerName: 'PAC Number', width: 120 },
    { field: 'status', headerName: 'Status', width: 159, renderCell: (data) => renderStatus(data as GridValueGetterParams) },
    { field: 'actions', headerName: 'Actions', width: 100, renderCell: (row) => renderRequestDetailsButton(row as GridValueGetterParams) }
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
      setApproveDeclineDialogOpen(true);
    } else {
      setMode(Mode.DECLINE);
      setApproveDeclineDialogOpen(true);
    }
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
    api.approveAccessRequests(selectedRequestUsers).then((response) => {
      closeApproveDeclineDialog();
      loadUsers();
    });
  };

  const declineUser = () => {
    if (selectedRequestUsers[0].request_type === 'UPDATE') {
      api.declineUpdateRequest(selectedRequestUsers[0]).then(() => {
        closeApproveDeclineDialog();
        loadUsers();
      });
    } else {
      api.declineAccessRequest(selectedRequestUsers[0]).then(() => {
        closeApproveDeclineDialog();
        loadUsers();
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
    <Container
      // className={classes?.container}
      style={{ paddingBottom: '50px' }}
    >
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
                    sortModel={[{ field: 'id', sort: 'asc' }]}
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
                <div style={{ height: 550, width: '100%' }}>
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
                    onRowSelectionModelChange={handleAccessRequestRowSelection}
                    rows={requestRows}
                    columns={requestColumns}
                    sortModel={[{ field: 'id', sort: 'desc' }]}
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

      {/*
        ###
        Details dialog
        ###
      */}
      {detailsDialogUserLoaded && (
        <Dialog
          open={detailsDialogOpen}
          onClose={closeDetailsDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle id="alert-dialog-title">
            <strong>{detailsDialogUser.firstName + ' ' + detailsDialogUser.lastName}</strong>
          </DialogTitle>
          <DialogContent>
            <Grid item>
              <Typography variant="h6">
                <strong>Email: </strong>
                {detailsDialogUser.email}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="h6">
                <strong>Username: </strong>
                {detailsDialogUser.preferredUsername}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="h6">
                <strong>Expiry Date: </strong>
                {detailsDialogUser.expiryDate}
              </Typography>
            </Grid>
            {detailsDialogUser.bceidUserId && (
              <Grid item>
                <Typography variant="h6">
                  <strong>BCEID User ID: </strong>
                  {detailsDialogUser.bceidUserId}
                </Typography>
              </Grid>
            )}
            {detailsDialogUser.idirUserId && (
              <Grid item>
                <Typography variant="h6">
                  <strong>IDIR User ID: </strong>
                  {detailsDialogUser.idirUserId}
                </Typography>
              </Grid>
            )}
            {detailsDialogUser.idirAccountName && (
              <Grid item>
                <Typography variant="h6">
                  <strong>IDIR Account Name: </strong>
                  {detailsDialogUser.idirAccountName}
                </Typography>
              </Grid>
            )}
            {detailsDialogUser.workPhoneNumber && (
              <Grid item>
                <Typography variant="h6">
                  <strong>Work Phone: </strong>
                  {detailsDialogUser.workPhoneNumber}
                </Typography>
              </Grid>
            )}
            {detailsDialogUser.employer && (
              <>
                <Grid item>
                  <Typography variant="h6">
                    <strong>Employer: </strong>
                  </Typography>
                </Grid>
                <Grid item>
                  {detailsDialogUser.employer.split(',').map((employer) => (
                    <Typography variant="h6" key={employer}>
                      <li key={employer}>
                        {employerCodes.map((employerCode) => {
                          if (employerCode.value === employer) {
                            return employerCode.description;
                          }
                          return '';
                        })}
                      </li>
                    </Typography>
                  ))}
                </Grid>
              </>
            )}
            {detailsDialogUser.pacNumber && (
              <Grid item>
                <Typography variant="h6">
                  <strong>PAC Number: </strong>
                  {detailsDialogUser.pacNumber}
                </Typography>
              </Grid>
            )}
            {detailsDialogUser.pacServiceNumber1 && (
              <Grid item>
                <Typography variant="h6">
                  <strong>PAC Service Number 1: </strong>
                  {detailsDialogUser.pacServiceNumber1}
                </Typography>
              </Grid>
            )}
            {detailsDialogUser.pacServiceNumber2 && (
              <Grid item>
                <Typography variant="h6">
                  <strong>PAC Service Number 2: </strong>
                  {detailsDialogUser.pacServiceNumber2}
                </Typography>
              </Grid>
            )}
            {detailsDialogUser.fundingAgencies && detailsDialogUser.fundingAgencies.length > 0 && (
              <>
                <Grid item>
                  <Typography variant="h6">
                    <strong>Funding Agencies: </strong>
                  </Typography>
                </Grid>
                <Grid item>
                  {detailsDialogUser.fundingAgencies.split(',').map((agency) => (
                    <Typography variant="h6" key={agency}>
                      <li key={agency}>
                        {agencyCodes.map((agencyCode) => {
                          if (agencyCode.value === agency) {
                            return agencyCode.description;
                          }
                          return '';
                        })}
                      </li>
                    </Typography>
                  ))}
                </Grid>
              </>
            )}
            {detailsDialogUser.role && detailsDialogUser.role.length > 0 && (
              <>
                <Grid item>
                  <Typography variant="h6">
                    <strong>Roles: </strong>
                  </Typography>
                </Grid>
                <Grid item>
                  {detailsDialogUser.role.split(',').map((role) => (
                    <Typography variant="h6" key={role}>
                      <li key={role}>{role}</li>
                    </Typography>
                  ))}
                </Grid>
              </>
            )}
          </DialogContent>
          <Divider />
          <DialogActions>
            <Button
              disabled={new Date(detailsDialogUser.expiryDate) > new Date()}
              variant="contained"
              color="secondary"
              onClick={renewUser}
              autoFocus
            >
              Renew User
            </Button>
            <Button variant="contained" onClick={closeDetailsDialog} autoFocus>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/*
        ###
        Access Request Details Dialog
        ###
      */}
      {detailsDialogRequestUserLoaded && (
        <Dialog
          open={requestDetailsDialogOpen}
          onClose={closeRequestDetailsDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle id="alert-dialog-title">
            <strong>{detailsDialogRequestUser.firstName + ' ' + detailsDialogRequestUser.lastName}</strong>
          </DialogTitle>
          <DialogContent>
            <Grid item>
              <Typography variant="h6">
                <strong>Email: </strong>
                {detailsDialogRequestUser.email}
              </Typography>
            </Grid>
            {detailsDialogRequestUser.bceidUserId && (
              <Grid item>
                <Typography variant="h6">
                  <strong>BCEID User ID: </strong>
                  {detailsDialogRequestUser.bceidUserId}
                </Typography>
              </Grid>
            )}
            {detailsDialogRequestUser.idirUserId && (
              <Grid item>
                <Typography variant="h6">
                  <strong>IDIR User ID: </strong>
                  {detailsDialogRequestUser.idirUserId}
                </Typography>
              </Grid>
            )}
            {detailsDialogRequestUser.bceidAccountName && (
              <Grid item>
                <Typography variant="h6">
                  <strong>BCEID Account Name: </strong>
                  {detailsDialogRequestUser.bceidAccountName}
                </Typography>
              </Grid>
            )}
            {detailsDialogRequestUser.idirAccountName && (
              <Grid item>
                <Typography variant="h6">
                  <strong>IDIR Account Name: </strong>
                  {detailsDialogRequestUser.idirAccountName}
                </Typography>
              </Grid>
            )}
            <Grid item>
              <Typography variant="h6">
                <strong>Work Phone: </strong>
                {detailsDialogRequestUser.workPhoneNumber}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="h6">
                <strong>Employer: </strong>
              </Typography>
            </Grid>
            <Grid item>
              {detailsDialogRequestUser.employer.split(',').map((employer) => (
                <Typography variant="h6" key={employer}>
                  <li key={employer}>
                    {employerCodes.map((employerCode) => {
                      if (employerCode.value === employer) {
                        return employerCode.description;
                      }
                      return '';
                    })}
                  </li>
                </Typography>
              ))}
            </Grid>
            <Grid item>
              <Typography variant="h6">
                <strong>PAC Number: </strong>
                {detailsDialogRequestUser.pacNumber}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="h6">
                <strong>PAC Service Number 1: </strong>
                {detailsDialogRequestUser.pacServiceNumber1}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="h6">
                <strong>PAC Service Number 2: </strong>
                {detailsDialogRequestUser.pacServiceNumber2}
              </Typography>
            </Grid>
            {detailsDialogRequestUser.fundingAgencies && detailsDialogRequestUser.fundingAgencies.length > 0 && (
              <>
                <Grid item>
                  <Typography variant="h6">
                    <strong>Funding Agencies: </strong>
                  </Typography>
                </Grid>
                <Grid item>
                  {detailsDialogRequestUser.fundingAgencies.split(',').map((agency) => (
                    <Typography variant="h6" key={agency}>
                      <li key={agency}>
                        {agencyCodes.map((agencyCode) => {
                          if (agencyCode.value === agency) {
                            return agencyCode.description;
                          }
                          return '';
                        })}
                      </li>
                    </Typography>
                  ))}
                </Grid>
              </>
            )}
            {detailsDialogRequestUser.requestedRoles && detailsDialogRequestUser.requestedRoles.length > 0 && (
              <>
                <Grid item>
                  <Typography variant="h6">
                    <strong>Requested Roles: </strong>
                  </Typography>
                </Grid>
                <Grid item>
                  {detailsDialogRequestUser.requestedRoles.split(',').map((role) => (
                    <Typography variant="h6" key={role}>
                      <li key={role}>
                        {availableRoles.map((roleCode) => {
                          if (roleCode.name === role) {
                            return roleCode.description;
                          }
                          return '';
                        })}
                      </li>
                    </Typography>
                  ))}
                </Grid>
              </>
            )}
          </DialogContent>
          <Divider />
          <DialogActions>
            <Button variant="contained" onClick={closeRequestDetailsDialog} autoFocus>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/*
        ###
        Role grant/revoke flexible dialog
        ###
      */}
      <Dialog
        open={roleDialogOpen}
        onClose={closeRoleDialog}
        aria-labelledby="form-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="form-dialog-title">{mode === Mode.GRANT ? 'Grant Role' : 'Revoke Role'}</DialogTitle>
        <Divider />
        <DialogContent>
          <DialogContentText>
            {mode === Mode.GRANT ? <strong>Selected Users: </strong> : <strong>Selected User: </strong>}
          </DialogContentText>
          <List dense>
            {selectedUsers.map((user) => (
              <ListItem key={user.user_id}>{user.first_name + ' ' + user.last_name}</ListItem>
            ))}
          </List>
          <DialogContentText>
            Select a role to {mode === Mode.GRANT ? 'grant to the selected users.' : 'revoke from the selected user.'}
          </DialogContentText>
          <TextField
            sx={{ mt: 2, width: '100%' }}
            select
            name="Roles"
            id="available-roles"
            variant="outlined"
            label="Available Roles"
            SelectProps={{
              multiple: false,
              value: selectedRole,
              onChange: handleSelectedRoleChange
            }}
          >
            {mode === Mode.GRANT
              ? availableRoles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.description}
                </MenuItem>
              ))
              : userRoles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.description}
                </MenuItem>
              ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: '8pt' }}>
          <Button variant="outlined" onClick={closeRoleDialog}>
            Cancel
          </Button>
          {mode === Mode.GRANT && (
            <Button variant="contained" color="success" onClick={grantRole}>
              Grant
            </Button>
          )}
          {mode === Mode.REVOKE && (
            <Button variant="contained" color="error" onClick={revokeRole}>
              Revoke
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/*
        ###
        Approve request / decline request flexible dialog
        ###
      */}
      <Dialog
        open={approveDeclineDialogOpen}
        onClose={closeApproveDeclineDialog}
        aria-labelledby="form-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="form-dialog-title">
          {mode === Mode.APPROVE ? 'Approve Request' : 'Decline Request'}
        </DialogTitle>
        <Divider />
        <DialogContent>
          <DialogContentText>
            {mode === Mode.APPROVE ? (
              <strong>Approve selected requests?</strong>
            ) : (
              <strong>Decline the selected request?</strong>
            )}
          </DialogContentText>
          {mode === Mode.APPROVE && (
            <DialogContentText>
              The requested roles will be granted to the user. These can be changed at any time by an admin.
            </DialogContentText>
          )}
          <DialogContentText>
            {mode === Mode.APPROVE ? <strong>Selected Users: </strong> : <strong>Selected User: </strong>}
          </DialogContentText>
          <List dense>
            {selectedRequestUsers.map((user) => (
              <ListItem key={user.id}>
                {user.first_name + ' ' + user.last_name}
                <List>
                  {user.requested_roles.split(",").map((roleReq: string) => (
                    <ListItem key={`${user.id}-${roleReq}`}>{roleReq}</ListItem>
                  ))}
                </List>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: '8pt' }}>
          <Button variant="outlined" onClick={closeApproveDeclineDialog}>
            Cancel
          </Button>
          {mode === Mode.APPROVE && (
            <Button variant="contained" color="primary" onClick={approveUsers}>
              Approve
            </Button>
          )}
          {mode === Mode.DECLINE && (
            <Button variant="contained" color="error" onClick={declineUser}>
              Decline
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserAccessPage;
