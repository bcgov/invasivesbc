import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid } from '@mui/material';
import React from 'react';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import { Capacitor } from '@capacitor/core';

interface IRecordSetDeleteDialog {
  isOpen: boolean;
  isLoading: boolean;
  platform: 'mobile' | 'web';
  handleClose: Function;
  handleFilterSetDelete: Function;
  handleCachedActivityDelete: Function;
  recordSets: any;
}

const RecordSetDeleteDialog: React.FC<IRecordSetDeleteDialog> = (props) => {
  const { isOpen, handleClose, handleFilterSetDelete, handleCachedActivityDelete, recordSets, isLoading } = props;

  return (
    <Dialog
      open={isOpen}
      onClose={() => handleClose()}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description">
      {isLoading ? (
        <CircularProgress />
      ) : (
        <div>
          <DialogTitle id="alert-dialog-title">
            <Typography variant="h4">Delete Record Sets</Typography>
          </DialogTitle>
          <Divider />
          <DialogContent>
            {props.platform === 'mobile' ? (
              <DialogContentText id="alert-dialog-description">
                You are about to delete the following record sets or cached activities. This action cannot be undone.
                Either delete the cached records on this device attributed to the set of filters, or simply delete the
                set of filters. Activities saved to the database will not be lost but will be unavailable for offline
                use.
              </DialogContentText>
            ) : (
              <DialogContentText id="alert-dialog-description">
                The following record sets will be deleted. The activities in this record set will remain saved, but the
                filters that define the record set will be gone. This action cannot be undone.
              </DialogContentText>
            )}

            {recordSets.map((recordSet) => {
              return (
                <div key={recordSet.recordSetName}>
                  <li>
                    <strong>{recordSet.recordSetName}</strong>: {recordSet.activities.count}{' '}
                    {recordSet.activities.count === 1 ? 'activity' : 'activities'}
                  </li>
                </div>
              );
            })}
            <br />
            <Divider />
            <br />
            {props.platform === 'mobile' ? (
              <DialogContentText id="alert-dialog-confirmation">
                Do you want to delete these filter sets or delete the cached activities determined by the filter sets?
              </DialogContentText>
            ) : (
              <DialogContentText id="alert-dialog-confirmation">
                Do you want to delete these record sets?
              </DialogContentText>
            )}
          </DialogContent>
          <DialogActions>
            <Grid container spacing={2} justifyContent={'space-between'}>
              <Grid item>
                <Button
                  onClick={() => {
                    handleClose();
                  }}
                  color="inherit"
                  variant="outlined"
                  autoFocus>
                  Cancel
                </Button>
              </Grid>
              <Grid item spacing={2}>
                <Button
                  onClick={() => {
                    handleFilterSetDelete();
                  }}
                  color="warning"
                  variant="contained"
                  autoFocus>
                  Delete Filters
                </Button>
                {props.platform === 'mobile' && (
                  <Button
                    style={{ marginLeft: '10px' }}
                    variant="contained"
                    color="error"
                    onClick={() => {
                      handleCachedActivityDelete();
                    }}>
                    Delete Cached Records
                  </Button>
                )}
              </Grid>
            </Grid>
          </DialogActions>
        </div>
      )}
    </Dialog>
  );
};

export default RecordSetDeleteDialog;
