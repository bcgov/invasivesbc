import { useMemo } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useKeycloak } from '@react-keycloak/web';
import { IActivity } from 'api/interfaces';

// interface ICrudData<T extends object = {}> {
//     data: T[];
//     loaded: boolean;
// }

// export interface CrudAPI<T extends object = {}> {
//     list: (query?: string) => Promise<T[]>;
//     create: (data: Partial<T>) => Promise<T>;
//     update: (id: number, data: Partial<T>) => Promise<T>;
//     getOne: (id: number) => Promise<T>;
//     delete: (id: number) => Promise<void>;
//     data: ICrudData<T>;
// }

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
  // const { keycloak } = useKeycloak();
  // const [data, setData] = useState<ICrudData<IActivity>>({ data: [], loaded: false });

  /**
   * Fetch a signle activity by its id.
   *
   * @param {string} activityId
   * @return {*}  {Promise<AxiosResponse<IActivity>>}
   */
  const getActivityById = async (activityId: string): Promise<AxiosResponse<IActivity>> => {
    return api.get(`/api/activity/${activityId}`);
  };

  /**
   * Create a new activity record.
   *
   * @param {*} activity
   * @return {*}  {Promise<AxiosResponse<any>>}
   */
  const createActivity = async (activity: any): Promise<AxiosResponse<any>> => {
    return api.post('/api/activity', activity);
  };

  /**
   * Fetch the api yaml spec.
   *
   * @return {*}  {Promise<AxiosResponse<any>>}
   */
  const getApiSpec = async (): Promise<AxiosResponse<any>> => {
    return api.get('/api/api-docs/');
  };

  //   const list = useCallback(
  //     async (query?: string): Promise<IActivity[]> => {
  //       return (await api.get(!!query ? `/api/activity/filter?${query}` : '/api/properties/filter'))
  //         .data;
  //     },
  //     [api],
  //   );

  //   const filter = useCallback(
  //     async (query: Partial<IActivityFilter>): Promise<IActivity[]> => {
  //       const q = {
  //         ...query,
  //         neLatitude: undefined,
  //         neLongitude: undefined,
  //         swLatitude: undefined,
  //         swLongitude: undefined,
  //       };
  //       const properties = await list(stringify(q));
  //       setData({ ...data, data: properties });
  //       return properties;
  //     },
  //     [api],
  //   );

  //   const create = useCallback(
  //     async (input: Partial<IActivity>): Promise<IActivity> => {
  //       const response = (await api.post(`/api/properties`, input)).data;
  //       setData((prevData) => ({ ...prevData, data: [...data.data, response] }));
  //       return response;
  //     },
  //     [api, data],
  //   );

  //   const update = useCallback(
  //     async (id: number, input: Partial<IActivity>): Promise<IActivity> => {
  //       const response = (await api.put(`/api/properties/${id}`, input)).data;
  //       setData(prevData => ({
  //         ...prevData,
  //         data: prevData.data.map((x) => {
  //           return x.id === response.id ? { ...x, ...response } : x;
  //         }),
  //       }));
  //       return response;
  //     },
  //     [api, data],
  //   );

  //   const remove = useCallback(
  //     async (id: number): Promise<void> => {
  //       const response = (
  //         await api({
  //           method: 'DELETE',
  //           url: `/api/properties/${id}`,
  //           data: {},
  //         })
  //       ).data;
  //       setData({
  //         ...data,
  //         data: data.data.filter((x) => {
  //           return x.id !== +id;
  //         }),
  //       });
  //       return response;
  //     },
  //     [api, data],
  //   );

  //   const getOne = useCallback(
  //     async (id: number): Promise<IActivity> => {
  //       const local = data.data.find((x) => x.id === id);
  //       if (local) {
  //         return local;
  //       }
  //       const response = (await api.get(`/api/properties/${id}`)).data;
  //       return response;
  //     },
  //     [api],
  //   );

  //   useEffect(() => {
  //     const loadProperties = async () => {
  //       const properties = await list();
  //       setData({ data: properties, loaded: true });
  //     };

  //     if (keycloak?.token) {
  //       loadProperties();
  //     }
  //   }, [keycloak]);

  return {
    getActivityById,
    createActivity,
    getApiSpec
    // list,
    // filter,
    // create,
    // update,
    // getOne,
    // delete: remove,
    // data,
  };
};
