import IappRecord from 'interfaces/IappRecord';
import IappTableRow from 'interfaces/IappTableRecord';
import UserRecord from 'interfaces/UserRecord';
import { RecordSetType } from 'interfaces/UserRecordSet';
import { GeoJSONSourceSpecification } from 'maplibre-gl';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import { getSelectColumnsByRecordSetType } from 'state/sagas/map/dataAccess';

export enum IappRecordMode {
  Record = 'record',
  Row = 'row'
}
export interface RecordCacheDownloadRequestSpec {
  setId: string;
  API_BASE: string;
  idsToCache: string[];
}

/**
 * @desc Cached Metadata for Recordsets
 * @property { string } setID Recordset ID
 * @property { string[] } cachedIds collection of activity_ids in Recordset
 * @property { GeoJSONSourceSpecification } cachedGeoJSON  Cached Features for low map layers
 * @property { GeoJSONSourceSpecification } cachedCentroid Cached Points for high map layers
 */
export interface RecordSetCacheMetadata {
  setId: string;
  cachedIds?: string[];
  cachedGeoJson: GeoJSONSourceSpecification;
  cachedCentroid: GeoJSONSourceSpecification;
}

export interface RecordSetSourceMetadata {
  cachedGeoJson: GeoJSONSourceSpecification;
  cachedCentroid?: GeoJSONSourceSpecification;
}

export interface RecordCacheProgressCallbackParameters {
  setId: string;
  message: string;
  aborted: boolean;
  normalizedProgress: number;
  totalActivities: number;
  processedActivities: number;
}

abstract class RecordCacheService {
  protected constructor() {}

  static async getInstance(): Promise<RecordCacheService> {
    throw new Error('unimplemented in abstract base class');
  }

  abstract saveActivity(id: string, data: unknown): Promise<void>;

  abstract saveIapp(id: string, iappRecord: unknown, iappTableRow: unknown): Promise<void>;
  abstract deleteCachedRecordsFromIds(idsToDelete: string[], recordSetType: RecordSetType): Promise<void>;
  abstract loadActivity(id: string): Promise<unknown>;
  abstract loadIapp(id: string, type: IappRecordMode): Promise<IappRecord | IappTableRow>;

  abstract fetchPaginatedCachedIappRecords(
    recordSetIdList: string[],
    page: number,
    limit: number
  ): Promise<IappRecord[]>;
  abstract fetchPaginatedCachedRecords(recordSetIdList: string[], page: number, limit: number): Promise<UserRecord[]>;

  abstract loadIappRecordsetSourceMetadata(ids: string[]): Promise<RecordSetSourceMetadata>;
  abstract loadRecordsetSourceMetadata(ids: string[]): Promise<RecordSetSourceMetadata>;

  async downloadIapp(
    spec: RecordCacheDownloadRequestSpec,
    progressCallback?: (currentProgress: RecordCacheProgressCallbackParameters) => void
  ): Promise<void> {
    for (const id of spec.idsToCache) {
      const authorization = await getCurrentJWT();
      const [iappRecord, tableRow] = await Promise.all([
        fetch(
          `${spec.API_BASE}/api/points-of-interest/?query={"iappSiteID":"${id}","isIAPP":true,"site_id_only":false}`,
          { headers: { authorization } }
        ).then(async (data) => await data.json()),
        fetch(`${spec.API_BASE}/api/v2/IAPP/`, {
          method: 'POST',
          headers: { authorization, 'Content-type': 'application/json' },
          body: JSON.stringify({
            filterObjects: [
              {
                limit: 1,
                recordSetType: RecordSetType.IAPP,
                selectColumns: getSelectColumnsByRecordSetType(RecordSetType.IAPP),
                tableFilters: [
                  {
                    field: 'site_id',
                    filter: id,
                    filterType: 'tableFilter',
                    operator: 'CONTAINS',
                    operator2: 'AND'
                  }
                ]
              }
            ]
          })
        }).then(async (data) => await data.json())
      ]);
      await this.saveIapp(id.toString(), iappRecord, tableRow);
    }
  }

  async download(
    spec: RecordCacheDownloadRequestSpec,
    progressCallback?: (currentProgress: RecordCacheProgressCallbackParameters) => void
  ): Promise<void> {
    for (const id of spec.idsToCache) {
      const rez = await fetch(`${spec.API_BASE}/api/activity/${id}`, {
        headers: {
          Authorization: await getCurrentJWT()
        }
      });
      await this.saveActivity(id, await rez.json());
    }
  }
}

export { RecordCacheService };
