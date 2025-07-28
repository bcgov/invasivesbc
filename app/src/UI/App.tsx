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
import { PluginListenerHandle } from '@capacitor/core';
import { Platform, buildTimeConfig } from 'state/configuration/build-time-config';
export const RENDER_DEBUG = false;

export type LayoutComponent = 'overlay-layout' | 'wide-layout';

const App = () => {
  const authInitiated = useSelector((state) => state.Auth.initialized);

  const { detail: errorDetail, hasCrashed } = useSelector(selectGlobalErrorState);
  const { disrupted } = useSelector(selectAuth);

  const selectedLayout = useSelector((state) => state.AppMode.layout.layout);

  const [LazyLoadedLayout, setLazyLoadedLayout] = useState<LazyExoticComponent<typeof WideLayout | typeof Overlay>>();

  const platformClasses = usePlatformClasses();

  const clamp = (value: number, max: number) => Math.min(value, max);

  useEffect(() => {
    if (buildTimeConfig.PLATFORM !== Platform.ANDROID) return;
    const isSmallScreen = window.innerWidth <= 800 && window.innerHeight <= 960; // small to medium sized phones

    const applyInsets = (insets: { top: number; bottom: number }) => {
      const appElement = document.getElementById('app');
      if (!appElement?.classList.contains('android')) return;

      const top = isSmallScreen ? clamp(insets.top, 24) : insets.top;
      const bottom = isSmallScreen ? clamp(insets.bottom, 16) : insets.bottom;
      if (appElement?.classList.contains('android')) {
        appElement.style.setProperty('--extra-top-padding', `${top}px`);
        appElement.style.setProperty('--extra-bottom-padding', `${bottom}px`);
      }
    };

    // set initial insets
    SafeInsets.getSafeAreaInsets({}).then(applyInsets).catch(console.error);

    // listen for insets changes
    let listener: PluginListenerHandle;
    SafeInsets.addListener('insetsChanged', applyInsets).then((handle) => {
      listener = handle;
    });
    return () => {
      if (listener) listener.remove();
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
