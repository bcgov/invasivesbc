import { DeviceInfo } from '@capacitor/device';
import { IonReactRouter } from '@ionic/react-router';
import Box from '@mui/material/Box';
import { ErrorContextProvider } from 'contexts/ErrorContext';
import React from 'react';
import AppRouter from './AppRouter';
import { DatabaseContextProvider } from './contexts/DatabaseContext';
import CustomThemeProvider from './utils/CustomThemeProvider';
import { Provider } from 'react-redux';
import { CssBaseline } from '@mui/material';
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
      <CssBaseline />
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
