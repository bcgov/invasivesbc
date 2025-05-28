import { buildTimeConfig, BuildTimeConfig } from './build-time-config';
import { AppConfig } from './runtime-config';
import { computeFeatures, FeatureFlags } from './feature-flags';

type UnifiedConfig = {
  runtime: AppConfig;
  build: BuildTimeConfig;
  features: FeatureFlags;
};

async function constructUnifiedConfig(): Promise<UnifiedConfig> {
  const { runtimeConfig } = await import('state/configuration/runtime-config');

  return {
    runtime: runtimeConfig,
    build: buildTimeConfig,
    features: await computeFeatures(buildTimeConfig, runtimeConfig)
  };
}

export type { UnifiedConfig };

export { constructUnifiedConfig };
