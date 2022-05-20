import {DeviceInfo} from '@capacitor/device';
import {IonReactRouter} from '@ionic/react-router';
import Box from '@mui/material/Box';
import {ErrorContextProvider} from 'contexts/ErrorContext';
import {NetworkContextProvider} from 'contexts/NetworkContext';
import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';
import AppRouter from './AppRouter';
import {DatabaseContextProvider} from './contexts/DatabaseContext';
import CustomThemeProvider from './utils/CustomThemeProvider';
import {Provider} from "react-redux";
import {selectConfiguration} from "./state/reducers/configuration";
import {useSelector} from "./state/utilities/use_selector";

interface IAppProps {
  deviceInfo: DeviceInfo;
  store: any;
}

const App: React.FC<IAppProps> = ({deviceInfo, store}) => {

  const appRouterProps = {
    deviceInfo
  };

  const {DEBUG} = useSelector(selectConfiguration);

  const DebugRouter = ({children}: { children: any }) => {
    const {location} = useHistory();
    if (DEBUG) {
      console.log(`Route: ${location.pathname}${location.search}, State: ${JSON.stringify(location.state)}`);
    }
    return children;
  };

  return (
    <Box height="100vh" width="100vw" display="flex" overflow="hidden" justifyContent="center" alignContent="center">
      {deviceInfo !== null ? (
        <Provider store={store}>
          <ErrorContextProvider>
            <NetworkContextProvider>
              <DatabaseContextProvider>
                <CustomThemeProvider>
                  <IonReactRouter>
                    <DebugRouter>
                      <AppRouter {...appRouterProps} />
                    </DebugRouter>
                  </IonReactRouter>
                </CustomThemeProvider>
              </DatabaseContextProvider>
            </NetworkContextProvider>
          </ErrorContextProvider>
        </Provider>
      ) : (
        <></>
      )}
    </Box>
  );
};

export default App;
