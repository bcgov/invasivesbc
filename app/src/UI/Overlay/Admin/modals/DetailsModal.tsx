import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, List, ListItem, Typography } from "@mui/material";

type Props = {
  open: boolean,
  detailsDialogUser: Record<string, any>
  employerCodes: Record<string, any>[]
  agencyCodes: Record<string, any>[]
  closeDetailsDialog: () => void,
  renewUser: () => void
}
const DetailsModal = ({
  open,
  closeDetailsDialog,
  detailsDialogUser,
  employerCodes,
  agencyCodes,
  renewUser,
}: Props) => {
  return (
    <Dialog
      open={open}
      onClose={closeDetailsDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="alert-dialog-title" fontWeight="bold">
        {detailsDialogUser.firstName + ' ' + detailsDialogUser.lastName}
      </DialogTitle>
      <DialogContent>
        <Grid item>
          <Typography>
            <strong>Email: </strong>
            {detailsDialogUser.email}
          </Typography>
        </Grid>
        <Grid item>
          <Typography>
            <strong>Username: </strong>
            {detailsDialogUser.preferredUsername}
          </Typography>
        </Grid>
        <Grid item>
          <Typography>
            <strong>Expiry Date: </strong>
            {detailsDialogUser.expiryDate}
          </Typography>
        </Grid>
        {detailsDialogUser.bceidUserId && (
          <Grid item>
            <Typography>
              <strong>BCEID User ID: </strong>
              {detailsDialogUser.bceidUserId}
            </Typography>
          </Grid>
        )}
        {detailsDialogUser.idirUserId && (
          <Grid item>
            <Typography>
              <strong>IDIR User ID: </strong>
              {detailsDialogUser.idirUserId}
            </Typography>
          </Grid>
        )}
        {detailsDialogUser.idirAccountName && (
          <Grid item>
            <Typography>
              <strong>IDIR Account Name: </strong>
              {detailsDialogUser.idirAccountName}
            </Typography>
          </Grid>
        )}
        {detailsDialogUser.workPhoneNumber && (
          <Grid item>
            <Typography>
              <strong>Work Phone: </strong>
              {detailsDialogUser.workPhoneNumber}
            </Typography>
          </Grid>
        )}
        {detailsDialogUser.employer && (
          <>
            <Grid item>
              <Typography>
                <strong>Employer: </strong>
              </Typography>
            </Grid>
            <Grid item>
              {detailsDialogUser.employer.split(',').map((employer) => (
                <Typography key={employer}>
                  <ListItem key={employer}>
                    {employerCodes.map((employerCode) => {
                      if (employerCode.value === employer) {
                        return employerCode.description;
                      }
                    })}
                  </ListItem>
                </Typography>
              ))}
            </Grid>
          </>
        )}
        {detailsDialogUser.pacNumber && (
          <Grid item>
            <Typography>
              <strong>PAC Number: </strong>
              {detailsDialogUser.pacNumber}
            </Typography>
          </Grid>
        )}
        {detailsDialogUser.pacServiceNumber1 && (
          <Grid item>
            <Typography>
              <strong>PAC Service Number 1: </strong>
              {detailsDialogUser.pacServiceNumber1}
            </Typography>
          </Grid>
        )}
        {detailsDialogUser.pacServiceNumber2 && (
          <Grid item>
            <Typography>
              <strong>PAC Service Number 2: </strong>
              {detailsDialogUser.pacServiceNumber2}
            </Typography>
          </Grid>
        )}
        {detailsDialogUser.fundingAgencies && detailsDialogUser.fundingAgencies.length > 0 && (
          <>
            <Grid item>
              <Typography>
                <strong>Funding Agencies: </strong>
              </Typography>
            </Grid>
            <Grid item>
              <List dense>
                {detailsDialogUser.fundingAgencies.split(',').map((agency) => (
                  <ListItem>
                    <Typography key={agency}>
                      {agencyCodes.map((agencyCode) => {
                        if (agencyCode.value === agency) {
                          return agencyCode.description;
                        }
                      })}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Grid>
          </>
        )}
        {detailsDialogUser.role && detailsDialogUser.role.length > 0 && (
          <>
            <Grid item>
              <Typography fontWeight="bold">
                Roles:
              </Typography>
            </Grid>
            <Grid item>
              <List dense>
                {detailsDialogUser.role.split(',').map((role) => (
                  <ListItem key={role}>
                    <Typography key={role}>
                      {role}
                    </Typography>
                  </ListItem>
                ))}
              </List>
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
  )
}
export default DetailsModal;
