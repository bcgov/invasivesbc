import { AuthStateContext } from 'contexts/authStateContext';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
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
  }
}));

const UserAccessPage: React.FC<IAccessRequestPage> = (props) => {
  enum Mode {
    GRANT,
    REVOKE
  }

  const classes = useStyles();
  const api = useInvasivesApi();

  const [rows, setRows] = useState<any[]>([]);
  const [rowsLoaded, setRowsLoaded] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<any[]>([]);
  const [detailsDialogUser, setDetailsDialogUser] = useState<any>({});
  const [detailsDialogUserLoaded, setDetailsDialogUserLoaded] = useState(false);

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>({});

  const [mode, setMode] = useState<any>(Mode.GRANT);

  /* ROW DATA */

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

  const handleRowClick = (param, event) => {
    event.stopPropagation();
  };

  const handleRowSelection = (ids) => {
    setSelectedUserIds(ids);
    // Get user details from ids
    let selectedUsers = [];
    for (let i = 0; i < ids.length; i++) {
      let user = users.find((u) => u.user_id === ids[i]);
      if (user) {
        selectedUsers.push(user);
      }
    }
    setSelectedUsers(selectedUsers);
  };

  // Get table rows
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
          role: roleString
        });
      });
    }
    setRows(rows);
    setRowsLoaded(true);
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'firstName', headerName: 'First Name', width: 130 },
    { field: 'lastName', headerName: 'Last Name', width: 130 },
    { field: 'email', headerName: 'Email', width: 200 },
    {
      field: 'role',
      headerName: 'Role(s)',
      width: 500
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: renderDetailsButton
    }
  ];

  /* LOAD INFO */

  useEffect(() => {
    api.getApplicationUsers().then((res) => {
      setUsers(res);
      getRows(res);
    });

    api.getRoles().then((res) => {
      let roles = [];
      for (let i = 0; i < res.length; i++) {
        roles.push({
          id: res[i].role_id,
          name: res[i].role_name,
          description: res[i].role_description
        });
      }
      setAvailableRoles(roles);
    });
  }, []);

  const loadUsers = () => {
    api.getApplicationUsers().then(async (res) => {
      await setUsers(res);
      await getRows(res);
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

  const openRoleDialog = (mode: any) => {
    if (mode === Mode.GRANT) {
      setMode(Mode.GRANT);
      setRoleDialogOpen(true);
    } else {
      api.getRolesForUser(selectedUsers[0].user_id).then((res) => {
        let roles = [];
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

  /* FORM CONTROLS */

  const handleSelectedRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRole(event.target.value);
  };

  return (
    <Container className={props.classes.container}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant="h4" align="center">
            Grant or Revoke Roles for Existing Users
          </Typography>
        </Grid>
        {/* Grant or revoke roles of existing users */}
        <Grid item xs={12}>
          <Card elevation={8}>
            <CardContent>
              <Grid container direction="row" spacing={5} justifyContent="space-between">
                <div style={{ height: 370, width: '100%' }}>
                  {rowsLoaded && (
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
                  )}
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
                <strong>Roles: </strong>
              </Typography>
            </Grid>
            <Grid item>
              {detailsDialogUser.role.split(',').map((role) => (
                <Typography variant="h6" key={role}>
                  <li>{role}</li>
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
      {/* Select a role from a dropdown list to grant or revoke for selected user(s) */}
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
    </Container>
  );
};

export default UserAccessPage;
