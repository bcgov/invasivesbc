import { GeneralDialog } from 'components/dialog/GeneralDialog';
import * as React from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUserSettings } from 'state/reducers/userSettings';

export interface IErrorBanner {
  message: string;
  code: number;
  namespace: string;
}

export interface IErrorState {
  hasErrors: boolean;
  numErrors: number;
  errorArray: IErrorBanner[];
  pushError: (error: IErrorBanner) => void;
  clearError: (error: IErrorBanner) => void;
  clearAllErrors: () => void;
}

export const ErrorContext = React.createContext<IErrorState>({
  hasErrors: false,
  numErrors: 0,
  errorArray: [],
  pushError: () => {},
  clearError: () => {},
  clearAllErrors: () => {}
});

export const ErrorContextProvider: React.FC<any> = (props: any) => {
  const [errorArray, setErrorArray] = useState<IErrorBanner[]>([]);
  const [hasErrors, setHasErrors] = useState(false);
  const [numErrors, setNumErrors] = useState(0);
  const userSettingsState = useSelector(selectUserSettings);

  const pushError = (error: IErrorBanner) => {
    // Check if error already exists in errorArray
    const errorExists = errorArray.some((e) => JSON.stringify(e) === JSON.stringify(error));
    if (!errorExists) {
      setHasErrors(true);
      setNumErrors(numErrors + 1);
      setErrorArray([...errorArray, error]);
    }
  };

  const clearError = (error: IErrorBanner) => {
    setErrorArray(errorArray.filter((e) => JSON.stringify(e) !== JSON.stringify(error)));
    setNumErrors(numErrors - 1);
    if (numErrors === 0) {
      setHasErrors(false);
    }
  };

  const clearAllErrors = () => {
    if (hasErrors) {
      setErrorArray([]);
      setNumErrors(0);
      setHasErrors(false);
    }
  };

  return (
    <>
      {
        <ErrorContext.Provider
          value={{
            hasErrors,
            numErrors,
            errorArray,
            pushError,
            clearError,
            clearAllErrors
          }}>
          {props.children}
        </ErrorContext.Provider>
      }
      <GeneralDialog
        dialogOpen={userSettingsState?.APIErrorDialog?.dialogOpen}
        dialogTitle={userSettingsState?.APIErrorDialog?.dialogTitle}
        dialogActions={userSettingsState?.APIErrorDialog?.dialogActions}
        dialogContentText={userSettingsState?.APIErrorDialog?.dialogContentText}>
      </GeneralDialog>
    </>
  );
};
