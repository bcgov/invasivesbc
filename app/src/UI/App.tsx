import React, { LazyExoticComponent, Suspense, useEffect, useState } from 'react';
import './App.css';
import { selectGlobalErrorState } from 'state/reducers/error_handler';
import { ErrorHandler } from 'UI/Layout/ErrorHandler/ErrorHandler';
import { ConnectivityErrorHandler } from 'UI/Layout/ErrorHandler/ConnectivityErrorHandler';
import { selectAuth } from 'state/reducers/auth';
import { useSelector } from 'utils/use_selector';
import { usePlatformClasses } from 'state/configuration/build-time-config';
import WideLayout from 'UI/Layout/WideLayout/WideLayout';
import Overlay from 'UI/Layout/OverlayLayout/Overlay';

export const RENDER_DEBUG = false;

export type LayoutComponent = 'overlay-layout' | 'wide-layout';

const App = () => {
  const authInitiated = useSelector((state) => state.Auth.initialized);

  const { detail: errorDetail, hasCrashed } = useSelector(selectGlobalErrorState);
  const { disrupted } = useSelector(selectAuth);

  const selectedLayout = useSelector((state) => state.AppMode.layout.layout);

  const [LazyLoadedLayout, setLazyLoadedLayout] = useState<LazyExoticComponent<typeof WideLayout | typeof Overlay>>();

  const platformClasses = usePlatformClasses();

  useEffect(() => {
    switch (selectedLayout) {
      case 'wide-layout':
        setLazyLoadedLayout(React.lazy(() => import('UI/Layout/WideLayout/WideLayout')));
        break;
      case 'overlay-layout':
      default:
        setLazyLoadedLayout(React.lazy(() => import('UI/Layout/OverlayLayout/Overlay')));
        break;
    }
  }, [selectedLayout]);

  if (!authInitiated) return <div id="app-pre-auth-init" />;

  if (disrupted) {
    return <ConnectivityErrorHandler />;
  }

  if (hasCrashed) {
    return <ErrorHandler detail={errorDetail} />;
  }

  if (!LazyLoadedLayout) {
    return <div>Loading...</div>;
  }

  return (
    <div id="app" className={`${platformClasses} ${selectedLayout}`}>
      <div id="safe-inset">
        <Suspense fallback={<div>Loading...</div>}>
          <LazyLoadedLayout />
        </Suspense>
      </div>
    </div>
  );
};

export default App;
