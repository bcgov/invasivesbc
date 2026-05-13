import { LayerSpecification } from 'maplibre-gl/dist/maplibre-gl-dev';
import { FeatureFlags } from 'state/configuration/feature-flags';
import { Platform } from 'state/configuration/build-time-config';
import { SOURCES } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/layer-definitions';

type InvasivesLayerSpecification = LayerSpecification & { source?: keyof typeof SOURCES };

// these layers are used as placeholders so the others can be placed relative to them
const LAYER_Z_BACKGROUND = 'LAYER_Z_BACKGROUND';
const LAYER_Z_MID = 'LAYER_Z_MID';
const LAYER_Z_FOREGROUND = 'LAYER_Z_FOREGROUND';
type POSITIONING_LAYER = typeof LAYER_Z_FOREGROUND | typeof LAYER_Z_BACKGROUND | typeof LAYER_Z_MID;

type MapDefinitionEligibilityPredicates = {
  // not directly selectable means there won't be a button for it (but it can still be enabled by another definition requiring it)
  directlySelectable: boolean;
  mobileOnly: boolean;
  webOnly: boolean;
  requiresNetwork: boolean;
  requiresOffline: boolean;
  requiresAuthentication: boolean;
  requiresAnonymous: boolean;
  requiresFeature?: keyof FeatureFlags;
  requiresPlatform?: Platform;
  requiresDebug: boolean;
};

// fluent convenience object builder
class MapDefinitionEligibilityPredicatesBuilder {
  state: MapDefinitionEligibilityPredicates = {
    directlySelectable: true,
    mobileOnly: false,
    webOnly: false,
    requiresNetwork: true,
    requiresOffline: false,
    requiresAuthentication: false,
    requiresAnonymous: false,
    requiresDebug: false
  };

  directlySelectable(p?: boolean) {
    if (p !== undefined) {
      this.state.directlySelectable = p;
    } else {
      this.state.directlySelectable = true;
    }
    return this;
  }

  mobileOnly(p?: boolean) {
    if (p !== undefined) {
      this.state.mobileOnly = p;
    } else {
      this.state.mobileOnly = true;
    }
    return this;
  }

  webOnly(p?: boolean) {
    if (p !== undefined) {
      this.state.webOnly = p;
    } else {
      this.state.webOnly = true;
    }
    return this;
  }

  requiresPlatform(p: Platform) {
    this.state.requiresPlatform = p;
    return this;
  }

  requiresNetwork(p?: boolean) {
    if (p !== undefined) {
      this.state.requiresNetwork = p;
    } else {
      this.state.requiresNetwork = true;
    }
    return this;
  }

  requiresOffline(p?: boolean) {
    if (p !== undefined) {
      this.state.requiresOffline = p;
    } else {
      this.state.requiresOffline = true;
    }
    return this;
  }

  requiresAuthentication(p?: boolean) {
    if (p !== undefined) {
      this.state.requiresAuthentication = p;
    } else {
      this.state.requiresAuthentication = true;
    }
    return this;
  }

  requiresAnonymous(p?: boolean) {
    if (p !== undefined) {
      this.state.requiresAnonymous = p;
    } else {
      this.state.requiresAnonymous = true;
    }
    return this;
  }

  requiresDebug(p?: boolean) {
    if (p !== undefined) {
      this.state.requiresDebug = p;
    } else {
      this.state.requiresDebug = true;
    }
    return this;
  }

  requiresFeature(f: keyof FeatureFlags) {
    this.state.requiresFeature = f;
    return this;
  }

  build() {
    return this.state;
  }
}

type InvasivesMapLayerDefinition = {
  name: string;
  displayName: string;
  mode: 'basemap' | 'overlay';
  selectionMode: 'layer-picker' | 'offline-layers' | 'primary-selector' | null;

  // this is an optimization to prevent having to bundle all icons. you can add others here and corresponding lookup in BaseMapSelect.tsx
  icon: 'N/A' | 'Hd' | 'Sd' | 'Landscape' | 'Map' | 'Offline' | 'OfflineSatellite' | 'OfflineVector' | 'Cached';
  tooltip: string;

  // source: keyof typeof SOURCES;
  layers: InvasivesLayerSpecification[];

  predicates: MapDefinitionEligibilityPredicates;
};

function layerStacking(l: InvasivesMapLayerDefinition): POSITIONING_LAYER {
  switch (l.mode) {
    case 'overlay':
      return LAYER_Z_MID;
    case 'basemap':
    default:
      return LAYER_Z_BACKGROUND;
  }
}

export {
  MapDefinitionEligibilityPredicatesBuilder,
  layerStacking,
  LAYER_Z_FOREGROUND,
  LAYER_Z_BACKGROUND,
  LAYER_Z_MID
};

export type {
  MapDefinitionEligibilityPredicates,
  InvasivesMapLayerDefinition,
  InvasivesLayerSpecification,
  POSITIONING_LAYER
};
