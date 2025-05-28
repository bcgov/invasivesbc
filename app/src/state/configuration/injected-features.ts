interface InjectedFeatures {
  COMPONENTIZED_MAP: boolean;
}

/* global CONFIGURATION_SOURCE */
declare global {
  const CONFIGURATION_COMPONENTIZED_MAP: string | undefined;
}

let injectedFeatures: InjectedFeatures = {
  COMPONENTIZED_MAP: false
}

switch (CONFIGURATION_SOURCE) {
  case 'Provided':
    injectedFeatures = {
      COMPONENTIZED_MAP: (CONFIGURATION_COMPONENTIZED_MAP && CONFIGURATION_COMPONENTIZED_MAP.toLowerCase() == 'true') || false
    };
    break;
  case 'Caddy':
    injectedFeatures = {
      COMPONENTIZED_MAP: '{{env "FEATURE_GATE_COMPONENTIZED_MAP_ENABLED"}}'.toLowerCase() === 'true'
    };
    break;
  default:
    break;
}

export { injectedFeatures };
export type { InjectedFeatures };
