import { SEARCH_LIMIT_MAX } from '../constants/misc';
import { IMediaItem } from './media';

/**
 * PointOfInterest post request body.
 *
 * @export
 * @class PointOfInterestPostRequestBody
 */
export class PointOfInterestPostRequestBody {
  pontOfInterestPostBody: object;
  pontOfInterestResponseBody: object;

  pontOfInterest_type: string;
  pontOfInterest_subtype: string;

  pontOfInterest_data: object;
  pontOfInterest_type_data: object;
  pontOfInterest_subtype_data: object;

  received_timestamp: string;

  geoJSONFeature: GeoJSON.Feature[];

  mediaKeys: string[];

  /**
   * Creates an instance of PointOfInterestPostRequestBody.
   *
   * @param {*} [obj]
   * @memberof PointOfInterestPostRequestBody
   */
  constructor(obj?: any) {
    // Add whole original object for auditing
    this.pontOfInterestPostBody = {
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

    this.pontOfInterest_type = (obj && obj.pontOfInterest_type) || null;
    this.pontOfInterest_subtype = (obj && obj.pontOfInterest_subtype) || null;

    this.pontOfInterest_data = (obj && obj.form_data && obj.form_data.pontOfInterest_data) || null;
    this.pontOfInterest_type_data = (obj && obj.form_data && obj.form_data.pontOfInterest_type_data) || null;
    this.pontOfInterest_subtype_data = (obj && obj.form_data && obj.form_data.pontOfInterest_subtype_data) || null;

    this.received_timestamp = new Date().toISOString();

    this.geoJSONFeature = (obj && obj.geometry) || [];

    this.mediaKeys = (obj && obj.mediaKeys) || null;
  }
}

/**
 * PointOfInterest search filter criteria object.
 *
 * @export
 * @class PointOfInterestSearchCriteria
 */
export class PointOfInterestSearchCriteria {
  page: number;
  limit: number;

  pontOfInterest_type: string;
  pontOfInterest_subtype: string;

  date_range_start: Date;
  date_range_end: Date;

  search_feature: GeoJSON.Feature;

  /**
   * Creates an instance of PointOfInterestSearchCriteria.
   *
   * @param {*} [obj]
   * @memberof PointOfInterestSearchCriteria
   */
  constructor(obj?: any) {
    this.page = (obj && obj.page && this.setPage(obj.page)) || 0;
    this.limit = (obj && obj.limit && this.setLimit(obj.limit)) || SEARCH_LIMIT_MAX;

    this.pontOfInterest_type = (obj && obj.pontOfInterest_type) || null;
    this.pontOfInterest_subtype = (obj && obj.pontOfInterest_subtype) || null;

    this.date_range_start = (obj && obj.date_range_start) || null;
    this.date_range_end = (obj && obj.date_range_end) || null;

    this.search_feature = (obj && obj.search_feature) || null;
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
