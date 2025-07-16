import { Capacitor, registerPlugin } from '@capacitor/core';

interface SafeInsetsInfo {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface SafeInsetsPlugin {
  getAllInsets(options: Record<string, never>): Promise<SafeInsetsInfo>;
  addListener(eventName: 'insetsChanged', listenerFunc: (info: SafeInsetsInfo) => void): Promise<void>;
}

const SafeInsets = registerPlugin<SafeInsetsPlugin>('SafeInsets');

if (Capacitor.getPlatform() === 'android') {
  document.documentElement.classList.add('android');

  SafeInsets.addListener('insetsChanged', (insets) => {
    const appElement = document.getElementById('app');
    console.log('--->>1', insets, appElement?.classList.toString(), insets.bottom);
    if (appElement?.classList.contains('android')) {
      appElement.style.setProperty('--extra-top-padding', `${insets.top}px`);
      appElement.style.setProperty('--extra-bottom-padding', `${insets.bottom}px`);
      // appElement.style.setProperty('--record-table-footer-height', `${insets.bottom}px !important`);
    }

    // document.documentElement.style.setProperty('--extra-top-padding', `${insets.top}px`);
    // document.documentElement.style.setProperty('--extra-bottom-padding', `${insets.bottom}px`);
  });

  SafeInsets.getAllInsets({}).then((insets) => {
    const appElement = document.getElementById('app');
    console.log('--->>2', insets, appElement?.classList.toString(), insets.bottom);
    if (appElement?.classList.contains('android')) {
      appElement.style.setProperty('--extra-top-padding', `${insets.top}px`);
      appElement.style.setProperty('--extra-bottom-padding', `${insets.bottom}px`);
      // appElement.style.setProperty('--record-table-footer-height', `${insets.bottom}px !important`);
    }
    // document.documentElement.style.setProperty('--extra-top-padding', `${insets.top}px`);
    // document.documentElement.style.setProperty('--extra-bottom-padding', `${insets.bottom}px`);
  });
}

export default SafeInsets;
export type { SafeInsetsInfo };
