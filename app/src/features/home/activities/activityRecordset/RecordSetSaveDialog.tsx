import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import React, { useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';

interface IRecordSetSaveDialog {
  isOpen: boolean;
  isLoading: boolean;
  handleDisagree: Function;
  handleAgree: Function;
  recordSets: any;
}

const RecordSetSaveDialog: React.FC<IRecordSetSaveDialog> = (props) => {
  const { isOpen, handleAgree, handleDisagree, recordSets, isLoading } = props;

  const numRecords = recordSets.reduce((acc: number, curr: number) => acc + curr.activities.count, 0);
  console.log('Total records:' + numRecords);

  useEffect(() => {
    if (isLoading) {
      // Set a 3 second timeout
      const timer = setTimeout(() => {}, 3000);
    }
  }, [isLoading]);

  // User sees how many records in IAPP sets as well
  // User sees total area on map for layers cached
  return (
    <Dialog
      open={isOpen}
      onClose={() => handleDisagree()}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description">
      {isLoading ? (
        <CircularProgress />
      ) : (
        <div>
          <DialogTitle id="alert-dialog-title">
            <Typography variant="h4">Cache Record Sets</Typography>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              You are about to save the following records for offline use:
            </DialogContentText>
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
            <DialogContentText id="alert-dialog-confirmation">
              Are you sure you want to cache these record sets?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                handleDisagree();
              }}
              color="inherit"
              variant="outlined"
              autoFocus>
              No
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                handleAgree();
              }}>
              Yes
            </Button>
          </DialogActions>
        </div>
      )}
    </Dialog>
  );
};

export default RecordSetSaveDialog;
