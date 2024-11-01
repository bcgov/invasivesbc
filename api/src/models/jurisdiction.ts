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
