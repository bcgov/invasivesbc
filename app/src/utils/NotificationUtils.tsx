import { DatabaseContext, IDatabaseContext } from "contexts/DatabaseContext";
import { useContext } from "react";
import { v4 as uuidv4 } from 'uuid';

export const notifyError = async (databaseContext: IDatabaseContext<any>, message: string) => {
  await databaseContext.database.put({
    _id: uuidv4(),
    docType: "notification",
    notificationType: "error",
    text: message,
    acknowledged: false,
    dateCreated: new Date()
  });
  console.log('added a new error')
}

export const notifySuccess = async (databaseContext: IDatabaseContext<any>, message: string) => {
  await databaseContext.database.put({
    _id: uuidv4(),
    docType: "notification",
    notificationType: "success",
    text: message,
    acknowledged: false,
    dateCreated: new Date()
  });
  console.log('added a new error')
}

export const notifyWarning = async (databaseContext: IDatabaseContext<any>, message: string) => {
  await databaseContext.database.put({
    _id: uuidv4(),
    docType: "notification",
    notificationType: "warning",
    text: message,
    acknowledged: false,
    dateCreated: new Date()
  });
  console.log('added a new error')
}
// just for testing
export const triggerError = async (databaseContext: IDatabaseContext<any>) => {
  try {
    throw Error("crash the app!")
  } catch (error) {
    notifyError(databaseContext, "oh no")
  }
}

