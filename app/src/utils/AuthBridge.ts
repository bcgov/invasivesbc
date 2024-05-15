import { registerPlugin } from '@capacitor/core';

interface AuthBridgePlugin {
  authStart(options: { value: string }): Promise<{ value: string }>;

  token(options: {}): Promise<{ error?: string; accessToken?: string }>;

  authStatus(options: {}): Promise<{ error?: string; authorized?: boolean }>;
}

const AuthBridge = registerPlugin<AuthBridgePlugin>('AuthBridge');

export default AuthBridge;
