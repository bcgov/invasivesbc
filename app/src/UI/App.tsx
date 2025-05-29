import React, { Suspense, useRef } from 'react';
import './App.css';
import { selectGlobalErrorState } from 'state/reducers/error_handler';
import { ErrorHandler } from 'UI/Layout/ErrorHandler/ErrorHandler';
import { ConnectivityErrorHandler } from 'UI/Layout/ErrorHandler/ConnectivityErrorHandler';
import { selectAuth } from 'state/reducers/auth';
import { useSelector } from 'utils/use_selector';
import Spinner from 'UI/Reusable/Spinner/Spinner';
import { usePlatformClasses } from 'state/configuration/build-time-config';

const ComponentizedMapLayout = React.lazy(() => import('UI/Layout/AppLayout/ComponentizedMapLayout'));
const LegacyMapLayout = React.lazy(() => import('UI/Layout/AppLayout/LegacyMapLayout'));

export const RENDER_DEBUG = false;

const App = () => {
  const authInitiated = useSelector((state) => state.Auth.initialized);
  const COMPONENTIZED_MAP = useSelector((state) => state.Configuration.current.features.MAP_MODE_COMPONENTIZED.enabled);

  const { detail: errorDetail, hasCrashed } = useSelector(selectGlobalErrorState);
  const { disrupted } = useSelector(selectAuth);
  const ref = useRef(0);

  const platformClasses = usePlatformClasses();

  ref.current += 1;
  if (RENDER_DEBUG) {
    console.log('%cApp.tsx render:' + ref.current.toString(), 'color: yellow');
  }

  if (!authInitiated) return <div id="app-pre-auth-init" />;

  if (disrupted) {
    return <ConnectivityErrorHandler />;
  }

  if (hasCrashed) {
    return <ErrorHandler detail={errorDetail} />;
  }

  if (COMPONENTIZED_MAP) {
    return (
      <div id="app" className={platformClasses}>
        <Suspense fallback={<Spinner />}>
          <ComponentizedMapLayout />
        </Suspense>
      </div>
    );
  } else {
    return (
      <div id="app" className={platformClasses}>
        <Suspense fallback={<Spinner />}>
          <LegacyMapLayout />
        </Suspense>
      </div>
    );
  }
};

export default App;
