import { PluginListenerHandle, registerPlugin } from '@capacitor/core';

interface SafeInsetsInfo {
  top: number;
  bottom: number;
  left: number;
  right: number;
  imeVisible?: boolean;
}
interface SafeInsetsPlugin {
  getSafeAreaInsets(options: Record<string, never>): Promise<SafeInsetsInfo>;
  addListener(eventName: 'insetsChanged', listenerFunc: (info: SafeInsetsInfo) => void): Promise<PluginListenerHandle>;
}

const SafeInsets = registerPlugin<SafeInsetsPlugin>('SafeInsets');

export default SafeInsets;
export type { SafeInsetsInfo };
