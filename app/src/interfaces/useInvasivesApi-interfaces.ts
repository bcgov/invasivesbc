import { ActivityType, ActivitySubtype } from 'constants/activities';
import { Feature } from 'geojson';

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
   * GeoJSON feature (of type polygon) to search in.
   *
   * @type {Feature}
   * @memberof IActivitySearchCriteria
   */
  search_feature?: Feature;
}

/**
 * Create activity endpoint post body.
 *
 * @export
 * @interface ICreateActivity
 */
export interface ICreateActivity {
  activity_type: ActivityType;
  activity_subtype: ActivitySubtype;
  geometry: Feature[];
  media: IMedia[];
  form_data: any;
}

/**
 * Media object.
 *
 * @export
 * @interface IMedia
 */
export interface IMedia {
  media_date?: string;
  description?: string;
  file_name: string;
  encoded_file: string;
}
