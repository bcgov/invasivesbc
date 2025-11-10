import React, { useEffect, useState } from 'react';

import { Button, SelectChangeEvent, Tooltip } from '@mui/material';
import { DataGrid, GridColDef, GridRowId, GridRowSelectionModel } from '@mui/x-data-grid';
import { CustomNoRowsOverlay } from 'UI/Features/Admin/components/CustomNoRowsOverlay';
import Spinner from 'UI/Reusable/Spinner/Spinner';
import GrantRevokeRoleModal, { Mode } from 'UI/Features/Admin/users/GrantRevokeRoleModal';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import { useSelector } from 'utils/use_selector';
import { selectAuth } from 'state/reducers/auth';
import DetailsModal from 'UI/Features/Admin/users/DetailsModal';
import useUserAccessReferenceData from 'UI/Features/Admin/components/useUserAccessReferenceData';

const RoleAssignment: React.FC = () => {
  const nilRole = '';

  const api = useInvasivesApi();
  const authState = useSelector(selectAuth);

  const [usersTableLoading, setUsersTableLoading] = useState(false);

  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [searchedRows, setSearchedRows] = useState<unknown[]>([]);

  const [users, setUsers] = useState<unknown[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Record<string, unknown>[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set<GridRowId>([])
  });
  const [detailsDialogUser, setDetailsDialogUser] = useState<unknown>({});
  const [detailsDialogUserLoaded, setDetailsDialogUserLoaded] = useState(false);

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  const [userRoles, setUserRoles] = useState<unknown[]>([]);
  const [selectedRole, setSelectedRole] = useState<unknown>(nilRole);

  const [mode, setMode] = useState<Mode>(Mode.GRANT);

  const { availableRoles, agencyCodes, employerCodes, loading: referenceDataLoading } = useUserAccessReferenceData();

  const renderDetailsButton = (params) => {
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

  const handleRowClick = (param, event) => {
    event.stopPropagation();
  };

  const handleRowSelection = (model: GridRowSelectionModel) => {
    const selectedUsers: Record<string, unknown>[] = [];
    const selectedUserIds: number[] = [];
    model.ids.forEach((id) => {
      selectedUserIds.push(Number(id));
      const user = users.find((u) => u.user_id === id);
      if (user) {
        selectedUsers.push(user);
      }
    });

    setSelectedUserIds(selectedUserIds);
    setSelectedUsers(selectedUsers);
    setSelectionModel({
      type: 'include',
      ids: new Set(model.ids)
    });
  };

  /*
    ================================================================================================
    ROWS
    ================================================================================================
  */

  const buildRowModel = (users) => {
    const rows: Record<string, unknown>[] = [];
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
      renderCell: (row) => renderDetailsButton(row)
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

  React.useEffect(() => {
    setSearchedRows(rows);
  }, [rows]);

  const renewUser = () => {
    api.renewUser(detailsDialogUser.id).then(() => {
      loadUsers();
      closeDetailsDialog();
    });
  };

  useEffect(() => {
    if (!authState?.authenticated) {
      return;
    }
    loadUsers();
  }, [authState.authenticated]);

  /*
    ================================================================================================
    LOAD INFO
    ================================================================================================
  */

  const loadUsers = () => {
    setUsersTableLoading(true);
    api.getApplicationUsers().then(async (res) => {
      setUsers(res);
      buildRowModel(res);
      setUsersTableLoading(false);
    });
  };

  /*
    ================================================================================================
    DIALOG CONTROLS
    ================================================================================================
  */

  const openDetailsDialog = (user) => {
    setDetailsDialogUser(user);
    setDetailsDialogUserLoaded(true);
    setDetailsDialogOpen(true);
  };

  const closeDetailsDialog = () => {
    setDetailsDialogUser({});
    setDetailsDialogUserLoaded(false);
    setDetailsDialogOpen(false);
  };

  const openRoleDialog = (mode) => {
    if (mode === Mode.GRANT) {
      setMode(Mode.GRANT);
      setRoleDialogOpen(true);
    } else {
      api.getRolesForUser(selectedUsers[0].user_id).then((res) => {
        const roles: Record<string, unknown>[] = [];
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
    api.revokeRoleFromUser(selectedUserIds[0], selectedRole).then(() => {
      setRoleDialogOpen(false);
      loadUsers();
      setSelectedRole(nilRole);
    });
  };

  const handleSelectedRoleChange = (event: SelectChangeEvent) => {
    setSelectedRole(parseInt(event.target.value) || nilRole);
  };
  if (!authState?.roles.some((role) => role.role_name === 'master_administrator')) {
    return <Spinner />;
  }

  if (referenceDataLoading) {
    return <Spinner />;
  }

  return (
    <>
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

      <h2> Grant or Revoke Roles for Existing Users</h2>

      <DataGrid
        loading={usersTableLoading}
        slots={{ noRowsOverlay: CustomNoRowsOverlay }}
        sortModel={[{ field: 'id', sort: 'asc' }]}
        rowSelectionModel={selectionModel}
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
        showToolbar
        onCellClick={handleRowClick}
        onRowClick={handleRowClick}
      />

      <Button
        disabled={!selectedUsers || selectedUsers.length === 0}
        variant="contained"
        color="primary"
        onClick={() => openRoleDialog(Mode.GRANT)}
      >
        Select Role to Grant
      </Button>

      <Button
        disabled={!selectedUsers || selectedUsers.length > 1 || selectedUsers.length === 0}
        variant="contained"
        color="error"
        onClick={() => openRoleDialog(Mode.REVOKE)}
      >
        Revoke Role
      </Button>
    </>
  );
};

export default RoleAssignment;
