import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'bc.gov.invasivesbc',
  appName: 'InvasivesBC',
  webDir: 'build',
  server: {
    //hostname: 'localhost',
    hostname: 'invasivesbc_app.apps.silver.devops.gov.bc.ca',
    iosScheme: 'invasivesbc',
    androidScheme: 'https'
  },
  cordova: {
    accessOrigins: ['https://dev.oidc.gov.bc.ca/*']
  },
  android: {
    allowMixedContent: true,
    includePlugins: [
      '@capacitor-community/http',
      '@capacitor-community/sqlite',
      '@capacitor/app',
      '@capacitor/camera',
      '@capacitor/device',
      '@capacitor/geolocation',
      '@capacitor/haptics',
      '@capacitor/keyboard',
      '@capacitor/network',
      '@capacitor/status-bar',
      'cordova-sqlite-storage'
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
