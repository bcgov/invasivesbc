import { useEffect, useState } from 'react';
import { LayerSpecification, SourceSpecification } from 'maplibre-gl';
import { MAP_DEFINITIONS, SOURCES } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/layer-definitions';
import { useSelector } from 'utils/use_selector';
import { InvasivesMapLayerDefinition } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/types';

const useInvasivesMapLayers = () => {
  const [layers, setLayers] = useState<LayerSpecification[]>([]);
  const [sources, setSources] = useState<{ [_: string]: SourceSpecification }>({});

  const [filteredLayerDefinitions, setFilteredLayerDefinitions] = useState<InvasivesMapLayerDefinition[]>([]);

  const loggedInOrWorkingOffline = useSelector((state) => state.Auth.loggedInOrWorkingOffline);
  const connected = useSelector((state) => state.Network.connected);

  const MOBILE = useSelector((state) => state.Configuration.current.build.MOBILE);
  const platform = useSelector((state) => state.Configuration.current.build.PLATFORM);
  const features = useSelector((state) => state.Configuration.current.features);

  useEffect(() => {
    const newBasemaps: LayerSpecification[] = [];
    const requiredSources: (keyof typeof SOURCES)[] = [];
    const newSources: { [_: string]: SourceSpecification } = {};
    const newFilteredLayerDefinitions: InvasivesMapLayerDefinition[] = [];
    // const offlineDefinitions = (yield select((state: RootState) => state.TileCache?.mapSpecifications)) ?? [];
    const offlineDefinitions = [];

    // evaluate each potential map definition and remove those not eligible at this moment
    for (const l of [...MAP_DEFINITIONS, ...offlineDefinitions] as InvasivesMapLayerDefinition[]) {
      let pass = true;

      if (!l.predicates.directlySelectable) {
        pass = false;
      }

      if (l.predicates.mobileOnly && !MOBILE) {
        pass = false;
      }

      if (l.predicates.webOnly && MOBILE) {
        pass = false;
      }

      if (l.predicates.requiresPlatform !== undefined) {
        if (l.predicates.requiresPlatform !== platform) {
          pass = false;
        }
      }

      if (l.predicates.requiresFeature !== undefined) {
        if (!features[l.predicates.requiresFeature].enabled) {
          pass = false;
        }
      }

      if (l.predicates.requiresAuthentication && !loggedInOrWorkingOffline) {
        pass = false;
      }

      if (l.predicates.requiresAnonymous && loggedInOrWorkingOffline) {
        pass = false;
      }

      if (l.predicates.requiresNetwork && !connected) {
        pass = false;
      }

      if (!l.predicates.requiresNetwork && l.predicates.mobileOnly && connected) {
        pass = false;
      }

      if (pass) {
        newFilteredLayerDefinitions.push(l);

        for (const subLayer of l.layers) {
          newBasemaps.push(subLayer);
          if (subLayer.source) {
            requiredSources.push(subLayer.source);
          }
        }
      }
    }

    for (const s of requiredSources) {
      newSources[s] = SOURCES[s] as SourceSpecification;
    }

    setLayers(newBasemaps);
    setSources(newSources);
    setFilteredLayerDefinitions(newFilteredLayerDefinitions);
  }, [features, connected, MOBILE, platform, loggedInOrWorkingOffline]);

  return { layers, sources, filteredLayerDefinitions };
};
export { useInvasivesMapLayers };
