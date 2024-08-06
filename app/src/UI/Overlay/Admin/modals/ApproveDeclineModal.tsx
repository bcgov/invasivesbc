import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Grid, List, ListItem, Typography } from "@mui/material"

enum Mode {
  GRANT,
  REVOKE,
  APPROVE,
  DECLINE
}
type Props = {
  open: boolean,
  mode: Mode,
  selectedRequestUsers: Record<string, any>[],
  closeApproveDeclineDialog: () => void,
  approveUsers: () => void
  declineUser: () => void
}
const ApproveDeclineModal = ({
  open,
  mode,
  selectedRequestUsers,
  closeApproveDeclineDialog,
  approveUsers,
  declineUser
}: Props) => {

  return (
    <Dialog
      open={open}
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
        <DialogContentText fontWeight="bold">
          {mode === Mode.APPROVE
            ? "Approve selected requests?"
            : "Decline the selected request?"}
        </DialogContentText>
        {mode === Mode.APPROVE && (
          <DialogContentText>
            The requested roles will be granted to the user. These can be changed at any time by an admin.
          </DialogContentText>
        )}
        <DialogContentText fontWeight="bold">
          {mode === Mode.APPROVE
            ? 'Selected Users:'
            : 'Selected User:'}
        </DialogContentText>
        {selectedRequestUsers.map((user) => (
          <Grid item sx={{ ml: 2 }}>
            <DialogContentText fontWeight="bold">
              {user.first_name + ' ' + user.last_name}:
            </DialogContentText>
            {user.requested_roles.split(",").map((roleReq: string) => (
              <List dense>
                <ListItem key={`${user.id}-${roleReq}`}>{roleReq}</ListItem>
              </List>
            ))}
          </Grid>
        ))}
      </DialogContent>
      <DialogActions sx={{ p: '8pt' }}>
        <Button variant="outlined" onClick={closeApproveDeclineDialog}>
          Cancel
        </Button>
        {mode === Mode.APPROVE && (
          <Button
            variant="contained"
            color="primary"
            onClick={approveUsers}
          >
            Approve
          </Button>
        )}
        {mode === Mode.DECLINE && (
          <Button
            variant="contained"
            color="error"
            onClick={declineUser}
          >
            Decline
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default ApproveDeclineModal
