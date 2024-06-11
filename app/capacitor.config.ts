import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'bc.gov.invasivesbc',
  appName: 'InvasivesBC',
  webDir: 'dist',
  server: {
    hostname: 'localhost',
    iosScheme: 'invasivesbc'
  },
  loggingBehavior: 'debug',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    },
    CapacitorCookies: {
      enabled: false
    },
    CapacitorHttp: {
      enabled: false
    }
  }
};

export default config;
