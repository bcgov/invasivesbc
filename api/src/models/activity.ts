import { SEARCH_LIMIT_MAX } from '../constants/misc';
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

  form_status: string;
  sync_status: string;
  created_by: string;
  updated_by?: string;

  review_status: string;
  reviewed_by: string;
  reviewed_at: string;

  species_positive: string[];
  species_negative: string[];

  jurisdiction: string[];

  /**
   * Creates an instance of ActivityPostRequestBody.
   *
   * @param {*} [obj]
   * @memberof ActivityPostRequestBody
   */
  //NOSONAR
  constructor(object?: any) {
    // eslint-disable-next-line no-unused-vars
    const { activity_payload, ...obj } = object; // remove payload from obj to prevent infinite recursion

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

    this.form_status = (obj && obj.form_status) || null;
    this.sync_status = (obj && obj.sync_status) || null;

    this.review_status = (obj && obj.review_status) || null;
    this.reviewed_by = (obj && obj.reviewed_by) || null;
    this.reviewed_at = (obj && obj.reviewed_at) || null;

    this.species_positive = obj?.species_positive || [];
    this.species_negative = obj?.species_negative || [];

    this.jurisdiction = obj?.jurisdiction || [];
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

  activity_type: string[];
  activity_subtype: string[];

  date_range_start: Date;
  date_range_end: Date;

  activity_ids: string[];

  search_feature: GeoJSON.Feature;

  user_roles: string[];

  column_names: string[];

  created_by: string[];

  review_status: string[];

  linked_id: string;

  species_positive: string[];
  species_negative: string[];
  form_status: string[];

  jurisdiction: string[];

  order: string[];
  hideTreatmentsAndMonitoring: boolean;

  /**
   * Creates an instance of ActivitySearchCriteria.
   *
   * @param {*} [obj]
   * @memberof ActivitySearchCriteria
   */
  //NOSONAR
  constructor(obj?: any) {
    this.page = (obj && obj.page && this.setPage(obj.page)) || 0;
    this.limit = (obj && obj.limit && this.setLimit(obj.limit)) || SEARCH_LIMIT_MAX;

    this.activity_type = (obj && obj.activity_type) || [];
    this.activity_subtype = (obj && obj.activity_subtype) || [];

    this.date_range_start = (obj && obj.date_range_start) || null;
    this.date_range_end = (obj && obj.date_range_end) || null;

    this.activity_ids = (obj && obj.activity_ids) || [];

    this.search_feature = (obj && obj.search_feature) || null;

    this.user_roles = (obj && obj.user_roles) || [];

    this.column_names = (obj && obj.column_names) || [];

    this.created_by = (obj && obj.created_by) || [];

    this.form_status = (obj && obj.form_status) || [];

    this.linked_id = obj?.linked_id || null;

    this.species_positive = obj?.species_positive || [];
    this.species_negative = obj?.species_negative || [];

    this.jurisdiction = obj?.jurisdiction || [];

    this.order = (obj && obj.order) || [];
    this.hideTreatmentsAndMonitoring = (obj && obj.hideTreatmentsAndMonitoring) || true;
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
