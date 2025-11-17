import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  List,
  ListItem,
  Typography
} from '@mui/material';
type Props = {
  closeRequestDetailsDialog: () => void;
  requestDetailsDialogOpen: boolean;
  detailsDialogRequestUser: Record<string, unknown>;
  employerCodes: Record<string, unknown>[];
  agencyCodes: Record<string, unknown>[];
  availableRoles: Record<string, unknown>[];
};

const AccessRequestModal = ({
  closeRequestDetailsDialog,
  requestDetailsDialogOpen,
  detailsDialogRequestUser,
  employerCodes,
  agencyCodes,
  availableRoles
}: Props) => {
  return (
    <Dialog
      open={requestDetailsDialogOpen}
      onClose={closeRequestDetailsDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '60vh'
        }
      }}
    >
      <DialogTitle id="alert-dialog-title" fontWeight="bold">
        {detailsDialogRequestUser.firstName + ' ' + detailsDialogRequestUser.lastName}
      </DialogTitle>
      <DialogContent>
        <Grid>
          <Typography>
            <strong>Email: </strong>
            {detailsDialogRequestUser.email}
          </Typography>
        </Grid>
        {detailsDialogRequestUser.bceidUserId && (
          <Grid>
            <Typography>
              <strong>BCEID User ID: </strong>
              {detailsDialogRequestUser.bceidUserId}
            </Typography>
          </Grid>
        )}
        {detailsDialogRequestUser.idirUserId && (
          <Grid>
            <Typography>
              <strong>IDIR User ID: </strong>
              {detailsDialogRequestUser.idirUserId}
            </Typography>
          </Grid>
        )}
        {detailsDialogRequestUser.bceidAccountName && (
          <Grid>
            <Typography>
              <strong>BCEID Account Name: </strong>
              {detailsDialogRequestUser.bceidAccountName}
            </Typography>
          </Grid>
        )}
        {detailsDialogRequestUser.idirAccountName && (
          <Grid>
            <Typography>
              <strong>IDIR Account Name: </strong>
              {detailsDialogRequestUser.idirAccountName}
            </Typography>
          </Grid>
        )}
        <Grid>
          <Typography>
            <strong>Work Phone: </strong>
            {detailsDialogRequestUser.workPhoneNumber}
          </Typography>
        </Grid>
        <Grid>
          <Typography>
            <strong>PAC Number: </strong>
            {detailsDialogRequestUser.pacNumber}
          </Typography>
        </Grid>
        <Grid>
          <Typography>
            <strong>PAC Service Number 1: </strong>
            {detailsDialogRequestUser.pacServiceNumber1}
          </Typography>
        </Grid>
        <Grid>
          <Typography>
            <strong>PAC Service Number 2: </strong>
            {detailsDialogRequestUser.pacServiceNumber2}
          </Typography>
        </Grid>
        <Grid>
          <Typography>
            <strong>Employer: </strong>
          </Typography>
        </Grid>
        <Grid>
          <List dense>
            {detailsDialogRequestUser.employer.split(',').map((employer) => (
              <ListItem key={employer}>
                <Typography key={employer}>
                  {employerCodes.map((employerCode) => {
                    if (employerCode.value === employer) return employerCode.description;
                  })}
                </Typography>
              </ListItem>
            ))}
          </List>
        </Grid>
        {detailsDialogRequestUser.fundingAgencies && detailsDialogRequestUser.fundingAgencies.length > 0 && (
          <>
            <Grid>
              <Typography fontWeight="bold">Funding Agencies:</Typography>
            </Grid>
            <Grid>
              <List dense>
                {detailsDialogRequestUser.fundingAgencies.split(',').map((agency) => (
                  <ListItem key={agency}>
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
        {detailsDialogRequestUser.requestedRoles && detailsDialogRequestUser.requestedRoles.length > 0 && (
          <>
            <Grid>
              <Typography fontWeight="bold">Requested Roles:</Typography>
            </Grid>
            <Grid>
              <List dense>
                {detailsDialogRequestUser.requestedRoles.split(',').map((role) => (
                  <ListItem key={role}>
                    <Typography>
                      {availableRoles.map((roleCode) => {
                        if (roleCode.name === role) {
                          return roleCode.description;
                        }
                      })}
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
        <Button variant="contained" onClick={closeRequestDetailsDialog} autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccessRequestModal;
