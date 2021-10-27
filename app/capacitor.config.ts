import { CapacitorConfig } from '@capacitor/cli';
 
const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'InvasivesBC',
  webDir: 'build',
  npmClient: "npm",
  loggingBehavior?: 'none' ,
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    }
  },
};
 
export default config;
