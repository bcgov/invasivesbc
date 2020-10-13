import { ActivityParentType, ActivityType } from 'constants/activities';
import { Feature } from 'geojson';
import { Photo } from 'components/photo/PhotoContainer';

/**
 * Activity search filter criteria.
 *
 * @export
 * @interface IActivitySearchCriteria
 */
export interface IActivitySearchCriteria {
  /**
   * The page of results to return. Starts at 0.
   *
   * @type {number}
   * @memberof IActivitySearchCriteria
   */
  page?: number;
  /**
   * The number of results to return.
   *@
   * @type {number}
   * @memberof IActivitySearchCriteria
   */
  limit?: number;
  /**
   * Activity type filter.
   *
   * @type {string}
   * @memberof IActivitySearchCriteria
   */
  activity_type?: string;
  /**
   * Activity sub type filter.
   *
   * @type {string}
   * @memberof IActivitySearchCriteria
   */
  activity_subtype?: string;
  /**
   * Date start filter. Defaults time to start of day.
   *
   * @type {Date}
   * @memberof IActivitySearchCriteria
   */
  date_range_start?: Date;
  /**
   * Date end filter. Defaults time to end of day.
   *
   * @type {Date}
   * @memberof IActivitySearchCriteria
   */
  date_range_end?: Date;
  /**
   * True if the respons should include associated media, false otherwise.
   *
   * @type {boolean}
   * @memberof IActivitySearchCriteria
   */
  include_media?: boolean;
  /**
   * GeoJSON bounding box.
   *
   * @type {GeoJSON.BBox}
   * @memberof IActivitySearchCriteria
   */
  bbox?: GeoJSON.BBox;
}

/**
 * Create activity endpoint post body.
 *
 * @export
 * @interface ICreateActivity
 */
export interface ICreateActivity {
  activity_type: ActivityParentType;
  activity_subtype: ActivityType;
  geometry: Feature[];
  media: Photo[];
  form_data: any;
}
