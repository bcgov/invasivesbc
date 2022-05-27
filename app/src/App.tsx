import {DeviceInfo} from '@capacitor/device';
import {IonReactRouter} from '@ionic/react-router';
import Box from '@mui/material/Box';
import {ErrorContextProvider} from 'contexts/ErrorContext';
import {NetworkContextProvider} from 'contexts/NetworkContext';
import React from 'react';
import AppRouter from './AppRouter';
import {DatabaseContextProvider} from './contexts/DatabaseContext';
import CustomThemeProvider from './utils/CustomThemeProvider';
import {Provider} from 'react-redux';

interface IAppProps {
  deviceInfo: DeviceInfo;
  store: any;
}

const App: React.FC<IAppProps> = ({deviceInfo, store}) => {

  const appRouterProps = {
    deviceInfo
  };

  return (
    <Box height="100vh" width="100vw" display="flex" overflow="hidden">
      <Provider store={store}>
          <ErrorContextProvider>
            <NetworkContextProvider>
              <DatabaseContextProvider>
                <CustomThemeProvider>
                  <IonReactRouter>
                    <AppRouter {...appRouterProps} />
                  </IonReactRouter>
                </CustomThemeProvider>
              </DatabaseContextProvider>
            </NetworkContextProvider>
          </ErrorContextProvider>
      </Provider>
    </Box>
  );
};

export default App;
