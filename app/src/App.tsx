import { DeviceInfo } from '@capacitor/device';
import { IonReactRouter } from '@ionic/react-router';
import Box from '@mui/material/Box';
import { ErrorContextProvider } from 'contexts/ErrorContext';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import AppRouter from './AppRouter';
import { DatabaseContextProvider } from './contexts/DatabaseContext';
import CustomThemeProvider from './utils/CustomThemeProvider';
import { Provider, useDispatch } from "react-redux";
import { select } from "redux-saga/effects";
import { selectAuth } from "./state/reducers/auth";
import { useSelector } from "./state/utilities/use_selector";
import { init } from "cjs-module-lexer";
import { AUTH_INITIALIZE_REQUEST } from "./state/actions";

interface IAppProps {
  deviceInfo: DeviceInfo;
  store: any;
}

const App: React.FC<IAppProps> = ({ deviceInfo, store }) => {

  const appRouterProps = {
    deviceInfo
  };

  return (
    <Box height="100vh" width="100vw" display="flex" overflow="hidden">
      <Provider store={store}>
        <ErrorContextProvider>
          <DatabaseContextProvider>
            <CustomThemeProvider>
              <IonReactRouter>
                <AppRouter {...appRouterProps} />
              </IonReactRouter>
            </CustomThemeProvider>
          </DatabaseContextProvider>
        </ErrorContextProvider>
      </Provider>
    </Box>
  );
};

export default App;
