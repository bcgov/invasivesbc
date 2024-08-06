import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography
} from '@mui/material';
enum Mode {
  GRANT,
  REVOKE,
  APPROVE,
  DECLINE
}
type Props = {
  open: boolean;
  mode: Mode;
  selectedUsers: Record<string, any>[];
  selectedRole: Record<string, any>[];
  availableRoles: Record<string, any>[];
  userRoles: Record<string, any>[];
  closeRoleDialog: () => void;
  handleSelectedRoleChange: (event: SelectChangeEvent<any>) => void;
  grantRole: () => void;
  revokeRole: () => void;
};
const GrantRevokeRoleModal = ({
  open,
  closeRoleDialog,
  mode,
  selectedUsers,
  selectedRole,
  handleSelectedRoleChange,
  availableRoles,
  userRoles,
  grantRole,
  revokeRole
}: Props) => {
  return (
    <Dialog
      open={open}
      onClose={closeRoleDialog}
      aria-labelledby="form-dialog-title"
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '60vh'
        }
      }}
    >
      <DialogTitle id="form-dialog-title">{mode === Mode.GRANT ? 'Grant Role' : 'Revoke Role'}</DialogTitle>
      <Divider />
      <DialogContent>
        <DialogContentText fontWeight="bold">
          {mode === Mode.GRANT ? 'Selected Users:' : 'Selected User:'}
        </DialogContentText>
        <List dense>
          {selectedUsers.map((user) => (
            <ListItem key={user.user_id}>
              <Typography>{user.first_name + ' ' + user.last_name}</Typography>
            </ListItem>
          ))}
        </List>
        <DialogContentText>
          Select a role to {mode === Mode.GRANT ? 'grant to the selected users.' : 'revoke from the selected user.'}
        </DialogContentText>
        <FormControl fullWidth sx={{ marginTop: '5pt' }}>
          <InputLabel>Available Roles</InputLabel>
          <Select id="available-roles" value={selectedRole} label="Available Roles" onChange={handleSelectedRoleChange}>
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
          </Select>
        </FormControl>
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
  );
};
export default GrantRevokeRoleModal;
