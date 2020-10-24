import { Button } from '@material-ui/core';
import { DeleteForever } from '@material-ui/icons';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext } from 'react';

interface IManageDatabaseComponentProps {
  classes?: any;
}

const ManageDatabaseComponent: React.FC<IManageDatabaseComponentProps> = (props) => {
  const databaseContext = useContext(DatabaseContext);

  const wipeLocalDatabase = async () => {
    const docs = await databaseContext.database.allDocs();

    if (!docs) {
      return;
    }

    const promises = [];

    docs.rows.map((row) => {
      promises.push(databaseContext.database.remove(row.id, row.value.rev));
    });

    await Promise.all(promises);
  };

  const resetDatabase = async () => {
    await databaseContext.resetDatabase();
  };

  return (
    <div>
      <Button variant="contained" startIcon={<DeleteForever />} onClick={() => resetDatabase()}>
        Wipe Local Data
      </Button>
    </div>
  );
};

export default ManageDatabaseComponent;
