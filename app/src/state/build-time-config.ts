/* These definitions are known at build-time, and may result in smaller builds by allowing tree shaking to discard code */

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

export { DEBUG, MOBILE, PLATFORM, Platform };
