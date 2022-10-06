import { DeviceInfo } from '@capacitor/device';
import { IonReactRouter } from '@ionic/react-router';
import Box from '@mui/material/Box';
import { ErrorContextProvider } from 'contexts/ErrorContext';
import React, { useEffect } from 'react';
import AppRouter from './AppRouter';
import { DatabaseContextProvider } from './contexts/DatabaseContext';
import { Provider, useDispatch } from 'react-redux';
import { ACTIVITY_GET_INITIAL_STATE_REQUEST, USER_SETTINGS_GET_INITIAL_STATE_REQUEST } from 'state/actions';

interface IAppProps {
  deviceInfo: DeviceInfo;
  store: any;
}

const App: React.FC<IAppProps> = ({ deviceInfo, store }) => {
  const appRouterProps = {
    deviceInfo
  };


  // top level-ish component to handle some stuff on app start up
  const ProviderChildren = (props) => 
  {
    const dispatch = useDispatch();


    useEffect(()=> {
    },[])

      return (
        <>
        {props.children}
      </>)
    }

  return (
    <Box height="100vh" width="100vw" display="flex" overflow="hidden">
      <Provider store={store}>
        <ProviderChildren>
          <ErrorContextProvider>
            <DatabaseContextProvider>
              <IonReactRouter>
                <AppRouter {...appRouterProps} />
              </IonReactRouter>
            </DatabaseContextProvider>
          </ErrorContextProvider>
      </ProviderChildren>
      </Provider>
    </Box>
  );
};

export default App;
