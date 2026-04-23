import { RecordSetId } from 'interfaces/UserRecordSet';
import { useEffect, useState } from 'react';
import { useSelector } from 'utils/use_selector';
import { SourceComponent } from './SourceComponent';
import { LayerComponent } from './LayerComponent';
import { SourceCleanupComponent } from './SourceCleanupComponent';
import { findSpeciesCodes, getConcatenatedCodes } from 'utils/addActivity';
import { OfflineActivityRecord, OfflineActivitySyncState } from 'state/reducers/offlineActivity';
import { FeatureCollection, GeoJSON } from 'geojson';
import { SourceSpecification } from 'maplibre-gl';
import { Md5 } from 'ts-md5';
import {
  createBorderLayer,
  createCircleLayer,
  createFillLayer,
  createLabelLayer,
  getPaintBySchemeOrColor
} from '../functional/layer-definitions/reusable-layer-specifications';
import { LayerSpecificationWithStackingOrder } from '../functional/layers-hook';
import { ActivitySubtypesToType } from 'sharedAPI';

type PropTypes = {
  mapReady: boolean;
};

type SourceSpecificationType = {
  layers: LayerSpecificationWithStackingOrder[];
  sources: { [_: string]: SourceSpecification };
};
const OfflineRecordsetLayer = ({ mapReady }: PropTypes) => {
  const OFFLINE_RECORD_ID = RecordSetId.OfflineActivities;
  const LAYER_COLOUR = getPaintBySchemeOrColor('blue');

  const [definition, setDefinition] = useState<SourceSpecificationType>();

  const { mapToggle, labelToggle } = useSelector((state) => state.UserSettings.recordSets[OFFLINE_RECORD_ID]);
  const serializedActivities = useSelector((state) => state.OfflineActivity.serializedActivities);

  useEffect(() => {
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
          findSpeciesCodes(parsedData, (item as OfflineActivityRecord)?.record_type)
        );

        if (parsedData?.geom) {
          geometryList.push({
            ...parsedData.geom,
            properties: {
              short_id: parsedData.short_id,
              map_symbol: plantCodes,
              activity_subtype: parsedData.subtype,
              activity_id: parsedData,
              type: ActivitySubtypesToType[parsedData?.subtype]
            }
          });
        }
      } catch (error) {
        console.error(error);
      }
    });

    //Define Hashed IDs to updates rerender only when needed.
    const SOURCE_ID = OFFLINE_RECORD_ID + Md5.hashStr(JSON.stringify(geometryList));
    const LAYER_ID = 'offline-activity-' + Md5.hashStr(SOURCE_ID + mapToggle + labelToggle);

    setDefinition({
      sources: {
        [SOURCE_ID]: {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: geometryList } as FeatureCollection
        }
      },
      layers: [
        createFillLayer({
          layerId: LAYER_ID,
          sourceId: SOURCE_ID,
          color: LAYER_COLOUR
        }),
        createBorderLayer({
          layerId: LAYER_ID,
          sourceId: SOURCE_ID,
          color: LAYER_COLOUR
        }),
        createCircleLayer({
          layerId: LAYER_ID,
          sourceId: SOURCE_ID,
          color: LAYER_COLOUR
        }),
        createLabelLayer({
          layerId: LAYER_ID,
          sourceId: SOURCE_ID,
          visibility: labelToggle ? 'visible' : 'none'
        })
      ]
    });
  }, [labelToggle, mapToggle, serializedActivities]);

  return (
    <>
      {definition &&
        Object.entries(definition.sources).map(([id, value]) => (
          <SourceComponent mapReady={mapReady} key={id} id={id} source={value} />
        ))}
      {mapToggle &&
        definition?.layers?.map((layer) => (
          <LayerComponent mapReady={mapReady} key={layer.id} id={layer.id} layer={layer} />
        ))}
      {definition &&
        Object.keys(definition.sources).map((id) => <SourceCleanupComponent mapReady={mapReady} key={id} id={id} />)}
    </>
  );
};

export default OfflineRecordsetLayer;
