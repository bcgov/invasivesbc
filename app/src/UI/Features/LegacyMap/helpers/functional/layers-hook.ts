import { useEffect, useMemo, useState } from 'react';
import { LayerSpecification, SourceSpecification } from 'maplibre-gl';
import debounce from 'lodash.debounce';
import { produce } from 'immer';
import { MAP_DEFINITIONS, SOURCES } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/layer-definitions';
import { useDispatch, useSelector } from 'utils/use_selector';
import {
  InvasivesMapLayerDefinition,
  layerStacking,
  POSITIONING_LAYER
} from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/types';
import { Platform } from 'state/configuration/build-time-config';
import UserSettings from 'state/actions/userSettings/UserSettings';

type InvasivesMapLayerDefinitionWithState = InvasivesMapLayerDefinition & {
  active: boolean;
};

type LayerSpecificationWithStackingOrder = LayerSpecification & { stackLayer: POSITIONING_LAYER };

const useInvasivesMapLayers = () => {
  const dispatch = useDispatch();
  const preferredBaseMap = useSelector((state) => state.UserSettings.preferredBasemap);
  const preferredDataBCLayers = useSelector((state) => state.UserSettings.preferredDataBCLayers);

  const [layers, setLayers] = useState<LayerSpecificationWithStackingOrder[]>([]);
  const [sources, setSources] = useState<{ [_: string]: SourceSpecification }>({});

  const offlineDefinitions = useSelector((state) => state.TileCache?.mapSpecifications);

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

    // evaluate each potential map definition and remove those not eligible at this moment
    for (const l of [...MAP_DEFINITIONS, ...(offlineDefinitions ?? [])] as InvasivesMapLayerDefinition[]) {
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
          active: (() => {
            switch (l.mode) {
              case 'basemap':
                return l.name === preferredBaseMap;
              case 'overlay':
                return preferredDataBCLayers.includes(l.name);
              default:
                return false;
            }
          })(),
          ...l
        });
      }
    }

    setAvailableLayerDefinitions(newFilteredLayerDefinitions);
  }, [features, connected, offlineDefinitions, MOBILE, platform, loggedInOrWorkingOffline]);

  /* ensure that at least one basemap layer is always designated as active */
  useEffect(() => {
    if (availableLayerDefinitions.length == 0) return;
    if (availableLayerDefinitions.filter((l) => l.mode === 'basemap').length == 0) return;
    if (availableLayerDefinitions.filter((l) => l.mode === 'basemap' && l.active).length > 0) return;

    setAvailableLayerDefinitions(
      produce((draft) => {
        const found = draft.find((l) => l.mode === 'basemap');
        if (found) {
          found.active = true;
        }
      })
    );
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

    setAvailableLayerDefinitions(
      produce((draft) => {
        for (const l of draft) {
          if (l.name === 'Public-Vector') {
            l.active = !loggedInOrWorkingOffline;
          }
        }
      })
    );
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

  const setActiveBaseMap = useMemo(
    () =>
      debounce(
        (layerName: string) => {
          setAvailableLayerDefinitions(
            produce((draft) => {
              draft.filter((l) => l.mode === 'basemap').forEach((l) => (l.active = l.name === layerName));
            })
          );
          dispatch(UserSettings.Map.setPreferredBasemap(layerName));
        },
        platform == Platform.ANDROID
          ? 750
          : 100 /*use a longer debounce delay on Android to avoid excessive memory consumption*/,
        { leading: true }
      ),
    [platform, dispatch]
  );

  /* toggle or explicitly set the state of an overlay layer */
  const setOverlayState = (layerName: string, active?: boolean) => {
    setAvailableLayerDefinitions(
      produce((draft) => {
        draft
          .filter((l) => l.mode === 'overlay' && l.name === layerName)
          .forEach((l) => (l.active = active !== undefined ? active : !l.active));
      })
    );

    dispatch(UserSettings.Map.togglePreferredDataBCLayer({ layerName, active }));
  };

  return { layers, sources, availableLayerDefinitions, setActiveBaseMap, setOverlayState };
};
export { useInvasivesMapLayers };
export type { InvasivesMapLayerDefinitionWithState, LayerSpecificationWithStackingOrder };
