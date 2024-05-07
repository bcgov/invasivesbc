import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'bc.gov.invasivesbc',
  appName: 'InvasivesBC',
  webDir: 'dist',
  server: {
    hostname: 'localhost',
    iosScheme: 'invasivesbc'
  },
  cordova: {
    accessOrigins: [
      'https://loginproxy.gov.bc.ca/*',
    ]
  },
  loggingBehavior: 'debug',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    },
    CapacitorCookies: {
      // native apis
      enabled: true
    },
    CapacitorHttp: {
      // disable CORS, use native APIs
      enabled: true
    }
  }
};

export default config;
