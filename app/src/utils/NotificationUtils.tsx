import { IDatabaseContext } from 'contexts/DatabaseContext';
import { v4 as uuidv4 } from 'uuid';

export const addNewError = async (databaseContext: IDatabaseContext<any>) => {
  await databaseContext.database.put({
    _id: uuidv4(),
    docType: 'error',
    errorText: 'Some error text',
    errorAcknowledged: false,
    dateCreated: new Date()
  });
  console.log('added a new error');
};

export const triggerError = async (databaseContext: IDatabaseContext<any>) => {
  try {
    throw Error('crash the app!');
  } catch (error) {
    addNewError(databaseContext);
  }
};
