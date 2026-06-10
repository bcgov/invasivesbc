import { StartupCoordinator } from 'UI/StartupCoordinator/StartupCoordinator';

import 'temporal-polyfill/global'; //@todo some day, this will not be required https://caniuse.com/temporal

StartupCoordinator().then(() => {});
