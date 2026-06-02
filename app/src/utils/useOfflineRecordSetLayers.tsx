/**
 * @desc Throwaway file to temporarily return the Offline Cached GeoJSON layers to the Application
 *       while waiting for the more permanent solution to be implemented.
 */
import { useEffect, useState } from 'react';
import { SourceSpecification } from 'maplibre-gl/dist/maplibre-gl-dev';
import { shallowEqual } from 'react-redux';
import { useDispatch, useSelector } from './use_selector';
import {
  InvasivesMapLayerDefinitionWithState,
  LayerSpecificationWithStackingOrder
} from 'UI/Features/LegacyMap/helpers/functional/layers-hook';
import {
  InvasivesMapLayerDefinition,
  LAYER_Z_FOREGROUND,
  MapDefinitionEligibilityPredicatesBuilder
} from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/types';
import { selectGlobalRecordsetFilters } from 'state/reducers/map';
import {
  createBorderLayer,
  createCircleLayer,
  createFillLayer,
  createLabelLayer,
  getPaintBySchemeOrColor
} from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/reusable-layer-specifications';
import { RecordSetId, UserRecordCacheStatus, UserRecordSet } from 'interfaces/UserRecordSet';
import { RecordCacheServiceFactory } from './record-cache/context';
import { Md5 } from 'ts-md5';
import Alerts from 'state/actions/alerts/Alerts';
import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import UserSettings from 'state/actions/userSettings/UserSettings';

const useOfflineRecordSetLayers = () => {
  const FEATURE_LIMIT = 50000;
  const dispatch = useDispatch();
  const buildCompleteRecordsetMapSpecificationFromRecordsets = async (
    recordSets: Record<PropertyKey, UserRecordSet>
  ) => {
    const promises = Object.values(recordSets)
      .filter(
        (r) =>
          r.id !== RecordSetId.OfflineActivities &&
          r.cacheMetadataStatus === UserRecordCacheStatus.CACHED &&
          r.mapToggle
      )
      .map(async (r) => await buildRecordsetLayerDefinitionsFromRecordset(r, globalMapFilters));

    const resolvedPromises = await Promise.all(promises);

    return resolvedPromises
      .filter((r) => r != null)
      .flat()
      .reduce(
        (previousValue, currentValue) => {
          return {
            sources: { ...previousValue.sources, ...currentValue.sources },
            definitions: [...previousValue.definitions, ...currentValue.definitions]
          };
        },
        { sources: {}, definitions: [] }
      );
  };

  async function buildRecordsetLayerDefinitionsFromRecordset(
    rec: UserRecordSet,
    globalFilterObj
  ): Promise<{
    definitions: InvasivesMapLayerDefinition[];
    sources: { [_: string]: SourceSpecification };
  } | null> {
    const color = getPaintBySchemeOrColor(rec.color);
    const SOURCE_ID = 'offline-' + rec.id + rec.tableFiltersHash;
    const service = await RecordCacheServiceFactory.getPlatformInstance();
    if (!service) throw new Error('Service unavailable');
    const r = await service.getRepository(rec.id);

    if (!r?.cached_geojson || !r?.cached_centroid) {
      console.warn(`[ABORTED] ${rec?.id} returned false positive for being cached.`);
      return null;
    }
    /**
     * Since this is meant as a temporary stopgap between features, Enable a limit of features that can be rendered per layer,
     * this will help prevent users from making massive recordsets that crash their devices.
     */
    const OVERSIZED = r.cached_geojson.data.features.length >= FEATURE_LIMIT;
    if (OVERSIZED && rec.mapToggle && !connected) {
      dispatch(
        Alerts.create({
          content: `We can't load this layer offline because it contains too much information. Try checking it again once you're back online! (Contains over ${FEATURE_LIMIT.toLocaleString()} records!)`,
          severity: AlertSeverity.Warning,
          subject: AlertSubjects.Map,
          autoClose: 10
        })
      );
      dispatch(UserSettings.RecordSet.toggleVisibility(rec.id));
      return null;
    }
    const layerID =
      'offline-recordset-' +
      rec.id +
      Md5.hashStr(
        SOURCE_ID +
          rec.tableFiltersHash +
          rec.mapToggle +
          rec.labelToggle +
          JSON.stringify(color) +
          JSON.stringify(rec.tableFilters)
      );

    const layerConfiguration = {
      layerId: layerID,
      sourceId: SOURCE_ID,
      color: color,
      filters: globalFilterObj
    };

    const CENTROID_LAYER_ID = `centroid-${SOURCE_ID}`;
    const centroidLayerConfiguration = {
      layerId: CENTROID_LAYER_ID,
      sourceId: `centroid-${SOURCE_ID}`,
      color: color,
      filters: globalFilterObj
    };

    return {
      sources: {
        [SOURCE_ID]: {
          type: 'geojson',
          data: r.cached_geojson.data
        },
        [CENTROID_LAYER_ID]: {
          type: 'geojson',
          data: r.cached_centroid.data
        }
      },
      definitions: [
        {
          name: rec.id,
          displayName: OVERSIZED ? 'DENY' : 'displayName',
          icon: 'N/A',
          mode: 'overlay',
          selectionMode: null,
          tooltip: '',
          predicates: new MapDefinitionEligibilityPredicatesBuilder()
            .requiresAuthentication(true)
            .requiresNetwork(false)
            .build(),
          layers: [
            createFillLayer({ ...layerConfiguration, minzoom: 12 }),
            createCircleLayer({ ...layerConfiguration, minzoom: 12 }),
            createBorderLayer({ ...layerConfiguration, minzoom: 12 }),
            createLabelLayer({
              ...layerConfiguration,
              get_tag: 'name',
              visibility: rec.labelToggle ? 'visible' : 'none',
              minzoom: 12
            }),
            // Add slight overlap so layers don't disappear randomly while transitioning.
            createFillLayer({ ...centroidLayerConfiguration, maxzoom: 12.5 }),
            createCircleLayer({ ...centroidLayerConfiguration, maxzoom: 12.5 }),
            createBorderLayer({ ...centroidLayerConfiguration, maxzoom: 12.5 })
          ]
        }
      ]
    };
  }

  const [recordsetLayers, setRecordsetLayers] = useState<LayerSpecificationWithStackingOrder[]>([]);
  const [recordsetSources, setRecordsetSources] = useState<{ [_: string]: SourceSpecification }>({});
  const recordsets = useSelector((state) => state.UserSettings.recordSets, shallowEqual);

  const MOBILE = useSelector((state) => state.Configuration.current.build.MOBILE);
  const DEBUG = useSelector((state) => state.Configuration.current.build.DEBUG);
  const platform = useSelector((state) => state.Configuration.current.build.PLATFORM);
  const features = useSelector((state) => state.Configuration.current.features);
  const loggedInOrWorkingOffline = useSelector((state) => state.Auth.loggedInOrWorkingOffline);
  const connected = useSelector((state) => state.Network.connected);
  const globalMapFilters = useSelector(selectGlobalRecordsetFilters);

  /**
   * Rebuild Recordset layers when recordsets/auth/online status changes.
   */

  useEffect(() => {
    (async () => {
      const recordSetData = await buildCompleteRecordsetMapSpecificationFromRecordsets(recordsets);
      const filteredRecordDefinitions: Array<InvasivesMapLayerDefinitionWithState> = [];

      for (const l of recordSetData.definitions) {
        const pass = (() => {
          switch (true) {
            case l.displayName == 'DENY': // Prevent Oversized records from rendering
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
          filteredRecordDefinitions.push({
            active: recordsets[l.name].mapToggle,
            ...l
          });
        }
      }
      const newLayers: LayerSpecificationWithStackingOrder[] = [];
      const requiredSources: Array<keyof typeof recordSetData.sources | string> = [];

      filteredRecordDefinitions.forEach((l) => {
        if (l.active) {
          for (const subLayer of l.layers) {
            newLayers.push({
              stackLayer: LAYER_Z_FOREGROUND,
              ...subLayer
            });
            if (subLayer.source && !requiredSources.includes(subLayer.source)) {
              requiredSources.push(subLayer.source);
            }
          }
        }
      });
      setRecordsetSources(recordSetData.sources);
      setRecordsetLayers(newLayers);
    })();
  }, [recordsets, connected, loggedInOrWorkingOffline, globalMapFilters]);

  return {
    recordsetLayers,
    recordsetSources
  };
};

export { useOfflineRecordSetLayers };
