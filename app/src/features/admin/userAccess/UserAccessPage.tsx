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
  makeStyles
} from '@material-ui/core';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';

interface IAccessRequestPage {
  classes?: any;
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: '320px'
  },
  paddingTop: {
    paddingTop: '1rem'
  }
}));

const UserAccessPage: React.FC<IAccessRequestPage> = (props) => {
  enum Mode {
    GRANT,
    REVOKE,
    APPROVE,
    DECLINE
  }

  const classes = useStyles();
  const api = useInvasivesApi();

  const [rows, setRows] = useState<any[]>([]);
  const [requestRows, setRequestRows] = useState<any[]>([]);

  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<any[]>([]);
  const [detailsDialogUser, setDetailsDialogUser] = useState<any>({});
  const [detailsDialogUserLoaded, setDetailsDialogUserLoaded] = useState(false);
  const [accessRequests, setAccessRequests] = useState<any[]>([]);

  const [selectedRequestUsers, setSelectedRequestUsers] = useState<any[]>([]);
  const [selectedRequestUserIds, setSelectedRequestUserIds] = useState<any[]>([]);
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

  const [mode, setMode] = useState<any>(Mode.GRANT);

  /* ROW DATA CONTROLS */

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

  const handleRowClick = (param, event) => {
    event.stopPropagation();
  };

  const handleRowSelection = (ids) => {
    setSelectedUserIds(ids);
    // Get user details from ids
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
    console.log(requests);
    setSelectedRequestUsers(requests);
  };

  /* ROWS */

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
          accountStatus: user.account_status,
          activationStatus: user.activation_status,
          bceidUserId: user.bceid_userid,
          expiryDate: user.expiry_date,
          idirUserId: user.idir_userid,
          preferredUsername: user.preferred_username
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
        workPhoneNumber: requests[i].work_phone_number
      });
    }
    setRequestRows(rows);
  };

  /* COLUMNS */

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'firstName', headerName: 'First Name', width: 130 },
    { field: 'lastName', headerName: 'Last Name', width: 130 },
    { field: 'email', headerName: 'Email', width: 200 },
    {
      field: 'role',
      headerName: 'Role(s)',
      width: 557
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: renderDetailsButton
    }
  ];

  const requestColumns: GridColDef[] = [
    //1185 max width
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'firstName', headerName: 'First Name', width: 150 },
    { field: 'lastName', headerName: 'Last Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'employer', headerName: 'Employer', width: 200 },
    { field: 'pacNumber', headerName: 'PAC Number', width: 158 },
    { field: 'status', headerName: 'Status', width: 159 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: renderRequestDetailsButton
    }
  ];

  /* ON MOUNT */

  useEffect(() => {
    loadUsers();
    getAvailableRoles();
    getFundingAgencies();
    getEmployers();
  }, []);

  /* LOAD INFO */

  const loadUsers = () => {
    api.getApplicationUsers().then(async (res) => {
      await setUsers(res);
      await getRows(res);
    });

    api.getAccessRequests().then(async (res) => {
      await setAccessRequests(res);
      await getRequestRows(res);
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

  /* DIALOG CONTROLS */

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
    console.log(selectedRequestUsers);
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
    console.log('Request users: ', selectedRequestUsers);
    api.approveAccessRequests(selectedRequestUsers).then(() => {
      setApproveDeclineDialogOpen(false);
      loadUsers();
    });
  };

  const declineUser = () => {
    console.log('Request user: ', selectedRequestUsers[0]);
    // Set the status of the selected access request to DECLINED
    api.declineAccessRequest(selectedRequestUsers[0]).then(() => {
      setApproveDeclineDialogOpen(false);
      loadUsers();
    });
  };

  /* FORM CONTROLS */

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
                <div style={{ height: 370, width: '100%' }}>
                  <DataGrid
                    onSelectionModelChange={handleRowSelection}
                    rows={rows}
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
            Approve or Decline Access Requests
          </Typography>
        </Grid>
        {/* Approve or decline checked users */}
        <Grid item xs={12}>
          <Card elevation={8}>
            <CardContent>
              <Grid container direction="row" spacing={5} justifyContent="space-between">
                <div style={{ height: 370, width: '100%' }}>
                  <DataGrid
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

      {/* DIALOGS */}

      {/* Details dialog */}
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
          </DialogContent>
          <Divider />
          <DialogActions>
            <Button variant="contained" onClick={closeDetailsDialog} autoFocus>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Access Request Details Dialog */}
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
          </DialogContent>
          <Divider />
          <DialogActions>
            <Button variant="contained" onClick={closeRequestDetailsDialog} autoFocus>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Role grant/revoke flexible dialog */}
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
          {/* Single-select dropdown with list of roles should be here */}
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
              ? // Map available roles to dropdown list
                availableRoles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.description}
                  </MenuItem>
                ))
              : // Map user's roles to dropdown list
                userRoles.map((role) => (
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

      {/* Approve request / decline request flexible dialog */}
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
