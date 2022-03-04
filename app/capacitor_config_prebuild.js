const fs = require('fs');

const buildTarget = process.argv[2];

switch (buildTarget) {
  case 'android':
    fs.copyFileSync('capacitor.config.android.ts', 'capacitor.config.ts');
    break;
  case 'ios':
    fs.copyFileSync('capacitor.config.ios.ts', 'capacitor.config.ts');
    break;
  default:
    throw new Error('Unknown build target. Not doing anything.');
}

