import React from 'react';
import './App.css';
import { selectGlobalErrorState } from 'state/reducers/error_handler';
import { ErrorHandler } from 'UI/Layout/ErrorHandler/ErrorHandler';
import { ConnectivityErrorHandler } from 'UI/Layout/ErrorHandler/ConnectivityErrorHandler';
import { selectAuth } from 'state/reducers/auth';
import { useSelector } from 'utils/use_selector';
import { usePlatformClasses } from 'state/configuration/build-time-config';
import { WideLayout } from 'UI/Layout/WideLayout/WideLayout';
import Overlay from 'UI/Layout/OverlayLayout/Overlay';

export const RENDER_DEBUG = false;

const App = () => {
  const authInitiated = useSelector((state) => state.Auth.initialized);

  const { detail: errorDetail, hasCrashed } = useSelector(selectGlobalErrorState);
  const { disrupted } = useSelector(selectAuth);

  const platformClasses = usePlatformClasses();

  if (!authInitiated) return <div id="app-pre-auth-init" />;

  if (disrupted) {
    return <ConnectivityErrorHandler />;
  }

  if (hasCrashed) {
    return <ErrorHandler detail={errorDetail} />;
  }

  return (
    <div id="app" className={platformClasses}>
      {/*<Overlay />*/}
      <WideLayout />
    </div>
  );
};

export default App;
