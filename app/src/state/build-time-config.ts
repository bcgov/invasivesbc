/* These definitions are known at build-time, and may result in smaller builds by allowing tree shaking to discard code */

import { useEffect, useState } from 'react';

const MOBILE = import.meta.env.VITE_MOBILE && import.meta.env.VITE_MOBILE.toLowerCase() === 'true';

const DEBUG = import.meta.env.VITE_DEBUG && import.meta.env.VITE_DEBUG.toLowerCase() === 'true';

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
  }, [PLATFORM]);

  return appClasses;
};

/* Used to disable certain memory-intensive features on small devices */
const MEMORY_CONSTRAINED_DEVICE = (() => {
  if (PLATFORM == Platform.ANDROID) {
    //@todo actually detect the amount of memory available via capacitor native call (navigator.deviceMemory does not appear to be supported)
    console.warn('running on android - disabling memory-intensive features');
    return true;
  }

  return false;
})();

export { DEBUG, MOBILE, PLATFORM, MEMORY_CONSTRAINED_DEVICE, Platform, usePlatformClasses };
