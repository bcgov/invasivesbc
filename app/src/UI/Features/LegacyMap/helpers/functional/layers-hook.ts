import { useEffect, useMemo, useState } from 'react';
import { LayerSpecification, SourceSpecification } from 'maplibre-gl';
import debounce from 'lodash.debounce';
import { produce } from 'immer';
import { shallowEqual } from 'react-redux';
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

type LayerSpecificationWithStackingOrder = LayerSpecification & {
  stackLayer: POSITIONING_LAYER;
  source?: string | number | undefined;
};

const useInvasivesMapLayers = () => {
  const dispatch = useDispatch();
  const preferredBaseMap = useSelector((state) => state.UserSettings.preferredBasemap);
  const preferredOverlayLayers = useSelector((state) => state.UserSettings.preferredOverlayLayers);

  const [layers, setLayers] = useState<LayerSpecificationWithStackingOrder[]>([]);
  const [sources, setSources] = useState<{ [_: string]: SourceSpecification }>({});

  const tileCacheState = useSelector((state) => state.TileCache, {
    equalityFn: shallowEqual
  });

  const [availableLayerDefinitions, setAvailableLayerDefinitions] = useState<InvasivesMapLayerDefinitionWithState[]>(
    []
  );

  const loggedInOrWorkingOffline = useSelector((state) => state.Auth.loggedInOrWorkingOffline);
  const connected = useSelector((state) => state.Network.connected);

  const MOBILE = useSelector((state) => state.Configuration.current.build.MOBILE);
  const DEBUG = useSelector((state) => state.Configuration.current.build.DEBUG);

  const platform = useSelector((state) => state.Configuration.current.build.PLATFORM);
  const features = useSelector((state) => state.Configuration.current.features);

  /* evaluate which layers are currently available to select */
  useEffect(() => {
    const offlineDefinitions = tileCacheState?.mapSpecifications || [];
    const newFilteredLayerDefinitions: InvasivesMapLayerDefinitionWithState[] = [];

    const selectedBaseMap = preferredBaseMap;

    // evaluate each potential map definition and remove those not eligible at this moment
    for (const l of [...MAP_DEFINITIONS, ...offlineDefinitions] as InvasivesMapLayerDefinition[]) {
      const pass = (() => {
        switch (true) {
          case !l.predicates.directlySelectable:
          case l.predicates.mobileOnly && !MOBILE:
          case l.predicates.webOnly && MOBILE:
          case l.predicates.requiresDebug && !DEBUG:
          case l.predicates.requiresPlatform !== undefined && l.predicates.requiresPlatform !== platform:
          case l.predicates.requiresFeature !== undefined && !features[l.predicates.requiresFeature].enabled:
          case l.predicates.requiresAuthentication && !loggedInOrWorkingOffline:
          case l.predicates.requiresAnonymous && loggedInOrWorkingOffline:
          case l.predicates.requiresNetwork && !connected:
          case l.predicates.requiresOffline && connected:
            return false;
          default:
            return true;
        }
      })();

      if (pass) {
        newFilteredLayerDefinitions.push({
          active: (() => {
            switch (l.mode) {
              case 'basemap':
                return l.name === selectedBaseMap;
              case 'overlay':
                return preferredOverlayLayers.includes(l.name);
              default:
                return false;
            }
          })(),
          ...l
        });
      }
    }

    // ensure there is always at least one active basemap (if there is at least one basemap)
    if (!newFilteredLayerDefinitions.some((l) => l.mode === 'basemap' && l.active)) {
      const firstBasemap = newFilteredLayerDefinitions.find((l) => l.mode === 'basemap');
      if (firstBasemap) {
        firstBasemap.active = true;
      }
    }

    setAvailableLayerDefinitions(newFilteredLayerDefinitions);
  }, [
    features,
    connected,
    tileCacheState,
    MOBILE,
    platform,
    loggedInOrWorkingOffline,
    preferredBaseMap,
    preferredOverlayLayers
  ]);

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
    const offlineSources = tileCacheState?.sources || {};

    const newLayers: LayerSpecificationWithStackingOrder[] = [];
    const newSources: { [_: string]: SourceSpecification } = {};

    const requiredSources: (keyof typeof SOURCES | string)[] = [];

    const COMBINED_SOURCES = { ...SOURCES, ...offlineSources };

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
      newSources[s] = COMBINED_SOURCES[s] as SourceSpecification;
    }

    setLayers(newLayers);
    setSources(newSources);
  }, [availableLayerDefinitions, tileCacheState]);

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

    if (availableLayerDefinitions.find((l) => l.name === layerName))
      dispatch(UserSettings.Map.togglePreferredOverlayLayer({ layerName, active }));
  };

  return { layers, sources, availableLayerDefinitions, setActiveBaseMap, setOverlayState };
};

type LayerEffectType = ReturnType<typeof useInvasivesMapLayers>;

export { useInvasivesMapLayers };
export type { InvasivesMapLayerDefinitionWithState, LayerSpecificationWithStackingOrder, LayerEffectType };
