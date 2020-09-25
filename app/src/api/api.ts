import { useContext, useMemo } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useKeycloak } from '@react-keycloak/web';
import { DatabaseContext } from 'contexts/DatabaseContext';

const API_URL = 'https://api-mobile-dev-invasivesbc.pathfinder.gov.bc.ca';

export const useApi = () => {
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

export const useInvasivesApi = () => {
  const api = useApi();

  const databaseContext = useContext(DatabaseContext);

  /**
   * Fetch a signle activity by its id.
   *
   * @param {string} activityId
   * @return {*}  {Promise<AxiosResponse<IActivity>>}
   */
  const getActivityById = async (activityId: string): Promise<any> => {
    const { data } = await api.get(`/api/activity/${activityId}`);

    return data;
  };

  /**
   * Create a new activity record.
   *
   * @param {*} activity
   * @return {*}  {Promise<any>}
   */
  const createActivity = async (activity: any): Promise<any> => {
    const { data } = await api.post('/api/activity', activity);

    return data;
  };

  /**
   * Fetch the api yaml spec.
   *
   * @return {*}  {Promise<any>}
   */
  const getApiSpec = async (): Promise<any> => {
    const { data } = await api.get('/api/api-docsx/');

    return data;
  };

  /**
   * Fetch the api spec and save it in the local database.
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
    getActivityById,
    createActivity,
    getApiSpec,
    getCachedApiSpec
  };
};
