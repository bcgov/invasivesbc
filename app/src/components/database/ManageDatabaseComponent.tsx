import { DeleteForever } from '@material-ui/icons';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext } from 'react';
import CommonButton from 'components/common/CommonButton';

interface IManageDatabaseComponentProps {
  classes?: any;
}

const ManageDatabaseComponent: React.FC<IManageDatabaseComponentProps> = (props) => {
  const databaseContext = useContext(DatabaseContext);

  const resetDatabase = async () => {
    await databaseContext.resetDatabase();
  };

  return (
    <CommonButton
      variant="contained"
      icon={<DeleteForever />}
      onButtonClick={() => resetDatabase()}
      label="Wipe Local Data"
    />
  );
};

export default ManageDatabaseComponent;
