/* These definitions are known at build-time, and may result in smaller builds by allowing tree shaking to discard code */

const MOBILE = import.meta.env.VITE_MOBILE && import.meta.env.VITE_MOBILE.toLowerCase() === 'true';

const DEBUG = import.meta.env.VITE_DEBUG && import.meta.env.VITE_DEBUG.toLowerCase() === 'true';


enum MOBILE_PLATFORM_TYPE {
  IOS = 'ios',
  ANDROID = 'android',
  WEB = 'web',
  UNKNOWN = 'unknown'
}

const MOBILE_PLATFORM: MOBILE_PLATFORM_TYPE = (() => {
    switch (import.meta.env.VITE_TARGET_PLATFORM) {
      case 'android':
        return MOBILE_PLATFORM_TYPE.ANDROID;
      case 'ios':
        return MOBILE_PLATFORM_TYPE.IOS;
      case 'web':
        return MOBILE_PLATFORM_TYPE.WEB;
      default:
        return MOBILE_PLATFORM_TYPE.UNKNOWN;

    }
  }
)
();


export { DEBUG, MOBILE, MOBILE_PLATFORM, MOBILE_PLATFORM_TYPE };
