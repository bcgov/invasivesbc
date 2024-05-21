import { registerPlugin } from '@capacitor/core';

interface AuthBridgePlugin {
  authStart(options: {}): Promise<{ error?: string; idToken?: string; accessToken?: string; authorized?: boolean }>;

  logout(options: {}): Promise<{ error?: string }>;

  token(options: {}): Promise<{ error?: string; idToken?: string; accessToken?: string }>;

  authStatus(options: {}): Promise<{ error?: string; authorized?: boolean }>;
}

const AuthBridge = registerPlugin<AuthBridgePlugin>('AuthBridge');

export default AuthBridge;
