import { Http } from '@capacitor-community/http';
import qs from 'qs';
import { useContext } from 'react';
import { IBatchUploadRequest } from '../components/batch-upload/BatchUploader';
import { DocType } from '../constants/database';
import { DatabaseContext, query, QueryType, upsert, UpsertType } from '../contexts/DatabaseContext';
import { ErrorContext } from 'contexts/ErrorContext';
import {
  IActivitySearchCriteria,
  ICreateMetabaseQuery,
  ICreateOrUpdateActivity,
  IJurisdictionSearchCriteria,
  IMetabaseQuerySearchCriteria,
  IPointOfInterestSearchCriteria,
  IRisoSearchCriteria
} from '../interfaces/useInvasivesApi-interfaces';
import { IShapeUploadRequest } from '../components/map-buddy-components/KMLShapesUpload';
import { useSelector } from 'state/utilities/use_selector';
import { selectConfiguration } from "../state/reducers/configuration";
import { selectAuthHeaders } from "../state/reducers/auth";


/**
 * Returns a set of supported api methods.
 *
 * @return {object} object whose properties are supported api methods.
 */
export const useInvasivesApi = () => {
  const databaseContext = useContext(DatabaseContext);
  const errorContext = useContext(ErrorContext);
//  const { API_BASE, DEBUG } = useSelector(selectConfiguration);
const DEBUG = false;
 const API_BASE = 'https://api-dev-invasivesbci.apps.silver.devops.gov.bc.ca'
  const requestHeaders = useSelector(selectAuthHeaders);

  const getRequestOptions = async () => {
    return {
      baseUrl: API_BASE,
      headers: { 'Access-Control-Allow-Origin': '*', Authorization: requestHeaders.authorization }
    };
  };

  const checkForErrors = (response: any, status?: any, url?: any) => {
    if (response.code > 201) {
      errorContext.pushError({
        message: response.message
          ? response.message
          : "We're not sure what happened there. Try again in a few minutes.",
        code: status ? status : 500,
        namespace: process.env.REACT_APP_REAL_NODE_ENV !== 'production' && url
      });
    }
  };

  /**
   * Fetch*
   activities by search criteria.
   * @param {activitiesSearchCriteria} activitiesSearchCriteria
   * @return {*}  {Promise<any>}
   */
  const getActivities = async (activitiesSearchCriteria: IActivitySearchCriteria): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      method: 'POST',
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      url: options.baseUrl + `/api/activities/`,
      data: activitiesSearchCriteria
    });

    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('getActivities', data);
    }

    /****************Begining of GeoJSON*****************/
    /**
     * This logic has optimized the data output into the essentials
     * for Leaflet to consume. Will hopefully replace the default
     * output data.
     */
    /*const geojsonData = await Http.request({
      method: 'POST',
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      url: options.baseUrl + `/api/activities-lean/`,
      data: activitiesSearchCriteria
    });

    const features = geojsonData.data.rows.map((d) => d.geojson);
    const geojson = {
      type: 'FeatureCollection',
      features: features
    };
    console.log('Activities as geojson', geojson);
    /******************End of GeoJSON*******************/

    return { rows: data.result, count: data.count };
  };

  /**
   * Fetch*
   activities (lean) by search criteria.
   * @param {activitiesSearchCriteria} activitiesSearchCriteria
   * @return {*}  {Promise<any>}
   */
  const getActivitiesLean = async (activitiesSearchCriteria: IActivitySearchCriteria): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      method: 'POST',
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      url: options.baseUrl + `/api/activities-lean/`,
      data: activitiesSearchCriteria
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('getActivitiesLean', data);
    }
    return data.result;
  };

  /**
   * Fetch*
   jurisdictions by search criteria.
   * @param {jurisdictionsSearchCriteria} jurisdictionsSearchCriteria
   * @return {*}  {Promise<any>}
   */
  const getJurisdictions = async (jurisdictionsSearchCriteria: IJurisdictionSearchCriteria): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      method: 'POST',
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      url: options.baseUrl + `/api/jurisdictions/`,
      data: jurisdictionsSearchCriteria
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('getJurisdictions', data);
    }
    return data.result;
  };

  /**
   * Fetch RISO by search criteria.
   *
   * @param {risoSearchCriteria} risoSearchCriteria
   * @returns {*} (Promise<any>)
   */
  const getRISOs = async (risoSearchCriteria: IRisoSearchCriteria): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      method: 'POST',
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      url: options.baseUrl + `/api/riso/`,
      data: risoSearchCriteria
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('getRISOs', data);
    }

    return data.result;
  };

  /**
   * Delete activities by ids.
   *
   * @param {string[]} activityIds
   * @return {*}  {Promise<any>}
   */
  const deleteActivities = async (activityIds: string[]): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      method: 'DELETE',
      url: options.baseUrl + `/api/activities?` + qs.stringify({ id: activityIds }),
      headers: { ...options.headers, 'Content-Type': 'application/json' }
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('deleteActivities', data);
    }

    return data.result;
  };

  /**
   * Undelete activities by ids.
   *
   * @param {string[]} activityIds
   * @return {*}  {Promise<any>}
   */
  const undeleteActivities = async (activityIds: string[]): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      method: 'POST',
      url: options.baseUrl + `/api/deleted/activities?` + qs.stringify({ id: activityIds }),
      headers: { ...options.headers, 'Content-Type': 'application/json' }
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('undeleteActivities', data);
    }

    return data.result;
  };

  /**
   * Fetch roles
   * @return {*}  {Promise<any>}
   */
  const getRoles = async (bearer?: string): Promise<any> => {
    const options = await getRequestOptions();

    if (bearer) {
      options.headers.Authorization = `Bearer ${bearer}`;
    }
    const { data, status, url } = await Http.request({
      method: 'GET',
      url: options.baseUrl + `/api/roles/`,
      headers: { ...options.headers, 'Content-Type': 'application/json' }
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('getRoles', data);
    }

    return data.result;
  };

  /**
   * Fetch points of interest by search criteria.
   *
   * @param {pointsOfInterestSearchCriteria} pointsOfInterestSearchCriteria
   * @return {*}  {Promise<any>}
   */
  const getPointsOfInterest = async (pointsOfInterestSearchCriteria: IPointOfInterestSearchCriteria): Promise<any> => {
    const options = await getRequestOptions();

    const { data, status, url } = await Http.request({
      method: 'POST',
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      url: options.baseUrl + `/api/points-of-interest/`,
      data: pointsOfInterestSearchCriteria
    });

    checkForErrors(data, status, url);

    if (DEBUG) {
      console.log('getPointsOfInterest', data);
    }

    /****************Begining of GeoJSON*****************/
    /**
     * This logic has optimized the data output into the essentials
     * for Leaflet to consume. Will hopefully replace the default
     * output data.
     const geojsonData = await Http.request({
      method: 'POST',
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      url: options.baseUrl + `/api/points-of-interest-lean/`,
      data: pointsOfInterestSearchCriteria
    });
     */

    /*const features = geojsonData.data.rows.map((d) => d.geojson);
    const geojson = {
      type: 'FeatureCollection',
      features: features
    };
    console.log('Observations as geojson', geojson);
    /******************End of GeoJSON*******************/

    return data.result;
  };

  const getAccessRequestData = async (accessRequest: any): Promise<any> => {
    const options = await getRequestOptions();

    const { data, status, url } = await Http.request({
      method: 'POST',
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      url: options.baseUrl + `/api/access-request-read`,
      data: accessRequest
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('getAccessRequestData', data);
    }

    return data.result;
  };

  const getAccessRequests = async (): Promise<any> => {
    const options = await getRequestOptions();

    const { data, status, url } = await Http.request({
      method: 'GET',
      url: options.baseUrl + `/api/access-request/`,
      headers: { ...options.headers, 'Content-Type': 'application/json' }
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('getAccessRequests', data);
    }

    return data.result;
  };

  const approveAccessRequests = async (accessRequests: any[]): Promise<any> => {
    const options = await getRequestOptions();

    const { data, status, url } = await Http.request({
      method: 'POST',
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      url: options.baseUrl + `/api/access-request`,
      data: { approvedAccessRequests: accessRequests }
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('approveAccessRequests', data);
    }

    return data.result;
  };

  const declineAccessRequest = async (accessRequest: any): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      method: 'POST',
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      url: options.baseUrl + `/api/access-request`,
      data: { declinedAccessRequest: accessRequest }
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('declineAccessRequest', data);
    }

    return data.result;
  };

  const revokeRoleFromUser = async (userId: number, roleId: number): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      method: 'DELETE',
      url: options.baseUrl + `/api/user-access`,
      data: { userId: userId, roleId: roleId },
      headers: { ...options.headers, 'Content-Type': 'application/json' }
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('revokeRoleFromUser', data);
    }

    return data.result;
  };

  const getRolesForUser = async (userId: string, bearer?: string): Promise<any> => {
    const options = await getRequestOptions();
    if (bearer) {
      options.headers.Authorization = `Bearer ${bearer}`;
    }
    const { data, status, url } = await Http.request({
      method: 'GET',
      url: options.baseUrl + `/api/user-access?userId=${userId}`,
      headers: { ...options.headers, 'Content-Type': 'application/json' }
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('getRolesForUser', data);
    }

    return data.result;
  };

  const getUsersForRole = async (roleId: string): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      method: 'GET',
      url: options.baseUrl + `/api/user-access?roleId=${roleId}`,
      headers: { ...options.headers, 'Content-Type': 'application/json' }
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('getUsersForRole', data);
    }

    return data.result;
  };

  const batchGrantRoleToUser = async (userIds: number[], roleId: number): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      method: 'POST',
      url: options.baseUrl + `/api/user-access`,
      data: { userIds: userIds, roleId: roleId },
      headers: { ...options.headers, 'Content-Type': 'application/json' }
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('batchGrantRoleToUser', data);
    }

    return data.result;
  };

  const submitAccessRequest = async (accessRequest: any): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      method: 'POST',
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      url: options.baseUrl + `/api/access-request`,
      data: { newAccessRequest: accessRequest }
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('submitAccessRequest', data);
    }

    return data.result;
  };

  const submitUpdateRequest = async (updateRequest: any): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      method: 'POST',
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      url: options.baseUrl + `/api/update-request`,
      data: { newUpdateRequest: updateRequest }
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('submitUpdateRequest', data);
    }

    return data.result;
  };

  const getUpdateRequests = async (): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      method: 'GET',
      url: options.baseUrl + `/api/update-request/`,
      headers: { ...options.headers, 'Content-Type': 'application/json' }
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('getUpdateRequests', data);
    }

    return data.result;
  };

  const declineUpdateRequest = async (updateRequest) => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      method: 'POST',
      url: options.baseUrl + `/api/update-request`,
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      data: { declinedUpdateRequest: updateRequest }
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('declineUpdateRequest', data);
    }

    return data.result;
  };

  const approveUpdateRequests = async (updateRequest) => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      method: 'POST',
      url: options.baseUrl + `/api/update-request`,
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      data: { approvedUpdateRequests: updateRequest }
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('approveUpdateRequests', data);
    }

    return data.result;
  };

  const getFundingAgencies = async (): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      method: 'GET',
      headers: { ...options.headers },
      url: options.baseUrl + `/api/agency_codes`
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('getFundingAgencies', data);
    }

    return data.result;
  };

  const getEmployers = async (): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      method: 'GET',
      headers: { ...options.headers },
      url: options.baseUrl + `/api/employer_codes`
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('getEmployers', data);
    }

    return data.result;
  };

  /**
   * Fetch points of interest by search criteria.
   *
   * @param {pointsOfInterestSearchCriteria} pointsOfInterestSearchCriteria
   * @return {*}  {Promise<any>}
   */
  const getPointsOfInterestLean = async (
    pointsOfInterestSearchCriteria: IPointOfInterestSearchCriteria
  ): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      method: 'POST',
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      url: options.baseUrl + `/api/points-of-interest-lean/`,
      data: pointsOfInterestSearchCriteria
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('getPointsOfInterestLean', data);
    }

    return data.result;
  };

  /**
   * Fetch activities or points of interest returned by Metabase queries corresponding to an id.
   *
   * @param {metabaseQueriesSearchCriteria} metabaseQueriesSearchCriteria
   * @return {*}  {Promise<any>}
   */
  const getMetabaseQueryResults = async (metabaseQueriesSearchCriteria: IMetabaseQuerySearchCriteria): Promise<any> => {
    const options = await getRequestOptions();
    let activities, points_of_interest;
    try {
      const { data } = await Http.request({
        headers: { ...options.headers },
        method: 'GET',
        url: options.baseUrl + `/api/metabase-query/${metabaseQueriesSearchCriteria.metabaseQueryId}`
      });
      if (data?.activity_ids?.length) {
        activities = await getActivities({
          activity_ids: data.activity_ids,
          search_feature: metabaseQueriesSearchCriteria.search_feature
        });
      }
      if (data?.point_of_interest_ids?.length) {
        points_of_interest = await getPointsOfInterest({
          point_of_interest_ids: data.point_of_interest_ids,
          search_feature: metabaseQueriesSearchCriteria.search_feature
        });
      }
    } catch {
      console.log('Metabase API call failed.');
    }

    return {
      // TODO Note: api code smell that activities and points-of-interest dont have same response format
      activities: activities?.rows?.length ? activities.rows : [],
      points_of_interest: points_of_interest?.length ? points_of_interest.rows : [],
      activities_count: activities?.count,
      points_of_interest_count: points_of_interest?.count
    };
  };

  /**
   * Create Metabase Query from a list of activity ids and point of interest ids
   *
   * @param {metabaseQueriesCreateCriteria} ICreateMetabaseQuery
   * @return {*}  {Promise<any>}
   */
  const createMetabaseQuery = async (metabaseQueriesCreateCriteria: ICreateMetabaseQuery): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      method: 'POST',
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      url: options.baseUrl + `/api/metabase-query`,
      data: metabaseQueriesCreateCriteria
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('createMetabaseQuery', data);
    }

    return data.result;
  };

  /**
   * Fetch list of all Metabase query options (collections/questions/cards) to present to the user dropdown
   *
   * @return {*}  {Promise<any>}
   */
  const getMetabaseQueryOptions = async (): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      headers: { ...options.headers },
      method: 'GET',
      url: options.baseUrl + `/api/metabase-query`
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('getMetabaseQueryOptions', data);
    }

    return data.options;
  };

  const getGridItemsThatOverlapPolygon = async (
    geometry: string,
    largeGrid: string,
    largeGrid_item_ids?: number[]
  ): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      method: 'POST',
      data: {
        geometry: geometry,
        largeGrid: largeGrid,
        largeGrid_item_ids: largeGrid_item_ids ? largeGrid_item_ids : []
      },
      url: options.baseUrl + `/api/bc-grid/bcGrid`
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('getGridItemsThatOverlapPolygon', data);
    }

    return data.result;
  };

  /**
   * Fetch a signle activity by its id.
   *
   * @param {string} activityId
   * @return {*}  {Promise<any>}
   */
  const getActivityById = async (activityId: string): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      headers: { ...options.headers },
      method: 'GET',
      url: options.baseUrl + `/api/activity/${activityId}`
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('getActivityById', data);
    }

    return data;
  };

  /**
   * Fetch media items.
   *
   * @param {string[]} mediaKeys
   * @return {*}  {Promise<any>}
   */
  const getMedia = async (mediaKeys: string[]): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      headers: { ...options.headers },
      method: 'GET',
      url: options.baseUrl + `/api/media?` + qs.stringify({ key: mediaKeys })
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('getMedia', data);
    }

    return data.result;
  };

  /**
   * Fetch application_users.
   *
   * @return {*}  {Promise<any>}
   */
  const getApplicationUsers = async (): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      method: 'GET',
      url: options.baseUrl + `/application-user`
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('getApplicationUsers', data);
    }

    return data.result;
  };

  const renewUser = async (id): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      headers: { ...options.headers },
      method: 'POST',
      url: options.baseUrl + `/api/application-user/renew?userId=${id}`
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('renewUser', data);
    }

    return data.result;
  };

  const getUserByIDIR = async (idir_userid, bearer?: string): Promise<any> => {
    const options = await getRequestOptions();
    if (bearer) {
      options.headers.Authorization = `Bearer ${bearer}`;
    }
    const { data, status, url } = await Http.request({
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      method: 'GET',
      url: options.baseUrl + `/application-user?idir=${idir_userid}`
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('getUserByIDIR', data);
    }

    return data.result;
  };

  const getUserByBCEID = async (bceid_userid, bearer?: string): Promise<any> => {
    const options = await getRequestOptions();
    if (bearer) {
      options.headers.Authorization = `Bearer ${bearer}`;
    }
    const { data, status, url } = await Http.request({
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      method: 'GET',
      url: options.baseUrl + `/application-user?bceid=${bceid_userid}`
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('getUserByBCEID', data);
    }

    return data.result;
  };

  /**
   * Create a new activity record.
   *
   * @param {ICreateOrUpdateActivity} activity
   * @return {*}  {Promise<any>}
   */
  const createActivity = async (activity: ICreateOrUpdateActivity): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      method: 'POST',
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      data: activity,
      url: options.baseUrl + '/api/activity'
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('createActivity', data);
    }

    return data.result;
  };

  /**
   * Update an existing activity record.
   *
   * @param {ICreateOrUpdateActivity} activity
   * @return {*}  {Promise<any>}
   */
  const updateActivity = async (activity: ICreateOrUpdateActivity): Promise<any> => {
    const options = await getRequestOptions();
    // Not sure who is using this... But its smelling
    // const oldActivity = await getActivityById(activity.activity_id);

    const { data, status, url } = await Http.request({
      method: 'PUT',
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      data: activity,
      url: options.baseUrl + '/api/activity'
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('updateActivity', data);
    }

    return data.result;
  };

  /**
   * Fetch the api json-schema spec.
   *
   * @return {*}  {Promise<any>}
   */
  const getApiSpec = async (): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      headers: { ...options.headers },
      method: 'GET',
      url: options.baseUrl + `/api/api-docs/`
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('getApiSpec', data);
    }

    return data;
  };

  /**
   * Fetch the api json-schema spec.
   *
   * @return {*}  {Promise<any>}
   */
  const getSimplifiedGeoJSON = async (url_geo: string, percentage: string): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      headers: { ...options.headers },
      method: 'GET',
      url: options.baseUrl + `/api/map-shaper?url=${url_geo}&percentage=${percentage}`
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('getSimplifiedGeoJSON', data);
    }

    return data.result;
  };
  const { MOBILE } = useSelector(selectConfiguration);
  /**
   * Fetch the api json-schema spec and save it in the local database.
   * If the request fails (due to lack of internet connection, etc), then return the cached copy of the api spec.
   *
   * @return {*}  {Promise<any>}
   */
  const getCachedApiSpec = async (): Promise<any> => {
    try {
      // on mobile - think there is internet:
      if (MOBILE) {
        // try to cache spec, then return it:
        try {
          const webResponse = await getApiSpec();
          cacheSpec(webResponse);
          return webResponse;
        } catch (e) {
          console.dir(e);
          return await getSpecFromCache();
        }
      } else {
        // must be web, try online:
        return await getApiSpec();
      }
    } catch (e) {
      console.log('Unable to get api spec');
      console.log(JSON.stringify(e));
    }
  };

  const getSpecFromCache = async () => {
    let data = await databaseContext.asyncQueue({
      asyncTask: async () => {
        let res = await query(
          {
            type: QueryType.DOC_TYPE_AND_ID,
            docType: DocType.API_SPEC,
            ID: '1'
          },
          databaseContext
        );
        res = res?.length > 0 ? JSON.parse(res[0].json) : null;
        return res;
      }
    });

    if (data?.result?.length > 0) {
      data = JSON.parse(data.result[0].json);
      return data.result;
    }
  };

  const cacheUserInfo = async (data) => {
    if (data) {
      console.log('Attempting to cachce user info...');
      try {
        await databaseContext.asyncQueue({
          asyncTask: () => {
            return upsert(
              [
                {
                  type: UpsertType.DOC_TYPE_AND_ID,
                  docType: DocType.USER_INFO,
                  json: data,
                  ID: '1'
                }
              ],
              databaseContext
            );
          }
        });
        return true;
      } catch (e) {
        alert('Unable to cache user info and roles');
        console.log('ERROR: ', e);
      }
    }
    return false;
  };

  const clearUserInfoFromCache = async () => {
    console.log('Clearing user info from cache...');
    try {
      await databaseContext.asyncQueue({
        asyncTask: async () => {
          return upsert(
            [
              {
                type: UpsertType.DOC_TYPE_AND_ID_DELETE,
                ID: '1',
                docType: DocType.USER_INFO
              }
            ],
            databaseContext
          );
        }
      });
      return true;
    } catch (e) {
      alert('unable to remove user info from cache');
    }
    return false;
  };

  const getUserInfoFromCache = async () => {
    let data = await databaseContext.asyncQueue({
      asyncTask: async () => {
        let res = await query(
          {
            type: QueryType.DOC_TYPE_AND_ID,
            docType: DocType.USER_INFO,
            ID: '1'
          },
          databaseContext
        );
        res = res?.length > 0 ? JSON.parse(res[0].json) : null;
        return res;
      }
    });
    if (data) {
      return JSON.parse(JSON.stringify(data));
    } else {
      console.log('No information found when attempting to fetch cached user');
    }
  };

  const cacheSpec = async (data) => {
    if (data.components) {
      console.log('caching spec');
      //cache if on mobile
      try {
        await databaseContext.asyncQueue({
          asyncTask: () => {
            return upsert(
              [
                {
                  type: UpsertType.DOC_TYPE_AND_ID,
                  docType: DocType.API_SPEC,
                  json: data,
                  ID: '1'
                }
              ],
              databaseContext
            );
          }
        });
        return true;
      } catch (e) {
        alert('unable to cache api spec');
      }
    }
    return false;
  };

  /**
   * Fetch species details.
   *
   * @param {string[]} species
   * @return {*}  {Promise<any>}
   */
  const getSpeciesDetails = async (species: string[]): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      headers: { ...options.headers },
      method: 'GET',
      url: options.baseUrl + `/api/species?` + qs.stringify({ key: species })
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('getSpeciesDetails', data);
    }

    return data.result;
  };

  /**
   * Create a new batch upload
   *
   // * @param {IBatchUploadRequest} uploadRequest
   * @return {*}  {Promise<any>}
   */
  const postBatchUpload = async (uploadRequest: IBatchUploadRequest): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      method: 'POST',
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      data: uploadRequest,
      url: `${options.baseUrl}/api/batch/new_upload`
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('postBatchUpload', data);
    }

    return data.result;
  };

  const getBatchUploads = async (): Promise<any> => {
    const options = await getRequestOptions();
    console.dir(options.headers);
    const { data, status, url } = await Http.request({
      method: 'GET',
      headers: { ...options.headers },
      url: `${options.baseUrl}/api/batch/upload`
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('getBatchUploads', data);
    }

    return data;
  };

  const downloadTemplate = async (): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      method: 'GET',
      headers: { ...options.headers },
      url: options.baseUrl + '/api/batch/new_template'
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('downloadTemplate', data);
    }

    return data.result;
  };

  const listCodeTables = async (): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      method: 'GET',
      headers: { ...options.headers },
      url: options.baseUrl + '/api/code_tables'
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('listCodeTables', data);
    }

    return data.result;
  };

  const fetchCodeTable = async (codeHeaderName, csv = false): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      method: 'GET',
      headers: { ...options.headers, Accept: csv ? 'text/csv' : 'application/json' },
      url: `${options.baseUrl}/api/code_tables/${codeHeaderName}`
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('fetchCodeTable', data);
    }

    return data.result;
  };

  /**
   * Fetch species details.
   *
   * @param {string[]} species
   * @return {*}  {Promise<any>}
   */
  const getAdminUploadGeoJSONLayers = async (): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      headers: { ...options.headers },
      method: 'GET',
      url: options.baseUrl + `/api/admin-defined-shapes`
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('getAdminUploadGeoJSONLayer', data);
    }

    return data.result;
  };

  /**
   * Create a new shapefile upload
   *
   // * @param {IShapeUploadRequest} uploadRequest
   * @return {*}  {Promise<any>}
   */
  const postAdminUploadShape = async (uploadRequest: IShapeUploadRequest): Promise<any> => {
    const options = await getRequestOptions();
    const { data, status, url } = await Http.request({
      method: 'POST',
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      data: uploadRequest,
      url: `${options.baseUrl}/api/admin-defined-shapes`
    });
    checkForErrors(data, status, url);
    if (DEBUG) {
      console.log('postAdminUploadShape', data);
    }

    return data;
  };

  /**
   * Request a signed embedded metabase report
   *
   // * @param reportId Metabase Report Id
   * @return {*}  {Promise<any>}
   */
  const getEmbeddedMetabaseReport = async (reportId: string): Promise<any> => {
    const options = await getRequestOptions();
    const { data } = await Http.request({
      method: 'GET',
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      url: `${options.baseUrl}/api/embedded-report/${reportId}`
    });
    return data;
  };

  /**
   * Get the names/ids of valid metabase questions
   *
   * @return {*}  {Promise<any>}
   */
  const listEmbeddedMetabaseReports = async (): Promise<any> => {
    const options = await getRequestOptions();
    const { data } = await Http.request({
      method: 'GET',
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      url: `${options.baseUrl}/api/embedded-report`
    });
    return data;
  };

  /**
   * Get the iapp jurisdiction names (and codes)
   *
   * @return {*}  {Promise<any>}
   */
  const getIappJurisdictions = async (): Promise<any> => {
    const options = await getRequestOptions();
    const { data } = await Http.request({
      method: 'GET',
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      url: `${options.baseUrl}/api/iapp-jurisdictions`
    });
    return data.result;
  };

  return {
    getMedia,
    getSpeciesDetails,
    getActivities,
    getActivitiesLean,
    deleteActivities,
    undeleteActivities,
    getActivityById,
    createActivity,
    updateActivity,
    getApiSpec,
    getCachedApiSpec,
    getGridItemsThatOverlapPolygon,
    getPointsOfInterest,
    getPointsOfInterestLean,
    getMetabaseQueryResults,
    getMetabaseQueryOptions,
    getSimplifiedGeoJSON,
    getAccessRequestData,
    createMetabaseQuery,
    getBatchUploads,
    postBatchUpload,
    downloadTemplate,
    listCodeTables,
    fetchCodeTable,
    getJurisdictions,
    getRISOs,
    cacheUserInfo,
    getUserInfoFromCache,
    clearUserInfoFromCache,
    getApplicationUsers,
    submitAccessRequest,
    getEmployers,
    getFundingAgencies,
    getRolesForUser,
    getUsersForRole,
    batchGrantRoleToUser,
    revokeRoleFromUser,
    getRoles,
    getAccessRequests,
    getUserByIDIR,
    getUserByBCEID,
    approveAccessRequests,
    declineAccessRequest,
    renewUser,
    getAdminUploadGeoJSONLayers,
    postAdminUploadShape,
    submitUpdateRequest,
    getUpdateRequests,
    declineUpdateRequest,
    approveUpdateRequests,
    listEmbeddedMetabaseReports,
    getEmbeddedMetabaseReport,
    getIappJurisdictions
  };
};
