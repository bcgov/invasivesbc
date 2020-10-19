import { useKeycloak } from '@react-keycloak/web';
import axios from 'axios';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { IActivitySearchCriteria, ICreateActivity } from 'interfaces/useInvasivesApi-interfaces';
import qs from 'qs';
import { useContext, useMemo } from 'react';

const API_URL = 'https://api-mobile-dev-invasivesbc.pathfinder.gov.bc.ca';
// const API_URL = 'http://localhost:7080'; // docker
// const API_URL = 'http://localhost:3002'; // local

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
    const { data } = await api.post(`/api/activity/`, activitiesSearchCriteria);

    return data;
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
   * @param {ICreateActivity} activity
   * @return {*}  {Promise<any>}
   */
  const createActivity = async (activity: ICreateActivity): Promise<any> => {
    const { data } = await api.post('/api/activity', activity);

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

  return {
    getMedia,
    getActivities,
    getActivityById,
    createActivity,
    getApiSpec,
    getCachedApiSpec
  };
};
