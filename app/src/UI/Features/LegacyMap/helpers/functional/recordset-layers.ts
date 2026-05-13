import { FilterSpecification, SourceSpecification } from 'maplibre-gl/dist/maplibre-gl-dev';
import { Md5 } from 'ts-md5';
import {
  createBorderLayer,
  createCircleLayer,
  createFillLayer,
  createLabelLayer,
  getPaintBySchemeOrColor
} from './layer-definitions/reusable-layer-specifications';
import {
  InvasivesMapLayerDefinition,
  MapDefinitionEligibilityPredicatesBuilder
} from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/types';
import { RecordSetId, RecordSetType, UserRecordSet } from 'interfaces/UserRecordSet';

function buildCompleteRecordsetMapSpecificationFromRecordsets(
  recordSets: Record<PropertyKey, UserRecordSet>,
  globalFilterObj: FilterSpecification | undefined
) {
  return Object.values(recordSets)
    .filter((r) => r.id !== RecordSetId.OfflineActivities)
    .flatMap((r) => buildRecordsetLayerDefinitionsFromRecordset(r, globalFilterObj))
    .reduce(
      (previousValue, currentValue) => {
        return {
          sources: { ...previousValue.sources, ...currentValue.sources },
          definitions: [...previousValue.definitions, ...currentValue.definitions]
        };
      },
      { sources: {}, definitions: [] }
    );
}
function buildRecordsetLayerDefinitionsFromRecordset(
  rec: UserRecordSet,
  globalFilterObj: FilterSpecification | undefined
): {
  definitions: InvasivesMapLayerDefinition[];
  sources: { [_: string]: SourceSpecification };
} {
  const filterObject = {
    ids_to_filter: rec?.ids_to_filter,
    recordSetType: rec.recordSetType,
    selectColumns: [],
    tableFilters: rec?.tableFilters ?? []
  };
  const color = getPaintBySchemeOrColor(rec.color);
  const displayName = rec.recordSetName || `New Recordset - ${rec.recordSetType}`;
  const api_target = (() => {
    if (rec.recordSetType === RecordSetType.Activity) {
      return 'activities';
    } else if (rec.recordSetType === RecordSetType.IAPP) {
      return 'iapp';
    } else {
      return null;
    }
  })();
  const stringifiedFilters = JSON.stringify(filterObject);
  const stringifiedGlobalFilters = JSON.stringify(globalFilterObj);
  const SOURCE_ID = rec.id + rec.tableFiltersHash;
  // Forces Layers to refresh when filters/toggles/colours update
  const layerID =
    'recordset-layer-' +
    Md5.hashStr(
      SOURCE_ID +
        stringifiedFilters +
        rec.mapToggle +
        rec.labelToggle +
        JSON.stringify(color) +
        stringifiedGlobalFilters
    );

  /** Common Properties for Layer definitions */
  const layerConfiguration = {
    layerId: layerID,
    sourceId: SOURCE_ID,
    'source-layer': 'data',
    color: color,
    filters: globalFilterObj
  };
  return {
    sources: {
      [SOURCE_ID]: {
        type: 'vector',
        tiles: [`api:///api/vectors/${api_target}/{z}/{x}/{y}?filterObject=${encodeURI(stringifiedFilters)}`],
        minzoom: 0
      }
    },
    definitions: [
      {
        name: rec.id,
        displayName: displayName,
        icon: 'N/A',
        mode: 'overlay',
        selectionMode: null,
        tooltip: '',
        predicates: new MapDefinitionEligibilityPredicatesBuilder()
          .requiresAuthentication(true)
          .requiresNetwork(true)
          .build(),
        layers: [
          createFillLayer(layerConfiguration),
          createCircleLayer(layerConfiguration),
          createBorderLayer(layerConfiguration),
          createLabelLayer({
            ...layerConfiguration,
            visibility: rec.labelToggle ? 'visible' : 'none',
            minzoom: 12
          })
        ]
      }
    ]
  };
}

export { buildCompleteRecordsetMapSpecificationFromRecordsets };
