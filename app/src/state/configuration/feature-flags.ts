import { AppConfig } from './runtime-config';
import { BuildTimeConfig, Platform } from './build-time-config';
import DeviceInformation from 'utils/memory-report/memoryReport';

class FeatureFlag {
  name: string;
  enabled: boolean;

  constructor(name: string, enabled: boolean) {
    this.name = name;
    this.enabled = enabled;
  }
}

/* IMPORTANT: not all of these are actually implemented (as in, actually turning off the relevant feature) yet */

const BASELINE_FEATURES = {
  BATCH: new FeatureFlag('BATCH', true),
  EMBEDDED_REPORTS: new FeatureFlag('EMBEDDED_REPORTS', true),
  TRAINING_PAGE: new FeatureFlag('TRAINING_PAGE', true),

  MAP: new FeatureFlag('MAP', true),

  MAP_MODE_COMPONENTIZED: new FeatureFlag('MAP_MODE_COMPONENTIZED', false),
  MAP_MODE_LEGACY: new FeatureFlag('MAP_MODE_LEGACY', true),

  MAP_BAKED_RASTER_TILES: new FeatureFlag('MAP_BAKED_RASTER_TILES', true),
  MAP_BAKED_VECTOR_TILES: new FeatureFlag('MAP_BAKED_VECTOR_TILES', true),
  MAP_SIMPLIFIED_BAKED_VECTOR_TILES: new FeatureFlag('MAP_SIMPLIFIED_BAKED_VECTOR_TILES', true),
  MAP_BASE_IMAGERY_LAYER: new FeatureFlag('MAP_BASE_IMAGERY_LAYER', true),
  MAP_TOPO_LAYER: new FeatureFlag('MAP_TOPO_LAYER', true),
  MAP_DATABC_LAYERS: new FeatureFlag('MAP_DATABC_LAYERS', true),
  MAP_DRAW_TOOLS: new FeatureFlag('MAP_DRAW_TOOLS', true),
  MAP_RESTRICT_TILE_CACHE_SIZE: new FeatureFlag('MAP_RESTRICT_TILE_CACHE_SIZE', false),
  MAP_PUBLIC_VECTOR_LAYER: new FeatureFlag('MAP_PUBLIC_VECTOR_LAYER', true),

  CACHE_TILES: new FeatureFlag('CACHE_TILES', true),
  CACHE_RECORDSETS: new FeatureFlag('CACHE_RECORDSETS', true),
  PHOTO_ATTACHMENTS: new FeatureFlag('PHOTO_ATTACHMENTS', true),
  CUSTOM_RECORDSETS: new FeatureFlag('CUSTOM_RECORDSETS', true),
  OFFLINE_SYNC: new FeatureFlag('OFFLINE_SYNC', true),

  DEGRADED_EXPERIENCE_WARNING: new FeatureFlag('DEGRADED_EXPERIENCE_WARNING', false)
};

type FeatureFlags = typeof BASELINE_FEATURES;

async function computeFeatures(buildtimeConfig: BuildTimeConfig, _runtimeConfig: AppConfig): Promise<FeatureFlags> {
  /* This function provides an opportunity to make runtime feature flag adjustments (for example, based on measured device capabilities) */

  const COMPUTED_FEATURES: FeatureFlags = BASELINE_FEATURES;

  /* pick up run-time overrides */
  const { injectedFeatures } = await import('./injected-features');

  // the baseline features are intended for the full experience on web. we can selectively disable based on platform

  if ([Platform.ANDROID].includes(buildtimeConfig.PLATFORM)) {
    COMPUTED_FEATURES.MAP_PUBLIC_VECTOR_LAYER.enabled = false;
    COMPUTED_FEATURES.MAP_RESTRICT_TILE_CACHE_SIZE.enabled = true;

    const { totalBytes, largeMemoryClass } = await DeviceInformation.deviceCharacteristics({});
    const totalMemoryGB = Math.floor(totalBytes / (1024 * 1024 * 1024));
    const lowVMMemory = largeMemoryClass < 256; // MB

    if (totalMemoryGB < 6 || lowVMMemory) {
      console.warn(
        'Device is too small to support the full experience, operating with some features disabled (>=6GB features off)'
      );
      // disable intensive features on all but the most capable hardware
      COMPUTED_FEATURES.MAP_DATABC_LAYERS.enabled = false;
      COMPUTED_FEATURES.MAP_BAKED_RASTER_TILES.enabled = false;
      COMPUTED_FEATURES.DEGRADED_EXPERIENCE_WARNING.enabled = true;
    }
    if (totalMemoryGB < 4 || lowVMMemory) {
      console.warn(
        'Device is too small to support the full experience, operating with some features disabled (>=4GB features off)'
      );
      // many of our users will be using a device of approximately this size
      COMPUTED_FEATURES.CACHE_RECORDSETS.enabled = false;
      COMPUTED_FEATURES.CACHE_TILES.enabled = false;
      COMPUTED_FEATURES.OFFLINE_SYNC.enabled = false;
      COMPUTED_FEATURES.MAP_SIMPLIFIED_BAKED_VECTOR_TILES.enabled = true; /*not yet implemented*/
      COMPUTED_FEATURES.DEGRADED_EXPERIENCE_WARNING.enabled = true;
    }
    if (totalMemoryGB < 2 || lowVMMemory) {
      console.warn(
        'Device is too small to support the full experience, operating with some features disabled (>=2GB features off)'
      );
      // we're on something tiny
      COMPUTED_FEATURES.MAP.enabled = false;
      COMPUTED_FEATURES.DEGRADED_EXPERIENCE_WARNING.enabled = true;
    }
  }

  /* apply run-time overrides */
  if (injectedFeatures.COMPONENTIZED_MAP) {
    COMPUTED_FEATURES.MAP_MODE_COMPONENTIZED.enabled = true;
    COMPUTED_FEATURES.MAP_MODE_LEGACY.enabled = false;
  }

  return COMPUTED_FEATURES;
}

export { computeFeatures };
export type { FeatureFlag, FeatureFlags };
