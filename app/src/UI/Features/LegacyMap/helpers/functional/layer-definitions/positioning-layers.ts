import { LayerSpecification } from 'maplibre-gl';
import {
  LAYER_Z_BACKGROUND,
  LAYER_Z_FOREGROUND,
  LAYER_Z_MID
} from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/types';

const POSITIONING_LAYERS: LayerSpecification[] = [
  {
    id: LAYER_Z_BACKGROUND,
    type: 'background',
    layout: {
      visibility: 'none'
    }
  },
  {
    id: LAYER_Z_MID,
    type: 'background',
    layout: {
      visibility: 'none'
    }
  },
  {
    id: LAYER_Z_FOREGROUND,
    type: 'background',
    layout: {
      visibility: 'none'
    }
  }
];

export { POSITIONING_LAYERS };
