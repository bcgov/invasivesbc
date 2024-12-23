import maplibregl, { MapOptions } from 'maplibre-gl';

class InvasivesMap extends maplibregl.Map {
  constructor(options: MapOptions) {
    super(options);
  }
}

export { InvasivesMap };
