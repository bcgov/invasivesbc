import { IMediaItem } from './media';

/**
 * Jurisdiction post request body.
 *
 * @export
 * @class JurisdictionPostRequestBody
 */
export class JurisdictionPostRequestBody {
  jurisdictionPostBody: object;
  jurisdictionResponseBody: object;

  jurisdiction_id: string;

  geoJSONFeature: GeoJSON.Feature[];

  /**
   * Creates an instance of JurisdictionPostRequestBody.
   *
   * @param {*} [obj]
   * @memberof JurisdictionPostRequestBody
   */
  //NOSONAR
  constructor(object?: any) {
    // eslint-disable-next-line no-unused-vars
    const { ...obj } = object; // remove payload from obj to prevent infinite recursion

    // Add whole original object for auditing
    this.jurisdictionPostBody = {
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

    this.jurisdiction_id = (obj && obj.jurisdiction_id) || null;

    this.geoJSONFeature = (obj && obj.geometry) || [];
  }
}

/**
 * Jurisdiction search filter criteria object.
 *
 * @export
 * @class JurisdictionSearchCriteria
 */
export class JurisdictionSearchCriteria {
  search_feature: GeoJSON.Feature;

  /**
   * Creates an instance of JurisdictionSearchCriteria.
   *
   * @param {*} [obj]
   * @memberof JurisdictionSearchCriteria
   */
  //NOSONAR
  constructor(obj?: any) {
    this.search_feature = (obj && obj.search_feature) || null;
  }
}
