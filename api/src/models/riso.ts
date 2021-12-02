/**
 * RISO post request body.
 *
 * @export
 * @class RISOPostRequestBody
 */
export class RISOPostRequestBody {
  risoPostBody: object;
  risoResponseBody: object;

  riso_id: string;

  geoJSONFeature: GeoJSON.Feature[];

  /**
   * Creates an instance of RISOPostRequestBody.
   *
   * @param {*} [obj]
   * @memberof RISOPostRequestBody
   */
  constructor(object?: any) {
    const { ...obj } = object;

    // Add whole original object for auditing
    this.risoPostBody = {
      ...obj,

      media: []
    };

    this.riso_id = (obj && obj.riso_id) || null;

    this.geoJSONFeature = (obj && obj.geometry) || [];
  }
}

/**
 * RISO search filter criteria object.
 *
 * @export
 * @class RISOSearchCriteria
 */
export class RISOSearchCriteria {
  search_feature: GeoJSON.Feature;

  /**
   * Creates an instance of RISOSearchCriteria.
   *
   * @param {*} [obj]
   */
  constructor(obj?: any) {
    this.search_feature = (obj && obj.search_feature) || null;
  }
}
