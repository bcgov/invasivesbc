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
import SafeInsets from 'utils/android-safe-area/safeArea';

export const RENDER_DEBUG = false;

export type LayoutComponent = 'overlay-layout' | 'wide-layout';

const App = () => {
  const authInitiated = useSelector((state) => state.Auth.initialized);

  const { detail: errorDetail, hasCrashed } = useSelector(selectGlobalErrorState);
  const { disrupted } = useSelector(selectAuth);

  const selectedLayout = useSelector((state) => state.AppMode.layout.layout);

  const [LazyLoadedLayout, setLazyLoadedLayout] = useState<LazyExoticComponent<typeof WideLayout | typeof Overlay>>();

  const platformClasses = usePlatformClasses();

  const [insets, setInsets] = useState({ top: 0, bottom: 0, left: 0, right: 0 });

  useEffect(() => {
    SafeInsets.getAllInsets({})
      .then((insets) => {
        setInsets(insets);
        console.log('----Safe Area insets----\n', JSON.stringify(insets, null, 2), platformClasses);
      })
      .catch(console.error);

    let listener;

    const setupListener = async () => {
      listener = await SafeInsets.addListener('insetsChanged', (insets) => {
        setInsets(insets);
        console.log('----Safe Dynamic Area insets----\n', JSON.stringify(insets, null, 2), platformClasses);
      });
    };

    setupListener();

    return () => {
      if (listener && typeof listener.remove === 'function') {
        listener.remove();
      }
    };
  }, []);

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
