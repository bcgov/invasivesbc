/* These definitions are known at build-time, and may result in smaller builds by allowing tree shaking to discard code */

import { useEffect, useState } from 'react';

const MOBILE: boolean = import.meta.env.VITE_MOBILE && import.meta.env.VITE_MOBILE.toLowerCase() === 'true';

const DEBUG: boolean = import.meta.env.VITE_DEBUG && import.meta.env.VITE_DEBUG.toLowerCase() === 'true';

enum Platform {
  IOS = 'ios',
  ANDROID = 'android',
  WEB = 'web',
  UNKNOWN = 'unknown'
}

const PLATFORM: Platform = (() => {
  switch (import.meta.env.VITE_TARGET_PLATFORM) {
    case 'android':
      return Platform.ANDROID;
    case 'ios':
      return Platform.IOS;
    case 'web':
      return Platform.WEB;
    default:
      return Platform.UNKNOWN;
  }
})();

const usePlatformClasses = () => {
  const [appClasses, setAppclasses] = useState('');

  useEffect(() => {
    const newAppClasses: string[] = ['App'];
    if (MOBILE) {
      newAppClasses.push('is-mobile');
    }

    switch (PLATFORM) {
      case Platform.ANDROID:
        newAppClasses.push('android');
        break;
      case Platform.IOS:
        newAppClasses.push('ios');
        break;
      case Platform.WEB:
      default:
        newAppClasses.push('web');
        break;
    }
    setAppclasses(newAppClasses.join(' '));
  }, []);

  return appClasses;
};

type BuildTimeConfig = {
  MOBILE: boolean;
  DEBUG: boolean;
  PLATFORM: Platform;
};

const buildTimeConfig: BuildTimeConfig = {
  MOBILE: MOBILE,
  DEBUG: DEBUG,
  PLATFORM: PLATFORM
};

export { buildTimeConfig, Platform, usePlatformClasses };
export type { BuildTimeConfig };
