import { Button, Tooltip } from '@material-ui/core';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext } from 'react';
import WarningIcon from '@material-ui/icons/Warning';
interface IManageDatabaseComponentProps {
  classes?: any;
}

const ManageDatabaseComponent: React.FC<IManageDatabaseComponentProps> = (props) => {
  const databaseContext = useContext(DatabaseContext);

  const resetDatabase = async () => {
    await databaseContext.resetDatabase();
  };

  return (
    <Tooltip
      title="Warning!  This will wipe any local data on your device.  Make sure you have synched your work."
      arrow>
      <Button variant="contained" color="secondary" startIcon={<WarningIcon />} onClick={() => resetDatabase()}>
        Wipe Local Data
      </Button>
    </Tooltip>
  );
};

export default ManageDatabaseComponent;
