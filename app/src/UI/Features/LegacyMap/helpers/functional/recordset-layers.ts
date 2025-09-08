import { ColorSpecification, ExpressionSpecification, SourceSpecification } from 'maplibre-gl';
import { Md5 } from 'ts-md5';
import {
  InvasivesMapLayerDefinition,
  MapDefinitionEligibilityPredicatesBuilder
} from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/types';
import { FALLBACK_COLOR } from 'UI/Features/LegacyMap/helpers/functional/constants';
import { RecordSetId, RecordSetType, UserRecordSet } from 'interfaces/UserRecordSet';
import VECTOR_MAP_FONT_FACE from 'constants/vectorMapFontFace';
import { white } from 'constants/colors';
import recordsetColourScheme from 'constants/recordsetColourScheme';

function buildCompleteRecordsetMapSpecificationFromRecordsets(recordSets: Record<PropertyKey, UserRecordSet>) {
  return Object.values(recordSets)
    .filter((r) => r.id !== RecordSetId.OfflineActivities)
    .flatMap((r) => buildRecordsetLayerDefinitionsFromRecordset(r))
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
function buildRecordsetLayerDefinitionsFromRecordset(rec: UserRecordSet): {
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
  // Forces Layers to refresh when filters/toggles/colours update
  const layerID = Md5.hashStr(
    rec.id + JSON.stringify(rec?.tableFilters) + rec.mapToggle + rec.labelToggle + JSON.stringify(color)
  );
  return {
    sources: {
      [rec.id]: {
        type: 'vector',
        tiles: [`api:///api/vectors/${api_target}/{z}/{x}/{y}?filterObject=${encodeURI(JSON.stringify(filterObject))}`],
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
          {
            id: 'fill-' + layerID,
            type: 'fill',
            source: rec.id,
            'source-layer': 'data',
            paint: {
              'fill-color': color,
              'fill-outline-color': color,
              'fill-opacity': 0.5
            },
            minzoom: 0,
            layout: {
              visibility: 'visible'
            }
          },
          {
            id: 'polygon-border-' + layerID,
            source: rec.id,
            'source-layer': 'data',
            type: 'line',
            paint: {
              'line-color': color,
              'line-opacity': 1,
              'line-width': 3
            },
            minzoom: 0,
            layout: {
              visibility: 'visible'
            }
          },
          {
            id: 'polygon-circle-' + layerID,
            source: rec.id,
            'source-layer': 'data',
            type: 'circle',
            paint: {
              'circle-color': color,
              'circle-radius': 4
            },
            minzoom: 0,
            layout: {
              visibility: 'visible'
            }
          },
          {
            id: 'label-' + layerID,
            source: rec.id,
            'source-layer': 'data',
            type: 'symbol',
            layout: {
              'text-field': [
                'format',
                ['get', 'short_id'],
                { 'font-scale': 0.9 },
                ['get', 'site_id'],
                { 'font-scale': 0.9 },
                '\n',
                {},
                ['get', 'map_symbol'],
                { 'font-scale': 0.9 }
              ],
              // the actual font names that work are here https://github.com/openmaptiles/fonts/blob/gh-pages/fontstacks.json
              'text-font': ['literal', [VECTOR_MAP_FONT_FACE]],
              'text-offset': [0, 0.6],
              'text-anchor': 'top',
              visibility: rec.labelToggle ? 'visible' : 'none'
            },
            paint: {
              'text-color': 'black',
              'text-halo-color': 'white',
              'text-halo-width': 1,
              'text-halo-blur': 1
            },
            minzoom: 12
          }
        ]
      }
    ]
  };
}

const getPaintBySchemeOrColor = (color: string): ColorSpecification | ExpressionSpecification => {
  if (color === white) {
    const activitySubtypeColours = Object.entries(recordsetColourScheme).flatMap(([activity, colour]) => [
      activity,
      colour ?? FALLBACK_COLOR
    ]);
    return [
      'match',
      ['get', 'activity_subtype'],
      ...activitySubtypeColours,
      color ?? FALLBACK_COLOR
    ] as unknown as ExpressionSpecification;
  }
  return color ?? FALLBACK_COLOR;
};

export { getPaintBySchemeOrColor, buildCompleteRecordsetMapSpecificationFromRecordsets };
