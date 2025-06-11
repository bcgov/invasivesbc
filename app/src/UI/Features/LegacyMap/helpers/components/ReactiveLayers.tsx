import { MapContext } from 'UI/Features/LegacyMap/helpers/components/MapContext';
import { useContext, useEffect } from 'react';
import {
  allBaseMapLayerIdsNotInDefinition,
  allOverlayLayerIdsNotInDefinitions,
  allSourceIDsRequiredForDefinition,
  LAYER_Z_BACKGROUND,
  LAYER_Z_MID,
  layersForDefinition,
  MAP_DEFINITIONS
} from 'UI/Features/LegacyMap/helpers/functional/layer-definitions';
import { useSelector } from 'utils/use_selector';

const ReactiveLayers = ({ mapReady }) => {
  const map = useContext(MapContext);

  const baseMapLayer = useSelector((state) => state.Map.baseMapLayer);
  const enabledOverlayLayers = useSelector((state) => state.Map.enabledOverlayLayers);

  const offlineDefinitions = useSelector((state) => state.TileCache?.mapSpecifications);

  // set base map layer
  useEffect(() => {
    if (!mapReady) return;

    if (!map) {
      return;
    }

    if (!baseMapLayer) {
      return;
    }

    const deactivateBaseLayers = allBaseMapLayerIdsNotInDefinition(
      [...MAP_DEFINITIONS, ...(offlineDefinitions || [])],
      baseMapLayer
    );

    const deactivateOverlayLayers = allOverlayLayerIdsNotInDefinitions(
      [...MAP_DEFINITIONS, ...(offlineDefinitions || [])],
      enabledOverlayLayers
    );

    const staticSources = MAP_DEFINITIONS.map((m) => {
      return {
        id: m.name,
        source: m.source
      };
    });

    /* cached layers */
    const cachedSources = (offlineDefinitions || []).map((m) => {
      return {
        id: m.name,
        source: m.source
      };
    });

    const allSources = [...staticSources, ...cachedSources];

    const sourcesRequired = allSources.filter((s) => {
      for (const layerToCheck of [baseMapLayer, ...enabledOverlayLayers]) {
        if (
          allSourceIDsRequiredForDefinition([...MAP_DEFINITIONS, ...(offlineDefinitions || [])], layerToCheck).includes(
            s.id
          )
        ) {
          return true;
        }
      }
      return false;
    });

    const sourcesNotRequired = allSources.filter((s) => !sourcesRequired.some((r) => r.id == s.id));

    // first remove the unneeded layers
    for (const layerId of [...deactivateBaseLayers, ...deactivateOverlayLayers]) {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
    }

    // now we can delete associated sources we no longer reference
    for (const source of sourcesNotRequired) {
      if (map.getSource(source.id)) {
        map.removeSource(source.id);
      }
    }

    // ...add the required sources in
    for (const source of sourcesRequired) {
      if (!map.getSource(source.id)) {
        map.addSource(source.id, source.source);
      }
    }

    //  add the base map layers (which depend on the sources)
    for (const layerSpec of layersForDefinition([...MAP_DEFINITIONS, ...(offlineDefinitions || [])], baseMapLayer)) {
      if (!map.getLayer(layerSpec.id)) {
        map.addLayer(layerSpec, LAYER_Z_BACKGROUND);
      }
    }

    // finally, add the overlay layers (which can also depend on the sources)
    for (const overlayLayer of enabledOverlayLayers) {
      for (const layerSpec of layersForDefinition([...MAP_DEFINITIONS, ...(offlineDefinitions || [])], overlayLayer)) {
        if (!map.getLayer(layerSpec.id)) {
          map.addLayer(layerSpec, LAYER_Z_MID);
        }
      }
    }
  }, [baseMapLayer, enabledOverlayLayers, map, mapReady]);

  return null;
};

export { ReactiveLayers };
