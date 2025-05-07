import { registerPlugin } from '@capacitor/core';

interface DeviceMemoryInformation {
  availableBytes: number;
  totalBytes: number;
  lowMemoryCondition: boolean;
  largeMemoryClass: number;
  VMFree: number;
  VMMax: number;
}

interface DeviceInformationPlugin {
  deviceCharacteristics(options: Record<string, never>): Promise<DeviceMemoryInformation>;
}

const DeviceInformation = registerPlugin<DeviceInformationPlugin>('DeviceInformation');

export default DeviceInformation;
export type { DeviceMemoryInformation };
