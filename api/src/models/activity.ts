import { SEARCH_LIMIT_MAX, SORT_DIRECTION } from '../constants/misc';
import { IMediaItem } from './media';

/**
 * Activity post request body.
 *
 * @export
 * @class ActivityPostRequestBody
 */
export class ActivityPostRequestBody {
  activityPostBody: object;
  activityResponseBody: object;

  activity_id: string;

  activity_type: string;
  activity_subtype: string;

  activity_data: object;
  activity_type_data: object;
  activity_subtype_data: object;

  created_timestamp: string; // ISO string
  received_timestamp: string;
  deleted_timestamp: string; // ISO string

  geoJSONFeature: GeoJSON.Feature[];

  mediaKeys: string[];

  /**
   * Creates an instance of ActivityPostRequestBody.
   *
   * @param {*} [obj]
   * @memberof ActivityPostRequestBody
   */
  constructor(obj?: any) {
    // Add whole original object for auditing
    this.activityPostBody = {
      ...obj,
      // Strip out any media base64 strings which would convolute the record
      media:
        (obj.media &&
          obj.media.map((item: IMediaItem) => {
            delete item.encoded_file;
            return item;
          })) ||
        []
    };

    this.activity_id = (obj && obj.activity_id) || null;

    this.activity_type = (obj && obj.activity_type) || null;
    this.activity_subtype = (obj && obj.activity_subtype) || null;

    this.activity_data = (obj && obj.form_data && obj.form_data.activity_data) || null;
    this.activity_type_data = (obj && obj.form_data && obj.form_data.activity_type_data) || null;
    this.activity_subtype_data = (obj && obj.form_data && obj.form_data.activity_subtype_data) || null;

    this.created_timestamp = (obj && obj.created_timestamp) || null;
    this.received_timestamp = new Date().toISOString();
    this.deleted_timestamp = (obj && obj.deleted_timestamp) || null;

    this.geoJSONFeature = (obj && obj.geometry) || [];

    this.mediaKeys = (obj && obj.mediaKeys) || null;
  }
}

/**
 * Activity search filter criteria object.
 *
 * @export
 * @class ActivitySearchCriteria
 */
export class ActivitySearchCriteria {
  page: number;
  limit: number;
  sort_by: string;
  sort_direction: string;

  activity_type: string[];
  activity_subtype: string[];

  date_range_start: Date;
  date_range_end: Date;

  activity_ids: string[];

  search_feature: GeoJSON.Feature;

  column_names: string[];

  /**
   * Creates an instance of ActivitySearchCriteria.
   *
   * @param {*} [obj]
   * @memberof ActivitySearchCriteria
   */
  constructor(obj?: any) {
    this.page = (obj && obj.page && this.setPage(obj.page)) || 0;
    this.limit = (obj && obj.limit && this.setLimit(obj.limit)) || SEARCH_LIMIT_MAX;
    this.sort_by = (obj && obj.sort_by) || '';
    this.sort_direction = (obj && obj.sort_direction) || SORT_DIRECTION.ASC;

    this.activity_type = (obj && obj.activity_type) || [];
    this.activity_subtype = (obj && obj.activity_subtype) || [];

    this.date_range_start = (obj && obj.date_range_start) || null;
    this.date_range_end = (obj && obj.date_range_end) || null;

    this.activity_ids = (obj && obj.activity_ids) || [];

    this.search_feature = (obj && obj.search_feature) || null;

    this.column_names = (obj && obj.column_names) || [];
  }

  setPage(page: number): number {
    if (!page || page < 0) {
      return 0;
    }

    return page;
  }

  setLimit(limit: number): number {
    if (!limit || limit < 0) {
      return 25;
    }

    if (limit > SEARCH_LIMIT_MAX) {
      return SEARCH_LIMIT_MAX;
    }

    return limit;
  }
}
