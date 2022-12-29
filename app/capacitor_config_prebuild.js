import {copyFileSync} from "fs";

const buildTarget = process.argv[2];

switch (buildTarget) {
  case 'android':
    copyFileSync('capacitor.config.android.ts', 'capacitor.config.ts');
    break;
  case 'ios':
    copyFileSync('capacitor.config.ios.ts', 'capacitor.config.ts');
    break;
  default:
    throw new Error('Unknown build target. Not doing anything.');
}
