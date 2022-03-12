import { useInvasivesApi } from 'hooks/useInvasivesApi';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Grid,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  MenuItem,
  TextField,
  Box,
  Theme,
  IconButton,
  Chip
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import {
  DataGrid,
  GridColDef,
  GridToolbarFilterButton,
  GridValueGetterParams,
  GridToolbarExport,
  GridToolbarColumnsButton
} from '@mui/x-data-grid';
import { CustomNoRowsOverlay } from '../../../components/data-grid/CustomNoRowsOverlay';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';

interface IAccessRequestPage {
  classes?: any;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '320px'
  },
  error: {
    backgroundColor: theme.palette.error.main
  },
  warning: {
    backgroundColor: theme.palette.warning.main
  },
  info: {
    backgroundColor: theme.palette.info.main
  },
  success: {
    backgroundColor: theme.palette.success.main
  },
  gray: {
    backgroundColor: theme.palette.grey[100]
  },
  paddingTop: {
    paddingTop: '1rem'
  }
}));

function escapeRegExp(value: string): string {
  return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
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
      }}>
      <div>
        <GridToolbarColumnsButton style={{ color: '#223f75' }} />
        <GridToolbarFilterButton style={{ color: '#223f75' }} />
        <GridToolbarExport
          style={{ color: '#223f75' }}
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
              onClick={props.clearSearch}>
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
  enum Mode {
    GRANT,
    REVOKE,
    APPROVE,
    DECLINE
  }

  const classes = useStyles();
  const api = useInvasivesApi();

  const [usersTableLoading, setUsersTableLoading] = useState(false);
  const [requestTableLoading, setRequestTableLoading] = useState(false);

  const [rows, setRows] = useState<any[]>([]);
  const [requestRows, setRequestRows] = useState<any[]>([]);
  const [searchedRows, setSearchedRows] = useState<any[]>([]);

  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<any[]>([]);
  const [detailsDialogUser, setDetailsDialogUser] = useState<any>({});
  const [detailsDialogUserLoaded, setDetailsDialogUserLoaded] = useState(false);
  const [accessRequests, setAccessRequests] = useState<any[]>([]);

  const [selectedRequestUsers, setSelectedRequestUsers] = useState<any[]>([]);
  const [detailsDialogRequestUser, setDetailsDialogRequestUser] = useState<any>({});
  const [detailsDialogRequestUserLoaded, setDetailsDialogRequestUserLoaded] = useState(false);

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [requestDetailsDialogOpen, setRequestDetailsDialogOpen] = useState(false);
  const [approveDeclineDialogOpen, setApproveDeclineDialogOpen] = useState(false);

  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [agencyCodes, setAgencyCodes] = useState<any[]>([]);
  const [employerCodes, setEmployerCodes] = useState<any[]>([]);

  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>({});

  const [searchText, setSearchText] = React.useState('');

  const [mode, setMode] = useState<any>(Mode.GRANT);

  /* 
    ================================================================================================
    ROW DATA CONTROLS 
    ================================================================================================
  */

  const renderDetailsButton = (params: GridValueGetterParams) => {
    return (
      <Tooltip title="View Details">
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            openDetailsDialog(params.row);
          }}>
          Details
        </Button>
      </Tooltip>
    );
  };

  const renderRequestDetailsButton = (params: GridValueGetterParams) => {
    return (
      <Tooltip title="View Details">
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            openRequestDetailsDialog(params.row);
          }}>
          Details
        </Button>
      </Tooltip>
    );
  };

  const renderStatus = (params: GridValueGetterParams) => {
    // let color = '#FF0000';
    let style = classes.gray;
    if (params.row.status === 'APPROVED') {
      style = classes.success;
    } else if (params.row.status === 'DECLINED') {
      style = classes.error;
    } else if (params.row.status === 'NOT_APPROVED') {
      style = classes.warning;
    }
    return <Chip label={params.row.status} classes={{ root: style }} />;
  };

  const renderType = (params: GridValueGetterParams) => {
    let style = classes.gray;
    if (params.row.requestType === 'ACCESS') {
      style = classes.success;
    } else if (params.row.requestType === 'UPDATE') {
      style = classes.info;
    }
    return <Chip label={params.row.requestType} classes={{ root: style }} />;
  };

  const handleRowClick = (param, event) => {
    event.stopPropagation();
  };

  const handleRowSelection = (ids) => {
    setSelectedUserIds(ids);
    const selectedUsers = [];
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
    const requests = [];
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

  const getRows = async (users: any) => {
    const rows = [];
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      await api.getRolesForUser(user.user_id).then((res) => {
        const roles = res.data.map((role) => role.role_description);
        const roleString = roles.join(', ');
        rows.push({
          id: user.user_id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: roleString,
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
      });
    }
    setRows(rows);
  };

  const getRequestRows = async (requests: any) => {
    const rows = [];
    for (let i = 0; i < requests.length; i++) {
      rows.push({
        id: requests[i].access_request_id,
        requestType: requests[i].request_type || 'ACCESS',
        firstName: requests[i].first_name,
        lastName: requests[i].last_name,
        email: requests[i].primary_email,
        employer: requests[i].employer,
        pacNumber: requests[i].pac_number,
        status: requests[i].status,
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
    { field: 'firstName', headerName: 'First Name', width: 130 },
    { field: 'lastName', headerName: 'Last Name', width: 130 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'expiryDate', headerName: 'Expiry Date', width: 200 },
    {
      field: 'role',
      headerName: 'Role(s)',
      width: 358
    },
    { field: 'accountStatus', headerName: 'Account Status', width: 200, hide: true },
    { field: 'activationStatus', headerName: 'Activation Status', width: 200, hide: true },
    { field: 'bceidUserId', headerName: 'BCEID User ID', width: 200, hide: true },
    { field: 'idirUserId', headerName: 'IDIR User ID', width: 200, hide: true },
    { field: 'preferredUsername', headerName: 'Preferred Username', width: 200, hide: true },
    { field: 'createdAt', headerName: 'Created At', width: 200, hide: true },
    { field: 'idirAccountName', headerName: 'IDIR Account Name', width: 200, hide: true },
    { field: 'bceidAccountName', headerName: 'BCEID Account Name', width: 200, hide: true },
    { field: 'workPhoneNumber', headerName: 'Work Phone Number', width: 200, hide: true },
    { field: 'fundingAgencies', headerName: 'Funding Agencies', width: 200, hide: true },
    { field: 'employer', headerName: 'Employer', width: 200, hide: true },
    { field: 'pacNumber', headerName: 'PAC Number', width: 200, hide: true },
    { field: 'pacServiceNumber1', headerName: 'PAC Service Number 1', width: 200, hide: true },
    { field: 'pacServiceNumber2', headerName: 'PAC Service Number 2', width: 200, hide: true },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: renderDetailsButton
    }
  ];

  const requestColumns: GridColDef[] = [
    //1185 max width
    { field: 'id', headerName: 'ID', width: 50 },
    { field: 'requestType', headerName: 'Type', width: 100, renderCell: renderType },
    { field: 'firstName', headerName: 'First Name', width: 120 },
    { field: 'lastName', headerName: 'Last Name', width: 120 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'dateRequested', headerName: 'Date Requested', width: 200 },
    { field: 'pacNumber', headerName: 'PAC Number', width: 120 },
    { field: 'status', headerName: 'Status', width: 159, renderCell: renderStatus },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: renderRequestDetailsButton
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
    loadUsers();
    getAvailableRoles();
    getFundingAgencies();
    getEmployers();
  }, []);

  /* 
    ================================================================================================
    LOAD INFO 
    ================================================================================================
  */

  const loadUsers = () => {
    setUsersTableLoading(true);
    setRequestTableLoading(true);
    api.getApplicationUsers().then(async (res) => {
      await setUsers(res);
      await getRows(res);
      setUsersTableLoading(false);
    });

    api.getAccessRequests().then(async (res) => {
      await setAccessRequests(res);
      await getRequestRows(res);
      setRequestTableLoading(false);
    });
  };

  const getFundingAgencies = () => {
    api.getFundingAgencies().then((res) => {
      const agencies = [];
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
      const roles = [];
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
      const employers = [];
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
        const roles = [];
        for (let i = 0; i < res.data.length; i++) {
          roles.push({
            id: res.data[i].role_id,
            name: res.data[i].role_name,
            description: res.data[i].role_description
          });
          setUserRoles(roles);
        }
        setMode(Mode.REVOKE);
        setRoleDialogOpen(true);
      });
    }
  };

  const closeRoleDialog = () => {
    setRoleDialogOpen(false);
    setSelectedRole('');
  };

  /* API CALLS */

  const grantRole = () => {
    api.batchGrantRoleToUser(selectedUserIds, selectedRole).then(() => {
      setRoleDialogOpen(false);
      loadUsers();
      setSelectedRole('');
    });
  };

  const revokeRole = () => {
    api.revokeRoleFromUser(selectedUserIds[0], selectedRole).then((res) => {
      setRoleDialogOpen(false);
      loadUsers();
      setSelectedRole('');
    });
  };

  const approveUsers = () => {
    // TODO: Handle multiple types of requests
    api.approveAccessRequests(selectedRequestUsers).then(() => {
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

  const handleSelectedRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRole(event.target.value);
  };

  return (
    <Container className={props.classes.container}>
      <Grid container spacing={4} style={{ paddingTop: '2rem' }}>
        <Grid item xs={12}>
          <Typography variant="h4" align="center">
            Grant or Revoke Roles for Existing Users
          </Typography>
        </Grid>

        {/* TABLES */}

        {/* USERS */}
        <Grid item xs={12}>
          <Card elevation={8}>
            <CardContent>
              <Grid container direction="row" spacing={5} justifyContent="space-between">
                <div style={{ height: 440, width: '100%' }}>
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
                    onSelectionModelChange={handleRowSelection}
                    rows={searchedRows}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
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
                    onClick={() => openRoleDialog(Mode.GRANT)}>
                    Select Role to Grant
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    disabled={!selectedUsers || selectedUsers.length > 1 || selectedUsers.length === 0}
                    variant="contained"
                    color="secondary"
                    onClick={() => openRoleDialog(Mode.REVOKE)}>
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
              <Grid container direction="row" spacing={5} justifyContent="space-between">
                <div style={{ height: 370, width: '100%' }}>
                  <DataGrid
                    loading={requestTableLoading}
                    components={{
                      NoRowsOverlay: CustomNoRowsOverlay
                    }}
                    onSelectionModelChange={handleAccessRequestRowSelection}
                    rows={requestRows}
                    columns={requestColumns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
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
                    onClick={() => openApproveDeclineDialog(Mode.APPROVE)}>
                    Approve Selected Users
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    disabled={
                      !selectedRequestUsers || selectedRequestUsers.length === 0 || selectedRequestUsers.length > 1
                    }
                    variant="contained"
                    color="secondary"
                    onClick={() => openApproveDeclineDialog(Mode.DECLINE)}>
                    Decline Selected User
                  </Button>
                </Grid>
              </Grid>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

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
          fullWidth>
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
              <Grid item>
                <Typography variant="h6">
                  <strong>Employer: </strong>
                  {employerCodes.map((employer) => {
                    if (employer.value === detailsDialogUser.employer) {
                      return employer.description;
                    }
                    return '';
                  })}
                </Typography>
              </Grid>
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
            {detailsDialogUser.roles && detailsDialogUser.roles.length > 0 && (
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
              autoFocus>
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
          fullWidth>
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
                {employerCodes.map((employer) => {
                  if (employer.value === detailsDialogRequestUser.employer) {
                    return employer.description;
                  }
                  return '';
                })}
              </Typography>
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
        fullWidth>
        <DialogTitle id="form-dialog-title">{mode === Mode.GRANT ? 'Grant Role' : 'Revoke Role'}</DialogTitle>
        <Divider />
        <DialogContent>
          <DialogContentText>
            {mode === Mode.GRANT ? <strong>Selected Users: </strong> : <strong>Selected User: </strong>}
          </DialogContentText>
          <Grid item>
            <Typography variant="h6">
              {selectedUsers.map((user) => (
                <li key={user.user_id}>{user.first_name + ' ' + user.last_name}</li>
              ))}
            </Typography>
          </Grid>
          <DialogContentText>
            Select a role to {mode === Mode.GRANT ? 'grant to the selected users.' : 'revoke from the selected user.'}
          </DialogContentText>
          <TextField
            style={{ width: '100%' }}
            classes={{ root: classes.root }}
            select
            name="Roles"
            id="available-roles"
            variant="outlined"
            label="Available Roles"
            SelectProps={{
              multiple: false,
              value: selectedRole,
              onChange: handleSelectedRoleChange
            }}>
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
        <DialogActions>
          <Button variant="outlined" onClick={closeRoleDialog}>
            Cancel
          </Button>
          {mode === Mode.GRANT && (
            <Button variant="contained" color="primary" onClick={grantRole}>
              Grant
            </Button>
          )}
          {mode === Mode.REVOKE && (
            <Button variant="contained" color="secondary" onClick={revokeRole}>
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
        fullWidth>
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
          <Grid item>
            <Typography variant="h6">
              {selectedRequestUsers.map((user) => (
                <li key={user.id}>{user.first_name + ' ' + user.last_name}</li>
              ))}
            </Typography>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={closeApproveDeclineDialog}>
            Cancel
          </Button>
          {mode === Mode.APPROVE && (
            <Button variant="contained" color="primary" onClick={approveUsers}>
              Approve
            </Button>
          )}
          {mode === Mode.DECLINE && (
            <Button variant="contained" color="secondary" onClick={declineUser}>
              Decline
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserAccessPage;
