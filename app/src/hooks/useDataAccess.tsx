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
  IPointOfInterestSearchCriteria
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
  const keycloak = authContext.keycloak;

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
      return api.getPointsOfInterest(pointsOfInterestSearchCriteria);
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
        return api.getPointsOfInterest(pointsOfInterestSearchCriteria);
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
      return api.getPointsOfInterestLean(pointsOfInterestSearchCriteria);
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
        return api.getPointsOfInterestLean(pointsOfInterestSearchCriteria);
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
      return api.getJurisdictions(jurisdictionSearchCriteria);
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
        return api.getJurisdictions(jurisdictionSearchCriteria);
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
        return api.getActivityById(activityId);
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
          return api.getActivityById(activityId);
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
      return api.updateActivity(activity);
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
        console.log('RES FROM GETAPPLICATIONUSERS: ', res);
        return res;
      }
    });
  };

  const cacheApplicationUsers = async (context?: {
    asyncQueue: (request: DBRequest) => Promise<any>;
    ready: boolean;
  }) => {
    if (networkContext.connected && isMobile()) {
      console.log('Got here');
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
      return api.getActivities(activitiesSearchCriteria);
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
        return api.getActivities(activitiesSearchCriteria);
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
      return api.getActivitiesLean(activitiesSearchCriteria);
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
        return api.getActivitiesLean(activitiesSearchCriteria);
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
      return api.createActivity(activity);
    } else {
      console.log('Activity creating: ', activity);
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
      return api.deleteActivities(activityIds);
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

  /**
   * Get appState
   *
   * @param {any} selector
   * @return {*}  {Promise<any>}
   */
  const getAppState = async (context?: {
    asyncQueue: (request: DBRequest) => Promise<any>;
    ready: boolean;
  }): Promise<any> => {
    if (Capacitor.getPlatform() === 'web') {
      const raw_old = localStorage.getItem('appstate-invasivesbc');
      if (raw_old) {
        return JSON.parse(raw_old);
      }
    } else {
      const dbcontext = context;
      return dbcontext.asyncQueue({
        asyncTask: async () => {
          let res = await query(
            {
              type: QueryType.DOC_TYPE_AND_ID,
              docType: DocType.APPSTATE,
              ID: '1'
            },
            dbcontext
          );
          res = res?.length > 0 ? JSON.parse(res[0].json) : null;
          return res;
        }
      });
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
              api.createActivity(row);
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
      const old = await getAppState();
      if (old) {
        localStorage.setItem('appstate-invasivesbc', JSON.stringify({ ...old, ...newState }));
      } else {
        localStorage.setItem('appstate-invasivesbc', JSON.stringify({ ...newState }));
      }
    } else {
      const dbcontext = context;

      const appStateDoc = await getAppState(dbcontext);

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
    syncCachedRecords,
    getApplicationUsers,
    cacheApplicationUsers
  };
};
