import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'bc.gov.invasivesbc',
  appName: 'InvasivesBC',
  webDir: 'dist',
  server: {
    hostname: 'localhost',
    iosScheme: 'invasivesbc',
  },
  cordova: {
    accessOrigins: [
      'https://dev.loginproxy.gov.bc.ca/*',
    ]
  },
  loggingBehavior: 'debug',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
