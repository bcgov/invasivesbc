import { Capacitor } from '@capacitor/core';

export const useNetworkInformation = () => {
  const isMobile = () => {
    return Capacitor.getPlatform() !== 'web';
  };

  return {
    isMobile
  };
};
