import { useEffect, useState } from 'react';
import { LayerSpecification, SourceSpecification } from 'maplibre-gl';
import { MAP_DEFINITIONS, SOURCES } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/layer-definitions';
import { useSelector } from 'utils/use_selector';
import {
  InvasivesMapLayerDefinition,
  layerStacking,
  POSITIONING_LAYER
} from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/types';

type InvasivesMapLayerDefinitionWithState = InvasivesMapLayerDefinition & {
  active: boolean;
};

type LayerSpecificationWithStackingOrder = LayerSpecification & { stackLayer: POSITIONING_LAYER };

const useInvasivesMapLayers = () => {
  const [layers, setLayers] = useState<LayerSpecificationWithStackingOrder[]>([]);
  const [sources, setSources] = useState<{ [_: string]: SourceSpecification }>({});

  const [availableLayerDefinitions, setAvailableLayerDefinitions] = useState<InvasivesMapLayerDefinitionWithState[]>(
    []
  );

  const loggedInOrWorkingOffline = useSelector((state) => state.Auth.loggedInOrWorkingOffline);
  const connected = useSelector((state) => state.Network.connected);

  const MOBILE = useSelector((state) => state.Configuration.current.build.MOBILE);
  const platform = useSelector((state) => state.Configuration.current.build.PLATFORM);
  const features = useSelector((state) => state.Configuration.current.features);

  /* evaluate which layers are currently available to select */
  useEffect(() => {
    const newFilteredLayerDefinitions: InvasivesMapLayerDefinitionWithState[] = [];
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
        newFilteredLayerDefinitions.push({
          active: false,
          ...l
        });
      }
    }

    setAvailableLayerDefinitions(newFilteredLayerDefinitions);
  }, [features, connected, MOBILE, platform, loggedInOrWorkingOffline]);

  /* ensure that at least one basemap layer is always designated as active */
  useEffect(() => {
    if (availableLayerDefinitions.length == 0) return;
    if (availableLayerDefinitions.filter((l) => l.mode === 'basemap').length == 0) return;
    if (availableLayerDefinitions.filter((l) => l.mode === 'basemap' && l.active).length > 0) return;

    const updatedLayerDefinitions: InvasivesMapLayerDefinitionWithState[] = [];

    let updatedOne = false;

    for (const l of availableLayerDefinitions) {
      const updated = l;

      if (!updatedOne && updated.mode === 'basemap') {
        updated.active = true;
        updatedOne = true;
      }

      updatedLayerDefinitions.push(updated);
    }

    setAvailableLayerDefinitions(updatedLayerDefinitions);
  }, [availableLayerDefinitions]);

  /* set the state of the public vector layer correctly on auth state change */
  useEffect(() => {
    if (availableLayerDefinitions.length == 0) return;
    if (availableLayerDefinitions.filter((l) => l.name === 'Public-Vector').length == 0) return;
    if (
      availableLayerDefinitions.filter((l) => l.name === 'Public-Vector' && l.active == !loggedInOrWorkingOffline)
        .length > 0
    )
      return;

    const updatedLayerDefinitions: InvasivesMapLayerDefinitionWithState[] = [];

    for (const l of availableLayerDefinitions) {
      const updated = l;

      if (updated.name === 'Public-Vector') {
        updated.active = !loggedInOrWorkingOffline;
      }

      updatedLayerDefinitions.push(updated);
    }

    setAvailableLayerDefinitions(updatedLayerDefinitions);
  }, [availableLayerDefinitions, loggedInOrWorkingOffline]);

  /* evaluate which layers are active and should be added to the map */
  useEffect(() => {
    const newLayers: LayerSpecificationWithStackingOrder[] = [];
    const newSources: { [_: string]: SourceSpecification } = {};

    const requiredSources: (keyof typeof SOURCES)[] = [];

    for (const l of availableLayerDefinitions) {
      if (l.active) {
        for (const subLayer of l.layers) {
          newLayers.push({
            stackLayer: layerStacking(l),
            ...subLayer
          });
          if (subLayer.source && !requiredSources.includes(subLayer.source)) {
            requiredSources.push(subLayer.source);
          }
        }
      }
    }

    for (const s of requiredSources) {
      newSources[s] = SOURCES[s] as SourceSpecification;
    }

    setLayers(newLayers);
    setSources(newSources);
  }, [availableLayerDefinitions]);

  const setActiveBaseMap = (layerName: string) => {
    const updatedLayerDefinitions: InvasivesMapLayerDefinitionWithState[] = [];

    for (const l of availableLayerDefinitions) {
      const updated = l;

      if (updated.mode === 'basemap') {
        updated.active = updated.name === layerName;
      }

      updatedLayerDefinitions.push(updated);
    }

    setAvailableLayerDefinitions(updatedLayerDefinitions);
  };

  return { layers, sources, availableLayerDefinitions, setActiveBaseMap };
};
export { useInvasivesMapLayers };
export type { InvasivesMapLayerDefinitionWithState, LayerSpecificationWithStackingOrder };
