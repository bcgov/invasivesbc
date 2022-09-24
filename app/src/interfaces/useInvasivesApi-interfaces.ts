import { FeatureCollection } from '@turf/turf';
import { PointOfInterestSubtype, PointOfInterestType } from 'constants/pointsOfInterest';
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
   * Note: Most UI's start at page 1, but this filter starts at page 0, so adjust accordingly when converting between
   * the two.
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
   * Columns to return.
   *
   * @type {string[]}
   * @memberof IActivitySearchCriteria
   */
  column_names?: string[];
  /**
   * Activity type filter.
   *
   * @type {string[]}
   * @memberof IActivitySearchCriteria
   */
  activity_type?: string[];
  /**
   * Activity sub type filter.
   *
   * @type {string[]}
   * @memberof IActivitySearchCriteria
   */
  activity_subtype?: string[];
  /**
   * Date start filter. Defaults time to start of day.
   *
   * @type {string} iso date string
   * @memberof IActivitySearchCriteria
   */
  date_range_start?: string;
  /**
   * Date end filter. Defaults time to end of day.
   *
   * @type {string} iso date string
   * @memberof IActivitySearchCriteria
   */
  date_range_end?: string;
  /**
   * List of IDs to limit search within
   *
   * @type {string[]}
   * @memberof IActivitySearchCriteria
   */
  activity_ids?: string[];
  /**
   * GeoJSON feature (of type polygon) to search in.
   *
   * @type {FeatureCollection}
   * @memberof IActivitySearchCriteria
   */
  search_feature?: FeatureCollection;
  /**
   * Activity requested return order.
   *
   * @type {object[]}
   * @memberof IActivitySearchCriteria
   */
  order?: object[];
  /**
   * Identifier of the original author of the activity
   *
   * @type {string}
   * @memberof IActivitySearchCriteria
   */
  created_by?: string[];
  /**
   * Identifier of the requesting user's role
   *
   * @type {string}
   * @memberof IActivitySearchCriteria
   */
  user_roles?: string[];
  /**
   * Review status of the record
   *
   * @type {string}
   * @memberof IActivitySearchCriteria
   */
  form_status?: string[];
  /**
   * Search for records linked to a particular ID
   *
   * @type {string}
   * @memberof IActivitySearchCriteria
   */
  linked_id?: string;
  /**
   * List of species positively occurring in the activity to partially match
   *
   * @type {string}
   * @memberof IActivitySearchCriteria
   */
  species_positive?: string[];
  /**
   * List of species negatively occurring in the activity to partially match
   *
   * @type {string}
   * @memberof IActivitySearchCriteria
   */
  species_negative?: string[];
}

/**
 * Jurisdiction search filter criteria.
 *
 * @export
 * @interface IJurisdictionSearchCriteria
 */
export interface IJurisdictionSearchCriteria {
  /**
   * GeoJSON feature (of type polygon) to search in.
   *
   * @type {Feature}
   * @memberof IJurisdictionSearchCriteria
   */
  search_feature?: Feature;
}

/**
 * RISO search filter criteria.
 */
export interface IRisoSearchCriteria {
  /**
   * GeoJSON feature (of type polygon)  to search in.
   *
   * @type {Feature}
   * @memberof IRisoSearchCriteria
   */
  search_feature?: Feature;
}

/**
 * Create or Update activity endpoint post body.
 *
 * @export
 * @interface ICreateOrUpdateActivity
 */
export interface ICreateOrUpdateActivity {
  version?: string;
  activity_id: string;
  activity_type: any;
  activity_subtype: any;
  received_timestamp?: string;
  deleted_timestamp?: string;
  media_keys?: any;
  biogeoclimatic_zones?: any;
  regional_invasive_species_organization_areas?: any;
  invasive_plant_management_areas?: any;
  ownership?: any;
  regional_districts?: any;
  flnro_districts?: any;
  moti_districts?: any;
  elevation?: any;
  well_proximity?: any;
  utm_zone?: any;
  utm_northing?: any;
  utm_easting?: any;
  albers_northing?: any;
  albers_easting?: any;
  activity_incoming_data?: any;
  reviewed_by?: any;
  reviewed_at?: any;

  created_timestamp: string;

  geometry: Feature[];
  media?: IMedia[];
  form_data: any;

  sync_status?: string;
  form_status?: string;
  created_by?: string;
  review_status?: string;
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

/**
 * PointOfInterest search filter criteria.
 *
 * @export
 * @interface IJurisdictionSearchCriteria
 */
export interface IJurisdictionSearchCriteria {
  /**
   * GeoJSON feature (of type polygon) to search in.
   *
   * @type {Feature}
   * @memberof IJurisdictionSearchCriteria
   */
  search_feature?: Feature;
}

/**
 * PointOfInterest search filter criteria.
 *
 * @export
 * @interface IPointOfInterestSearchCriteria
 */
export interface IPointOfInterestSearchCriteria {
  /**
   * Will only grab geos from api or local db
   *
   * @type {boolean}
   * @memberof IPointOfInterestSearchCriteria
   */
  geoOnly?: boolean;
  /**
   * The page of results to return. Starts at 0.
   *
   * @type {number}
   * @memberof IPointOfInterestSearchCriteria
   */
  page?: number;
  /**
  /**
   * The number of results to return.
   *@
   * @type {number}
   * @memberof IPointOfInterestSearchCriteria
   */
  limit?: number;
  /**
   * PointOfInterest type filter.
   *
   * @type {string}
   * @memberof IPointOfInterestSearchCriteria
   */
  point_of_interest_type?: string;
  /**
   * PointOfInterest sub type filter.
   *
   * @type {string}
   * @memberof IPointOfInterestSearchCriteria
   */
  point_of_interest_subtype?: string;
  /**
   * Date start filter. Defaults time to start of day.
   *
   * @type {Date}
   * @memberof IPointOfInterestSearchCriteria
   */
  date_range_start?: Date;
  /**
   * Date end filter. Defaults time to end of day.
   *
   * @type {Date}
   * @memberof IPointOfInterestSearchCriteria
   */
  date_range_end?: Date;
  /**
   * Point of Interest ids filter.
   *
   * @type {string[]}
   * @memberof IPointOfInterestSearchCriteria
   */
  point_of_interest_ids?: string[];
  /**
   * GeoJSON feature collection (of types polygon) to search in.
   *
   * @type {FeatureCollection}
   * @memberof IPointOfInterestSearchCriteria
   */
  search_feature?: FeatureCollection;
  /**
   * Point of Interest requested return order.
   *
   * @type {object[]}
   * @memberof IPointOfInterestSearchCriteria
   */
  order?: object[];
  /**
   * Point of Interest - should query be local or server
   *
   * @type {boolean}
   * @memberof IPointOfInterestSearchCriteria
   */
  online?: boolean;
  /**
   * Idenitifier of the original author of the point of interest
   *
   * @type {string}
   * @memberof IPointOfInterestSearchCriteria
   */
  created_by?: string;
  /**
   * Identifies if this is an IAPP record
   *
   * @type {boolean}
   * @memberof IPointOfInterestSearchCriteria
   */
  isIAPP?: boolean;
  /**
   * Site ID associated to the specific point_of_interest
   *
   * @type {string}
   * @memberof IPointOfInterestSearchCriteria
   */
  iappSiteID?: string;
  /**
   * List of jurisdictions in the point of interest to partially match
   *
   * @type {string}
   * @memberof IPointOfInterestSearchCriteria
   */
   jurisdiction?: string[];
  /**
   * List of species positively occurring in the point of interest to partially match
   *
   * @type {string}
   * @memberof IPointOfInterestSearchCriteria
   */
  species_positive?: string[];
  /**
   * List of species negatively occurring in the point of interest to partially match
   *
   * @type {string}
   * @memberof IPointOfInterestSearchCriteria
   */
  species_negative?: string[];
}

/**
 * MetabaseQuery search filter criteria.
 *
 * @export
 * @interface IMetabaseQuerySearchCriteria
 */
export interface IMetabaseQuerySearchCriteria {
  /**
   * The id of a corresponding Metabase Query to search for.
   *
   * @type {number}
   * @memberof IMetabaseQuerySearchCriteria
   */
  metabaseQueryId?: number;
  /**
   * GeoJSON feature (of type polygon) to search in.
   *
   * @type {Feature}
   * @memberof IMetabaseQuerySearchCriteria
   */
  search_feature?: Feature;
}

/**
 * Create Metabase Query post body
 *
 * @export
 * @interface ICreateMetabaseQuery
 */
export interface ICreateMetabaseQuery {
  name?: string;
  description?: string;
  activity_ids?: string[];
  point_of_interest_ids?: string[];
}

/**
 * Create point_of_interest endpoint post body.
 *
 * @export
 * @interface ICreatePointOfInterest
 */
export interface ICreatePointOfInterest {
  point_of_interest_type: PointOfInterestType;
  point_of_interest_subtype: PointOfInterestSubtype;
  geometry: Feature[];
  media: IMedia[];
  form_data: any;
}

/**
 * Supported search sort directions.
 *
 * @export
 * @enum {number}
 */
export enum SORT_DIRECTION {
  ASC = 'ASC',
  DESC = 'DESC'
}
