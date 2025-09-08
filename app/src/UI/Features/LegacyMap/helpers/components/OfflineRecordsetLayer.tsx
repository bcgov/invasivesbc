import { RecordSetId } from 'interfaces/UserRecordSet';
import { useEffect, useState } from 'react';
import { useSelector } from 'utils/use_selector';
import { SourceComponent } from './SourceComponent';
import { LayerComponent } from './LayerComponent';
import { SourceCleanupComponent } from './SourceCleanupComponent';
import { findSpeciesCodes, getConcatenatedCodes } from 'utils/addActivity';
import { OfflineActivityRecord, OfflineActivitySyncState } from 'state/reducers/offlineActivity';
import { FeatureCollection } from 'geojson';
import { SourceSpecification } from 'maplibre-gl';
import { GeoJSON } from 'geojson';
import { LayerSpecificationWithStackingOrder } from '../functional/layers-hook';
import VECTOR_MAP_FONT_FACE from 'constants/vectorMapFontFace';
import { shallowEqual } from 'react-redux';
import { LAYER_Z_FOREGROUND } from '../functional/layer-definitions/types';
import { Md5 } from 'ts-md5';

type PropTypes = {
  mapReady: boolean;
};
const OfflineRecordsetLayer = ({ mapReady }: PropTypes) => {
  const OFFLINE_RECORD_ID = RecordSetId.OfflineActivities;
  const LAYER_COLOUR = 'blue';

  const [source, setSource] = useState<SourceSpecification>();
  const [layers, setLayers] = useState<LayerSpecificationWithStackingOrder[]>([]);

  const { mapToggle, labelToggle } = useSelector((state) => state.UserSettings.recordSets[OFFLINE_RECORD_ID]);
  const serializedActivities = useSelector((state) => state.OfflineActivity.serializedActivities, shallowEqual);

  const buildSource = () => {
    const geometryList: Array<GeoJSON> = [];
    const locallyStoredActivities = Object.fromEntries(
      Object.entries(serializedActivities).filter(
        ([, value]) => (value as OfflineActivityRecord).sync_state !== OfflineActivitySyncState.SYNCHRONIZED
      )
    );
    Object.values(locallyStoredActivities).forEach((item) => {
      try {
        const parsedData = JSON.parse((item as OfflineActivityRecord)?.data);
        const plantCodes = getConcatenatedCodes(
          findSpeciesCodes(parsedData.form_data.activity_subtype_data, (item as OfflineActivityRecord)?.record_type)
        );

        if (parsedData?.geometry?.[0]) {
          geometryList.push({
            ...parsedData.geometry[0],
            properties: {
              short_id: parsedData.short_id,
              map_symbol: plantCodes,
              activity_id: parsedData.activity_id,
              type: parsedData.activity_type
            }
          });
        }
      } catch (error) {
        console.error(error);
      }
    });

    setSource({
      type: 'geojson',
      data: { type: 'FeatureCollection', features: geometryList } as FeatureCollection
    });
  };

  const buildLayers = () => {
    const layers: LayerSpecificationWithStackingOrder[] = [];
    const LAYER_ID = Md5.hashStr(OFFLINE_RECORD_ID + mapToggle + labelToggle);
    if (mapToggle) {
      layers.push(
        {
          id: 'fill-' + LAYER_ID,
          type: 'fill',
          source: OFFLINE_RECORD_ID,
          paint: {
            'fill-color': LAYER_COLOUR,
            'fill-outline-color': LAYER_COLOUR,
            'fill-opacity': 0.5
          },
          minzoom: 0,
          layout: {
            visibility: 'visible'
          },
          stackLayer: LAYER_Z_FOREGROUND
        },
        {
          id: 'polygon-border-' + LAYER_ID,
          source: OFFLINE_RECORD_ID,
          type: 'line',
          paint: {
            'line-color': LAYER_COLOUR,
            'line-opacity': 1,
            'line-width': 3
          },
          minzoom: 0,
          layout: {
            visibility: 'visible'
          },
          stackLayer: LAYER_Z_FOREGROUND
        },
        {
          id: 'polygon-circle-' + LAYER_ID,
          source: OFFLINE_RECORD_ID,
          type: 'circle',
          paint: {
            'circle-color': LAYER_COLOUR,
            'circle-radius': 4
          },
          minzoom: 0,
          layout: {
            visibility: 'visible'
          },
          stackLayer: LAYER_Z_FOREGROUND
        },
        {
          id: 'label-' + LAYER_ID,
          source: OFFLINE_RECORD_ID,
          type: 'symbol',
          layout: {
            'text-field': [
              'format',
              ['get', 'short_id'],
              { 'font-scale': 0.9 },
              '\n',
              {},
              ['get', 'map_symbol'],
              { 'font-scale': 0.9 }
            ],
            'text-font': ['literal', [VECTOR_MAP_FONT_FACE]],
            'text-offset': [0, 0.6],
            'text-anchor': 'top',
            visibility: labelToggle ? 'visible' : 'none'
          },
          paint: {
            'text-color': 'black',
            'text-halo-color': 'white',
            'text-halo-width': 1,
            'text-halo-blur': 1
          },
          minzoom: 12,
          stackLayer: LAYER_Z_FOREGROUND
        }
      );
    }
    setLayers(layers);
  };

  useEffect(() => {
    buildSource();
  }, [serializedActivities]);

  useEffect(() => {
    buildLayers();
  }, [mapToggle, labelToggle]);

  return (
    <>
      {source && <SourceComponent mapReady={mapReady} id={OFFLINE_RECORD_ID} source={source} />}
      {layers?.map((layer) => (
        <LayerComponent mapReady={mapReady} key={layer.id} id={layer.id} layer={layer} />
      ))}
      {source && <SourceCleanupComponent mapReady={mapReady} id={OFFLINE_RECORD_ID} />}
    </>
  );
};

export default OfflineRecordsetLayer;
