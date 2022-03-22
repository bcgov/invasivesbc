import { Capacitor } from '@capacitor/core';
import { fetchLayerDataFromLocal } from 'components/map/LayerLoaderHelpers/AdditionalHelperFunctions';
import { ActivitySyncStatus } from 'constants/activities';
import { AuthStateContext } from 'contexts/authStateContext';
import { NetworkContext } from 'contexts/NetworkContext';
import { useContext, useEffect } from 'react';
import { DocType } from '../constants/database';
import { DatabaseContext, DBRequest, query, QueryType, upsert, UpsertType } from '../contexts/DatabaseContext';
import {
  IActivitySearchCriteria,
  ICreateOrUpdateActivity,
  IJurisdictionSearchCriteria,
  IPointOfInterestSearchCriteria,
  IRisoSearchCriteria
} from '../interfaces/useInvasivesApi-interfaces';
import { useInvasivesApi } from './useInvasivesApi';

/**
 * Returns a set of supported api methods.
 *
 * @return {object} object whose properties are supported api methods.
 *
 */
export const useDataAccess = () => {
  const api = useInvasivesApi();
  const databaseContext = useContext(DatabaseContext);
  const platform = Capacitor.getPlatform();
  const networkContext = useContext(NetworkContext);
  const authContext = useContext(AuthStateContext);
  const keycloak = authContext.keycloak; //useKeycloak();

  const isMobile = () => {
    return Capacitor.getPlatform() !== 'web';
  };

  /**
   * Fetch points of interest by search criteria.
   *
   * @param {pointsOfInterestSearchCriteria} pointsOfInterestSearchCriteria
   * @return {*}  {Promise<any>}
   */
  const getPointsOfInterest = async (
    pointsOfInterestSearchCriteria: IPointOfInterestSearchCriteria,
    context?: {
      asyncQueue: (request: DBRequest) => Promise<any>;
      ready: boolean;
    },
    forceCache = false
  ): Promise<any> => {
    if (platform === 'web') {
      const response = await api.getPointsOfInterest(pointsOfInterestSearchCriteria);
      return response;
    } else {
      if (forceCache === true || !networkContext.connected) {
        const dbcontext = context;
        return dbcontext.asyncQueue({
          asyncTask: () => {
            return query(
              {
                type: QueryType.DOC_TYPE,
                docType: DocType.REFERENCE_POINT_OF_INTEREST,
                limit: pointsOfInterestSearchCriteria.limit,
                offset: pointsOfInterestSearchCriteria.page
              },
              databaseContext
            );
          }
        });
      } else {
        const response = await api.getPointsOfInterest(pointsOfInterestSearchCriteria);
        return response;
      }
    }
  };

  /**
   * Fetch points of interest (lean) by search criteria.
   *
   * @param {pointsOfInterestSearchCriteria} pointsOfInterestSearchCriteria
   * @return {*}  {Promise<any>}
   */
  const getPointsOfInterestLean = async (
    pointsOfInterestSearchCriteria: IPointOfInterestSearchCriteria,
    context: {
      asyncQueue: (request: DBRequest) => Promise<any>;
      ready: boolean;
    }
  ): Promise<any> => {
    if (platform === 'web') {
      const response = await api.getPointsOfInterest(pointsOfInterestSearchCriteria);
      return response;
    } else {
      if (!networkContext.connected) {
        const featuresArray = await fetchLayerDataFromLocal(
          'LEAN_POI',
          pointsOfInterestSearchCriteria.search_feature,
          context
        );
        return {
          rows: featuresArray,
          count: featuresArray.length
        };
      } else {
        const response = await api.getPointsOfInterest(pointsOfInterestSearchCriteria);
        return response;
      }
    }
  };

  /**
   * Fetch jurisdictions by search criteria.
   *
   * @param {jurisdictionSearchCriteria} jurisdictionSearchCriteria
   * @return {*}  {Promise<any>}
   */
  const getJurisdictions = async (
    jurisdictionSearchCriteria: IJurisdictionSearchCriteria,
    context: {
      asyncQueue: (request: DBRequest) => Promise<any>;
      ready: boolean;
    }
  ): Promise<any> => {
    if (platform === 'web') {
      const response = await api.getJurisdictions(jurisdictionSearchCriteria);
      return response;
    } else {
      if (!networkContext.connected) {
        const featuresArray = await fetchLayerDataFromLocal(
          'JURISDICTIONS',
          jurisdictionSearchCriteria.search_feature,
          context
        );

        return {
          rows: featuresArray,
          count: featuresArray.length
        };
      } else {
        const response = await api.getJurisdictions(jurisdictionSearchCriteria);
        return response;
      }
    }
  };

  /**
   * Fetch RISOs by search criteria.
   *
   * @param {risoSearchCriteria} risoSearchCriteria
   * @returns {*} {Promise<any>}
   */
  const getRISOs = async (
    risoSearchCriteria: IRisoSearchCriteria,
    context: {
      asyncQueue: (request: DBRequest) => Promise<any>;
      ready: boolean;
    }
  ): Promise<any> => {
    if (platform === 'web') {
      const response = await api.getRISOs(risoSearchCriteria);
      return response;
    } else {
      if (!networkContext.connected) {
        const featuresArray = await fetchLayerDataFromLocal('RISOS', risoSearchCriteria.search_feature, context);

        return {
          rows: featuresArray,
          count: featuresArray.length
        };
      } else {
        const response = await api.getRISOs(risoSearchCriteria);
        return response;
      }
    }
  };

  /**
   * Fetch a signle activity by its id.
   *
   * @param {string} activityId
   * @return {*}  {Promise<any>}
   */
  const getActivityById = async (
    activityId: string,
    context?: {
      asyncQueue: (request: DBRequest) => Promise<any>;
      ready: boolean;
    },
    forceCache?: boolean,
    referenceData = false
  ): Promise<any> => {
    try {
      if (Capacitor.getPlatform() === 'web') {
        const response = await api.getActivityById(activityId);
        return response;
      } else {
        if (forceCache === true || !networkContext.connected) {
          const dbcontext = context;
          // Removed for now due to not being able to open cached activity
          const res = await dbcontext.asyncQueue({
            asyncTask: async () => {
              const res = await query(
                {
                  type: QueryType.DOC_TYPE_AND_ID,
                  docType: referenceData ? DocType.REFERENCE_ACTIVITY : DocType.ACTIVITY,
                  ID: activityId
                },
                dbcontext
              );
              return JSON.parse(res[0]?.json);
              // Removed for now due to not being able to open cached activity
            }
          });
          return res;
        } else {
          const response = await api.getActivityById(activityId);
          return response;
        }
      }
    } catch (e) {
      throw new Error(
        `unable to get activity by id:  debug info:  ${JSON.stringify(
          activityId
        )}, ${referenceData})}, ${JSON.stringify(e)}`
      );
    }
  };

  /**
   * Update an existing activity record.
   *
   * @param {ICreateOrUpdateActivity} activity
   * @return {*}  {Promise<any>}
   */
  const updateActivity = async (
    activity: ICreateOrUpdateActivity,
    context?: {
      asyncQueue: (request: DBRequest) => Promise<any>;
      ready: boolean;
    }
  ): Promise<any> => {
    if (Capacitor.getPlatform() === 'web') {
      //TODO: implement getting old version from server and making new with overwritten props
      // IN USEINVASIVES API
      return await api.updateActivity(activity);
    } else {
      const dbcontext = context;
      return dbcontext.asyncQueue({
        asyncTask: () => {
          try {
            return upsert(
              [
                {
                  type: UpsertType.MOBILE_ACTIVITY_PATCH,
                  docType: DocType.ACTIVITY,
                  json: activity,
                  ID: activity.activity_id,
                  sync_status: activity.sync_status,
                  activity_subtype: activity.activity_subtype
                }
              ],
              dbcontext
            );
          } catch (err) {
            console.log('Error occurred: ', err);
          }
        }
      });
    }
  };

  /**
   * Get all the trip records
   *
   * @return {*}  {Promise<any>}
   */
  const getTrips = async (context?: { asyncQueue: (request: DBRequest) => Promise<any>; ready: boolean }) => {
    const dbcontext = context;
    return dbcontext.asyncQueue({
      asyncTask: () => {
        return query({ type: QueryType.DOC_TYPE, docType: DocType.TRIP }, dbcontext);
      }
    });
  };

  /**
   * Add new trip object record
   *
   * @param {any} newTripObj
   * @return {*}  {Promise<any>}
   */
  const addTrip = async (
    newTripObj: any,
    context?: { asyncQueue: (request: DBRequest) => Promise<any>; ready: boolean }
  ) => {
    const dbcontext = context;
    return dbcontext.asyncQueue({
      asyncTask: () => {
        return upsert([{ type: UpsertType.DOC_TYPE, docType: DocType.TRIP, json: newTripObj }], dbcontext);
      }
    });
  };

  const getApplicationUsers = async (context?: {
    asyncQueue: (request: DBRequest) => Promise<any>;
    ready: boolean;
  }): Promise<any> => {
    const dbcontext = context;
    return dbcontext.asyncQueue({
      asyncTask: async () => {
        let res = await query(
          {
            type: QueryType.DOC_TYPE,
            docType: DocType.APPLICATION_USER,
            ID: '1'
          },
          dbcontext
        );
        res = res?.length > 0 ? JSON.parse(res[0].json) : null;
        return res;
      }
    });
  };

  const cacheApplicationUsers = async (context?: {
    asyncQueue: (request: DBRequest) => Promise<any>;
    ready: boolean;
  }) => {
    if (networkContext.connected && isMobile()) {
      const users = await api.getApplicationUsers();
      const dbcontext = context;
      return dbcontext.asyncQueue({
        asyncTask: () => {
          return upsert(
            [{ type: UpsertType.DOC_TYPE_AND_ID, docType: DocType.APPLICATION_USER, ID: '1', json: users }],
            dbcontext
          );
        }
      });
    }
  };

  useEffect(() => {
    if (keycloak?.obj?.token) cacheApplicationUsers(databaseContext);
  }, [networkContext.connected, keycloak?.obj?.authenticated]);

  /**
   * Fetch activities by search criteria.  Also can be used to get cached reference activities on mobile.
   *
   * @param {activitiesSearchCriteria} activitiesSearchCriteria
   * @return {*}  {Promise<any>}
   */
  const getActivitiesForMobileSync = async (
    activitiesSearchCriteria: IActivitySearchCriteria,
    context?: { asyncQueue: (request: DBRequest) => Promise<any>; ready: boolean }
  ): Promise<any> => {
    if (Capacitor.getPlatform() !== 'web') {
      const dbContext = context;

      const typeClause = activitiesSearchCriteria.activity_type
        ? ` and json_extract(json(json), '$.activity_type') IN (${JSON.stringify(
            activitiesSearchCriteria.activity_type
          ).replace(/[\[\]']+/g, '')})`
        : '';
      const subTypeClause = activitiesSearchCriteria.activity_subtype
        ? ` and json_extract(json(json), '$.activity_subtype') IN (${JSON.stringify(
            activitiesSearchCriteria.activity_subtype
          ).replace(/[\[\]']+/g, '')})`
        : '';

      const sql = `select * from activity where 1=1 and sync_status='${ActivitySyncStatus.NOT_SAVED}' ${typeClause} ${subTypeClause}`;
      const asyncReturnVal = await dbContext.asyncQueue({
        asyncTask: () => {
          return query(
            {
              type: QueryType.RAW_SQL,
              sql: sql
            },
            dbContext
          );
        }
      });
      return {
        rows: asyncReturnVal.map((val) => JSON.parse(val.json)),
        count: asyncReturnVal.length
      };
    }
  };

  const cacheEmployers = async (context?: { asyncQueue: (request: DBRequest) => Promise<any>; ready: boolean }) => {
    if (networkContext.connected && isMobile()) {
      const employers = await api.getEmployers();
      const dbcontext = context;
      return dbcontext.asyncQueue({
        asyncTask: () => {
          return upsert(
            [{ type: UpsertType.DOC_TYPE_AND_ID, docType: DocType.EMPLOYER, ID: '1', json: employers }],
            dbcontext
          );
        }
      });
    }
  };

  const cacheFundingAgencies = async (context?: {
    asyncQueue: (request: DBRequest) => Promise<any>;
    ready: boolean;
  }) => {
    if (networkContext.connected && isMobile()) {
      const agencies = await api.getFundingAgencies();
      const dbcontext = context;
      return dbcontext.asyncQueue({
        asyncTask: () => {
          return upsert(
            [{ type: UpsertType.DOC_TYPE_AND_ID, docType: DocType.AGENCY, ID: '1', json: agencies }],
            dbcontext
          );
        }
      });
    }
  };

  const cacheRolesForUser = async (
    userId,
    context?: { asyncQueue: (request: DBRequest) => Promise<any>; ready: boolean }
  ) => {
    if (networkContext.connected && isMobile()) {
      const userRoles = await api.getRolesForUser(userId);
      const dbcontext = context;
      return dbcontext.asyncQueue({
        asyncTask: () => {
          return upsert(
            [{ type: UpsertType.DOC_TYPE_AND_ID, docType: DocType.USER_ROLE, ID: '1', json: userRoles }],
            dbcontext
          );
        }
      });
    }
  };

  const cacheAllRoles = async (context?: { asyncQueue: (request: DBRequest) => Promise<any>; ready: boolean }) => {
    if (networkContext.connected && isMobile()) {
      const roles = await api.getRoles();
      const dbcontext = context;
      return dbcontext.asyncQueue({
        asyncTask: () => {
          return upsert([{ type: UpsertType.DOC_TYPE_AND_ID, docType: DocType.ROLE, ID: '1', json: roles }], dbcontext);
        }
      });
    }
  };

  const cacheCurrentUserBCEID = async (
    bceid_userid,
    context?: { asyncQueue: (request: DBRequest) => Promise<any>; ready: boolean }
  ) => {
    if (networkContext.connected && isMobile()) {
      const user = await api.getUserByBCEID(bceid_userid);
      const dbcontext = context;
      return dbcontext.asyncQueue({
        asyncTask: () => {
          return upsert([{ type: UpsertType.DOC_TYPE_AND_ID, docType: DocType.USER, ID: '1', json: user }], dbcontext);
        }
      });
    }
  };

  const cacheCurrentUserIDIR = async (
    idir_userid,
    context?: {
      asyncQueue: (request: DBRequest) => Promise<any>;
      ready: boolean;
    }
  ) => {
    if (networkContext.connected && isMobile()) {
      const user = await api.getUserByIDIR(idir_userid);
      const dbcontext = context;
      return dbcontext.asyncQueue({
        asyncTask: () => {
          return upsert([{ type: UpsertType.DOC_TYPE_AND_ID, docType: DocType.USER, ID: '1', json: user }], dbcontext);
        }
      });
    }
  };

  const getEmployers = async (context?: {
    asyncQueue: (request: DBRequest) => Promise<any>;
    ready: boolean;
  }): Promise<any> => {
    const dbcontext = context;
    return dbcontext.asyncQueue({
      asyncTask: async () => {
        let res = await query(
          {
            type: QueryType.DOC_TYPE,
            docType: DocType.EMPLOYER,
            ID: '1'
          },
          dbcontext
        );
        res = res?.length > 0 ? JSON.parse(res[0].json) : null;
        return res;
      }
    });
  };

  const getFundingAgencies = async (context?: {
    asyncQueue: (request: DBRequest) => Promise<any>;
    ready: boolean;
  }): Promise<any> => {
    const dbcontext = context;
    return dbcontext.asyncQueue({
      asyncTask: async () => {
        let res = await query(
          {
            type: QueryType.DOC_TYPE,
            docType: DocType.AGENCY,
            ID: '1'
          },
          dbcontext
        );
        res = res?.length > 0 ? JSON.parse(res[0].json) : null;
        return res;
      }
    });
  };

  const getRolesForUser = async (context?: {
    asyncQueue: (request: DBRequest) => Promise<any>;
    ready: boolean;
  }): Promise<any> => {
    const dbcontext = context;
    return dbcontext.asyncQueue({
      asyncTask: async () => {
        let res = await query(
          {
            type: QueryType.DOC_TYPE,
            docType: DocType.USER_ROLE,
            ID: '1'
          },
          dbcontext
        );
        res = res?.length > 0 ? JSON.parse(res[0].json) : null;
        return res;
      }
    });
  };

  const getRoles = async (context?: {
    asyncQueue: (request: DBRequest) => Promise<any>;
    ready: boolean;
  }): Promise<any> => {
    const dbcontext = context;
    return dbcontext.asyncQueue({
      asyncTask: async () => {
        let res = await query(
          {
            type: QueryType.DOC_TYPE,
            docType: DocType.ROLE,
            ID: '1'
          },
          dbcontext
        );
        res = res?.length > 0 ? JSON.parse(res[0].json) : null;
        return res;
      }
    });
  };

  const getCurrentUser = async (context?: {
    asyncQueue: (request: DBRequest) => Promise<any>;
    ready: boolean;
  }): Promise<any> => {
    const dbcontext = context;
    return dbcontext.asyncQueue({
      asyncTask: async () => {
        let res = await query(
          {
            type: QueryType.DOC_TYPE,
            docType: DocType.USER,
            ID: '1'
          },
          dbcontext
        );
        res = res?.length > 0 ? JSON.parse(res[0].json) : null;
        return res;
      }
    });
  };

  /**
   * Fetch activities by search criteria.  Also can be used to get cached reference activities on mobile.
   *
   * @param {activitiesSearchCriteria} activitiesSearchCriteria
   * @return {*}  {Promise<any>}
   */
  const getActivities = async (
    activitiesSearchCriteria: IActivitySearchCriteria,
    context?: { asyncQueue: (request: DBRequest) => Promise<any>; ready: boolean },
    forceCache = false,
    referenceCache = false
  ): Promise<any> => {
    if (Capacitor.getPlatform() === 'web') {
      return await api.getActivities(activitiesSearchCriteria);
    } else {
      if (forceCache === true || !networkContext.connected) {
        const dbcontext = context;
        const table = referenceCache ? 'reference_activity' : 'activity';
        const typeClause = activitiesSearchCriteria.activity_type
          ? ` and json_extract(json(json), '$.activity_type') IN (${JSON.stringify(
              activitiesSearchCriteria.activity_type
            ).replace(/[\[\]']+/g, '')})`
          : '';
        const subTypeClause = activitiesSearchCriteria.activity_subtype
          ? ` and json_extract(json(json), '$.activity_subtype') IN (${JSON.stringify(
              activitiesSearchCriteria.activity_subtype
            ).replace(/[\[\]']+/g, '')})`
          : '';

        const sql = `select * from ${table} where 1=1 ${typeClause} ${subTypeClause}`;

        const asyncReturnVal = await dbcontext.asyncQueue({
          asyncTask: () => {
            return query(
              {
                type: QueryType.RAW_SQL,
                sql: sql
              },
              dbcontext
            );
          }
        });
        return {
          rows: asyncReturnVal.map((val) => JSON.parse(val.json)),
          count: asyncReturnVal.length
        };
      } else {
        const response = await api.getActivities(activitiesSearchCriteria);
        return response;
      }
    }
  };

  /**
   * Fetch activities (lean) by search criteria.
   *
   * @param {activitiesSearchCriteria} activitiesSearchCriteria
   * @return {*}  {Promise<any>}
   */
  const getActivitiesLean = async (
    activitiesSearchCriteria: IActivitySearchCriteria,
    context: { asyncQueue: (request: DBRequest) => Promise<any>; ready: boolean }
  ): Promise<any> => {
    if (Capacitor.getPlatform() === 'web') {
      const response = await api.getActivitiesLean(activitiesSearchCriteria);
      return response;
    } else {
      if (!networkContext.connected) {
        const featuresArray = await fetchLayerDataFromLocal(
          'LEAN_ACTIVITIES',
          activitiesSearchCriteria.search_feature,
          context
        );

        return {
          rows: featuresArray,
          count: featuresArray.length
        };
      } else {
        const response = await api.getActivitiesLean(activitiesSearchCriteria);
        return response;
      }
    }
  };

  /**
   * Create a new activity record.
   *
   * @param {ICreateOrUpdateActivity} activity
   * @return {*}  {Promise<any>}
   */
  const createActivity = async (
    activity: ICreateOrUpdateActivity,
    context?: { asyncQueue: (request: DBRequest) => Promise<any>; ready: boolean }
  ): Promise<any> => {
    if (Capacitor.getPlatform() === 'web') {
      return await api.createActivity(activity);
    } else {
      const dbcontext = context;
      return dbcontext.asyncQueue({
        asyncTask: () => {
          return upsert(
            [
              {
                type: UpsertType.MOBILE_ACTIVITY_CREATE,
                docType: DocType.ACTIVITY,
                ID: activity.activity_id,
                json: activity,
                activity_subtype: activity.activity_subtype,
                sync_status: ActivitySyncStatus.NOT_SAVED
              }
            ],
            dbcontext
          );
        }
      });
    }
  };
  /**
   * Delete activities by ids.
   *
   * @param {string[]} activityIds
   * @return {*}  {Promise<any>}
   */
  const deleteActivities = async (
    activityIds: string[],
    context?: { asyncQueue: (request: DBRequest) => Promise<any>; ready: boolean }
  ): Promise<any> => {
    if (Capacitor.getPlatform() === 'web') {
      return await api.deleteActivities(activityIds);
    } else {
      const dbcontext = context;
      return dbcontext.asyncQueue({
        asyncTask: () => {
          const idsForSQL = JSON.stringify(activityIds).replace(/[\[\]']+/g, '');
          const sql = `DELETE FROM Activity WHERE id IN ${'(' + idsForSQL + ')'}`;
          return upsert(
            [
              {
                type: UpsertType.RAW_SQL,
                sql: sql
              }
            ],
            dbcontext
          );
        }
      });
    }
  };

  const createUser = async (context?: {
    asyncQueue: (request: DBRequest) => Promise<any>;
    ready: boolean;
  }): Promise<any> => {
    const dbcontext = context;
    return dbcontext.asyncQueue({
      asyncTask: async () => {
        let res = await query(
          {
            type: QueryType.DOC_TYPE,
            docType: DocType.USER_ROLE,
            ID: '1'
          },
          dbcontext
        );
        res = res?.length > 0 ? JSON.parse(res[0].json) : null;
        return res;
      }
    });
  };

  /**
   * Get appState
   *
   * @param {any} selector
   * @return {*}  {Promise<any>}
   */
  const getAppState = (): any => {
    const raw_old = localStorage.getItem('appstate-invasivesbc');
    if (raw_old) {
      return JSON.parse(raw_old);
    }
  };

  /**
   * Sync cached records
   * Used for syncing a user's cached mobile records
   * with the InvasivesBC DB
   *
   * @return {*} {Promise<any>}
   */
  const syncCachedRecords = async (): Promise<any> => {
    // Only callable on mobile
    if (Capacitor.getPlatform() !== 'web' && networkContext.connected) {
      await getActivitiesForMobileSync(
        { activity_type: ['Observation', 'Treatment', 'Monitoring'] },
        databaseContext
      ).then((res: any) => {
        if (res.count > 0) {
          res.rows.forEach(async (row: ICreateOrUpdateActivity) => {
            try {
              await api.createActivity(row);
            } catch (err) {
              console.log('Error saving activity to api');
            }
            let tempRow: ICreateOrUpdateActivity = row;
            tempRow.sync_status = ActivitySyncStatus.SAVE_SUCCESSFUL;
            console.log(tempRow);
            updateActivity(tempRow, databaseContext);
          });
        }
      });
    }
  };

  /**
   * Get appState
   *
   * @param {any} activeActivity
   * @return {*}  {Promise<any>}
   */
  const setAppState = async (
    newState: any,
    context?: { asyncQueue: (request: DBRequest) => Promise<any>; ready: boolean }
  ): Promise<any> => {
    if (Capacitor.getPlatform() === 'web') {
      const old = getAppState();
      if (old) {
        localStorage.setItem('appstate-invasivesbc', JSON.stringify({ ...old, ...newState }));
      } else {
        localStorage.setItem('appstate-invasivesbc', JSON.stringify({ ...newState }));
      }
    } else {
      const dbcontext = context;

      const appStateDoc = getAppState();

      return dbcontext.asyncQueue({
        asyncTask: () => {
          return upsert(
            [
              {
                type: UpsertType.DOC_TYPE_AND_ID_SLOW_JSON_PATCH,
                docType: DocType.APPSTATE,
                ID: '1',
                json: { ...appStateDoc, ...newState }
              }
            ],
            dbcontext
          );
        }
      });
    }
  };

  return {
    ...api,
    getPointsOfInterest,
    getPointsOfInterestLean,
    getActivityById,
    updateActivity,
    getTrips,
    addTrip,
    getActivities,
    getActivitiesLean,
    createActivity,
    deleteActivities,
    getAppState,
    setAppState,
    getJurisdictions,
    getRISOs,
    syncCachedRecords,
    getApplicationUsers,
    cacheApplicationUsers,
    getRoles,
    getRolesForUser,
    getEmployers,
    getFundingAgencies,
    cacheEmployers,
    cacheFundingAgencies,
    cacheAllRoles,
    cacheRolesForUser,
    cacheCurrentUserBCEID,
    cacheCurrentUserIDIR,
    getCurrentUser,
    createUser
  };
};
