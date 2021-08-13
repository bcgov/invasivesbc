import { Capacitor } from '@capacitor/core';
import { useKeycloak } from '@react-keycloak/web';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { query, QueryType, upsert, UpsertType } from 'contexts/DatabaseContext2';
import {
  IActivitySearchCriteria,
  ICreateOrUpdateActivity,
  IMetabaseQuerySearchCriteria,
  ICreateMetabaseQuery
} from 'interfaces/useInvasivesApi-interfaces';
import { IPointOfInterestSearchCriteria } from 'interfaces/useInvasivesApi-interfaces';
import qs from 'qs';
import { Http } from '@capacitor-community/http';
import { useContext, useMemo } from 'react';
import { DocType } from 'constants/database';

const API_HOST = process.env.REACT_APP_API_HOST;
const API_PORT = process.env.REACT_APP_API_PORT;
const API_URL =
  API_HOST && API_PORT
    ? `http://` + (API_PORT && `${API_HOST}:${API_PORT}`) || API_HOST
    : 'https://api-dev-invasivesbci.apps.silver.devops.gov.bc.ca';

/**
 * Returns an instance of axios with baseURL and authorization headers set.
 *
 * @return {*}
 */
const useRequestOptions = () => {
  const { keycloak } = useKeycloak();
  const instance = useMemo(() => {
    const options = {
      baseUrl: API_URL,
      headers: { 'Access-Control-Allow-Origin': '*', Authorization: `Bearer ${keycloak?.token}` }
    };
    return options;
  }, [keycloak]);

  return instance;
};
/**
 * Returns a set of supported api methods.
 *
 * @return {object} object whose properties are supported api methods.
 */
export const useInvasivesApi = () => {
  const options = useRequestOptions();
  const databaseContext = useContext(DatabaseContext);
  /**
   * Fetch*
 activities by search criteria.
      * @param {activitiesSearchCriteria} activitiesSearchCriteria
   * @return {*}  {Promise<any>}
   */
  const getActivities = async (activitiesSearchCriteria: IActivitySearchCriteria): Promise<any> => {
    const { data } = await Http.request({
      method: 'POST',
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      url: options.baseUrl + `/api/activities/`,
      data: activitiesSearchCriteria
    });
    return data;
  };

  /**
   * Delete activities by ids.
   *
   * @param {string[]} activityIds
   * @return {*}  {Promise<any>}
   */
  const deleteActivities = async (activityIds: string[]): Promise<any> => {
    const { data } = await Http.request({
      method: 'DELETE',
      url: options.baseUrl + `/api/activities?` + qs.stringify({ id: activityIds }),
      headers: { ...options.headers, 'Content-Type': 'application/json' }
    });
    return data;
  };

  /**
   * Undelete activities by ids.
   *
   * @param {string[]} activityIds
   * @return {*}  {Promise<any>}
   */
  const undeleteActivities = async (activityIds: string[]): Promise<any> => {
    const { data } = await Http.request({
      method: 'POST',
      url: options.baseUrl + `/api/deleted/activities?` + qs.stringify({ id: activityIds }),
      headers: { ...options.headers, 'Content-Type': 'application/json' }
    });

    return data;
  };

  /**
   * Fetch points of interest by search criteria.
   *
   * @param {pointsOfInterestSearchCriteria} pointsOfInterestSearchCriteria
   * @return {*}  {Promise<any>}
   */
  const getPointsOfInterest = async (pointsOfInterestSearchCriteria: IPointOfInterestSearchCriteria): Promise<any> => {
    const { data } = await Http.request({
      method: 'POST',
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      url: options.baseUrl + `/api/points-of-interest/`,
      data: pointsOfInterestSearchCriteria
    });

    return data;
  };

  /**
   * Fetch activities or points of interest returned by Metabase queries corresponding to an id.
   *
   * @param {metabaseQueriesSearchCriteria} metabaseQueriesSearchCriteria
   * @return {*}  {Promise<any>}
   */
  const getMetabaseQueryResults = async (metabaseQueriesSearchCriteria: IMetabaseQuerySearchCriteria): Promise<any> => {
    let activities, points_of_interest;
    try {
      const { data } = await Http.request({
        headers: { ...options.headers },
        method: 'GET',
        url: options.baseUrl + `/api/metabase-query/${metabaseQueriesSearchCriteria.metabaseQueryId}`
      });
      if (data?.activity_ids?.length)
        activities = await getActivities({
          activity_ids: data.activity_ids,
          search_feature: metabaseQueriesSearchCriteria.search_feature
        });
      if (data?.point_of_interest_ids?.length)
        points_of_interest = await getPointsOfInterest({
          point_of_interest_ids: data.point_of_interest_ids,
          search_feature: metabaseQueriesSearchCriteria.search_feature
        });
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
    const { data } = await Http.request({
      method: 'POST',
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      url: options.baseUrl + `/api/metabase-query`,
      data: metabaseQueriesCreateCriteria
    });
    return data;
  };

  /**
   * Fetch list of all Metabase query options (collections/questions/cards) to present to the user dropdown
   *
   * @return {*}  {Promise<any>}
   */
  const getMetabaseQueryOptions = async (): Promise<any> => {
    const { data } = await Http.request({
      headers: { ...options.headers },
      method: 'GET',
      url: options.baseUrl + `/api/metabase-query`
    });
    return data.options;
  };

  /**
   * Fetch a signle activity by its id.
   *
   * @param {string} activityId
   * @return {*}  {Promise<any>}
   */
  const getActivityById = async (activityId: string): Promise<any> => {
    const { data } = await Http.request({
      headers: { ...options.headers },
      method: 'GET',
      url: options.baseUrl + `/api/activity/${activityId}`
    });
    return data;
  };

  /**
   * Fetch media items.
   *
   * @param {string[]} mediaKeys
   * @return {*}  {Promise<any>}
   */
  const getMedia = async (mediaKeys: string[]): Promise<any> => {
    const { data } = await Http.request({
      headers: { ...options.headers },
      method: 'GET',
      url: options.baseUrl + `/api/media?` + qs.stringify({ key: mediaKeys })
    });

    return data;
  };

  /**
   * Create a new activity record.
   *
   * @param {ICreateOrUpdateActivity} activity
   * @return {*}  {Promise<any>}
   */
  const createActivity = async (activity: ICreateOrUpdateActivity): Promise<any> => {
    const { data } = await Http.request({
      method: 'POST',
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      data: activity,
      url: options.baseUrl + '/api/activity'
    });
    return data;
  };

  /**
   * Update an existing activity record.
   *
   * @param {ICreateOrUpdateActivity} activity
   * @return {*}  {Promise<any>}
   */
  const updateActivity = async (activity: ICreateOrUpdateActivity): Promise<any> => {
    const { data } = await Http.request({
      method: 'PUT',
      headers: { ...options.headers, 'Content-Type': 'application/json' },
      data: activity,
      url: options.baseUrl + '/api/activity'
    });
    return data;
  };

  /**
   * Fetch the api json-schema spec.
   *
   * @return {*}  {Promise<any>}
   */
  const getApiSpec = async (): Promise<any> => {
    const { data } = await Http.request({
      headers: { ...options.headers },
      method: 'GET',
      url: options.baseUrl + `/api/api-docs/`
    });
    return data;
  };

  /**
   * Fetch the api json-schema spec and save it in the local database.
   * If the request fails (due to lack of internet connection, etc), then return the cached copy of the api spec.
   *
   * @return {*}  {Promise<any>}
   */
  const getCachedApiSpec = async (): Promise<any> => {
    let data;
    try {
      data = await getApiSpec();
      // await databaseContext.database.upsert('ApiSpec', () => {
      //   return data;
      // });
      if (Capacitor.getPlatform() !== 'web')
        await upsert(
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

      return data;
    } catch (error) {
      data = await databaseContext.database.get('ApiSpec');

      data = await query(
        {
          type: QueryType.DOC_TYPE_AND_ID,
          docType: DocType.API_SPEC,
          ID: '1'
        },
        databaseContext
      );
      return data;
    }
  };

  /**
   * Fetch species details.
   *
   * @param {string[]} species
   * @return {*}  {Promise<any>}
   */
  const getSpeciesDetails = async (species: string[]): Promise<any> => {
    const { data } = await Http.request({
      headers: { ...options.headers },
      method: 'GET',
      url: options.baseUrl + `/api/species?` + qs.stringify({ key: species })
    });

    return data;
  };

  return {
    getMedia,
    getSpeciesDetails,
    getActivities,
    deleteActivities,
    undeleteActivities,
    getActivityById,
    createActivity,
    updateActivity,
    getApiSpec,
    getCachedApiSpec,
    getPointsOfInterest,
    getMetabaseQueryResults,
    getMetabaseQueryOptions,
    createMetabaseQuery
  };
};
