import * as maplibregl from 'maplibre-gl/dist/maplibre-gl-dev';
import { MapOptions } from 'maplibre-gl/dist/maplibre-gl-dev';

class InvasivesMap extends maplibregl.Map {
  constructor(options: MapOptions) {
    super(options);
  }
}

export { InvasivesMap };
