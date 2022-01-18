import { SEARCH_LIMIT_MAX } from '../constants/misc';
import { IMediaItem } from './media';

/**
 * PointOfInterest post request body.
 *
 * @export
 * @class PointOfInterestPostRequestBody
 */
export class PointOfInterestPostRequestBody {
  pointOfInterestPostBody: object;
  pointOfInterestResponseBody: object;

  pointOfInterest_type: string;
  pointOfInterest_subtype: string;

  pointOfInterest_data: object;
  pointOfInterest_type_data: object;
  pointOfInterest_subtype_data: object;

  species_positive: string[];

  received_timestamp: string;

  geoJSONFeature: GeoJSON.Feature[];

  mediaKeys: string[];

  /**
   * Creates an instance of PointOfInterestPostRequestBody.
   *
   * @param {*} [obj]
   * @memberof PointOfInterestPostRequestBody
   */
  //NOSONAR
  constructor(obj?: any) {
    // Add whole original object for auditing
    this.pointOfInterestPostBody = {
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

    this.pointOfInterest_type = obj?.pointOfInterest_type || obj?.point_of_interest_type || null;
    this.pointOfInterest_subtype = obj?.pointOfInterest_subtype || obj?.point_of_interest_subtype || null;

    this.pointOfInterest_data = obj?.form_data?.pointOfInterest_data || obj?.form_data?.point_of_interest_data || null;
    this.pointOfInterest_type_data =
      obj?.form_data?.pointOfInterest_type_data || obj?.form_data?.point_of_interest_type_data || null;
    this.pointOfInterest_subtype_data =
      obj?.form_data?.pointOfInterest_subtype_data || obj?.form_data?.point_of_interest_subtype_data || null;

    this.species_positive = obj?.species_positive || [];

    this.received_timestamp = new Date().toISOString();

    this.geoJSONFeature = obj?.geometry || [];

    this.mediaKeys = obj?.mediaKeys || null;
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

  pointOfInterest_type: string;
  pointOfInterest_subtype: string;
  iappType: string;
  isIAPP: boolean;
  iappSiteID: string;
  date_range_start: Date;
  date_range_end: Date;

  point_of_interest_ids: string[];
  species_positive: string[];

  search_feature: GeoJSON.Feature;

  column_names: string[];

  order: string[]; // ["columnname1 ASC", "columnname2 DESC"]

  /**
   * Creates an instance of PointOfInterestSearchCriteria.
   *
   * @param {*} [obj]
   * @memberof PointOfInterestSearchCriteria
   */
  //NOSONAR
  constructor(obj?: any) {
    this.page = (obj && obj.page && this.setPage(obj.page)) || 0;
    this.limit = (obj && obj.limit && this.setLimit(obj.limit)) || SEARCH_LIMIT_MAX;

    this.pointOfInterest_type = (obj && obj.pointOfInterest_type) || null;
    this.pointOfInterest_subtype = (obj && obj.pointOfInterest_subtype) || null;
    this.iappType = (obj && obj.iappType) || null;
    this.isIAPP = (obj && obj.isIAPP) || false;
    this.iappSiteID = (obj && obj.iappSiteID) || null;
    this.point_of_interest_ids = (obj && obj.point_of_interest_ids) || [];
    this.species_positive = obj?.species_positive || [];

    this.date_range_start = (obj && obj.date_range_start) || null;
    this.date_range_end = (obj && obj.date_range_end) || null;

    this.search_feature = (obj && obj.search_feature) || null;

    this.column_names = (obj && obj.column_names) || [];

    this.order = (obj && obj.order) || [];
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
