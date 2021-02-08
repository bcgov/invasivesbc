import { useKeycloak } from '@react-keycloak/web';
import axios from 'axios';
import { DatabaseContext } from 'contexts/DatabaseContext';
import {
  IActivitySearchCriteria,
  ICreateOrUpdateActivity,
  IMetabaseQuerySearchCriteria
} from 'interfaces/useInvasivesApi-interfaces';
import { IPointOfInterestSearchCriteria } from 'interfaces/useInvasivesApi-interfaces';
import qs from 'qs';
import { useContext, useMemo } from 'react';

const API_HOST = process.env.REACT_APP_API_HOST;
const API_PORT = process.env.REACT_APP_API_PORT;

const API_URL =
  (API_PORT && `${API_HOST}:${API_PORT}`) || API_HOST || 'https://api-dev-invasivesbci.apps.silver.devops.gov.bc.ca';

/**
 * Returns an instance of axios with baseURL and authorization headers set.
 *
 * @return {*}
 */
const useApi = () => {
  const { keycloak } = useKeycloak();
  const instance = useMemo(() => {
    return axios.create({
      headers: {
        // 'Access-Control-Allow-Origin': '*',
        Authorization: `Bearer ${keycloak?.token}`
      },
      baseURL: API_URL
    });
  }, [keycloak]);

  return instance;
};

/**
 * Returns a set of supported api methods.
 *
 * @return {object} object whose properties are supported api methods.
 */
export const useInvasivesApi = () => {
  const api = useApi();

  const databaseContext = useContext(DatabaseContext);

  /**
   * Fetch activities by search criteria.
   *
   * @param {activitiesSearchCriteria} activitiesSearchCriteria
   * @return {*}  {Promise<any>}
   */
  const getActivities = async (activitiesSearchCriteria: IActivitySearchCriteria): Promise<any> => {
    const { data } = await api.post(`/api/activities/`, activitiesSearchCriteria);

    return data;
  };

  /**
   * Delete activities by ids.
   *
   * @param {string[]} activityIds
   * @return {*}  {Promise<any>}
   */
  const deleteActivities = async (activityIds: string[]): Promise<any> => {
    const { data } = await api.delete(`/api/activities`, {
      params: { id: activityIds },
      paramsSerializer: (params) => {
        return qs.stringify(params);
      }
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
    const { data } = await api.post(`/api/deleted/activities`, {
      params: { id: activityIds },
      paramsSerializer: (params) => {
        return qs.stringify(params);
      }
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
    const { data } = await api.post(`/api/points-of-interest/`, pointsOfInterestSearchCriteria);

    return data;
  };

  /**
   * Fetch activities or points of interest returned by Metabase queries corresponding to an id.
   *
   * @param {metabaseQueriesSearchCriteria} metabaseQueriesSearchCriteria
   * @return {*}  {Promise<any>}
   */
  const getMetabaseQueryResults = async (metabaseQueriesSearchCriteria: IMetabaseQuerySearchCriteria): Promise<any> => {
    const { data } = await api.post('/api/metabase-fetch', metabaseQueriesSearchCriteria);
    let activities, points_of_interest;
    if (data.activity_ids.length)
      activities = await getActivities({
        activity_ids: data.activity_ids,
        search_feature: metabaseQueriesSearchCriteria.search_feature
      });
    if (data.point_of_interest_ids.length)
      points_of_interest = await getPointsOfInterest({
        point_of_interest_ids: data.point_of_interest_ids,
        search_feature: metabaseQueriesSearchCriteria.search_feature
      });

    return {
      // TODO Note: api code smell that activities and points-of-interest dont have same response format
      activities: activities?.rows?.length ? activities.rows : [],
      points_of_interest: points_of_interest?.length ? points_of_interest : []
    };
  };

  /**
   * Fetch a signle activity by its id.
   *
   * @param {string} activityId
   * @return {*}  {Promise<any>}
   */
  const getActivityById = async (activityId: string): Promise<any> => {
    const { data } = await api.get(`/api/activity/${activityId}`);

    return data;
  };

  /**
   * Fetch media items.
   *
   * @param {string[]} mediaKeys
   * @return {*}  {Promise<any>}
   */
  const getMedia = async (mediaKeys: string[]): Promise<any> => {
    const { data } = await api.get('/api/media/', {
      params: { key: mediaKeys },
      paramsSerializer: (params) => {
        return qs.stringify(params);
      }
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
    const { data } = await api.post('/api/activity', activity);

    return data;
  };

  /**
   * Update an existing activity record.
   *
   * @param {ICreateOrUpdateActivity} activity
   * @return {*}  {Promise<any>}
   */
  const updateActivity = async (activity: ICreateOrUpdateActivity): Promise<any> => {
    const { data } = await api.put('/api/activity', activity);

    return data;
  };

  /**
   * Fetch the api json-schema spec.
   *
   * @return {*}  {Promise<any>}
   */
  const getApiSpec = async (): Promise<any> => {
    const { data } = await api.get('/api/api-docs/');

    return data;
  };

  /**
   * Fetch the api json-schema spec and save it in the local database.
   * If the request fails (due to lack of internet connection, etc), then return the cached copy of the api spec.
   *
   * @return {*}  {Promise<any>}
   */
  const getCachedApiSpec = async (): Promise<any> => {
    try {
      const data = await getApiSpec();

      await databaseContext.database.upsert('ApiSpec', () => {
        return data;
      });

      return data;
    } catch (error) {
      const data = await databaseContext.database.get('ApiSpec');

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
    const { data } = await api.get('/api/species', {
      params: { key: species },
      paramsSerializer: (params) => {
        return qs.stringify(params);
      }
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
    getMetabaseQueryResults
  };
};
