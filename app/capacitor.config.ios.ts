import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'bc.gov.invasivesbc',
  appName: 'InvasivesBC',
  webDir: 'build',
  server: {
    hostname: 'localhost',
    iosScheme: 'invasivesbc',
  },
  cordova: {
    accessOrigins: ['https://dev.oidc.gov.bc.ca/*']
  },
  loggingBehavior: 'debug',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
