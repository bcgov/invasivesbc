import {
  IActivitySearchCriteria,
  ICreateOrUpdateActivity,
  IMetabaseQuerySearchCriteria,
  ICreateMetabaseQuery,
  IPointOfInterestSearchCriteria
} from 'interfaces/useInvasivesApi-interfaces';
import { useInvasivesApi } from './useInvasivesApi';
import { DatabaseContext2, query, QueryType, upsert, UpsertType } from 'contexts/DatabaseContext2';
import { useContext } from 'react';
import { DocType } from 'constants/database';
import { Capacitor } from '@capacitor/core';
import { DBRequest } from 'contexts/DatabaseContext2';
import { NetworkContext } from 'contexts/NetworkContext';
import { Network } from '@capacitor/network';
import { setMonth } from 'date-fns';
import { DatabaseContext } from 'contexts/DatabaseContext';

/**
 * Returns a set of supported api methods.
 *
 * @return {object} object whose properties are supported api methods.
 *
 */
export const useDataAccess = () => {
  const api = useInvasivesApi();
  const databaseContext = useContext(DatabaseContext2);
  const databaseContextPouch = useContext(DatabaseContext);
  const networkContext = useContext(NetworkContext);
  const platform = Capacitor.getPlatform();
  /** //---------------COMPLETED
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
    forceCache?: boolean
  ): Promise<any> => {
    const networkStatus = await Network.getStatus();
    if (platform === 'web') {
      return api.getPointsOfInterest(pointsOfInterestSearchCriteria);
    } else {
      if (forceCache === true || !networkStatus.connected) {
        const dbcontext = context;
        const asyncReturnVal = await dbcontext.asyncQueue({
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
        return asyncReturnVal;
      } else {
        return api.getPointsOfInterest(pointsOfInterestSearchCriteria);
      }
    }
  };

  /** //---------------COMPLETED
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
    forceCache?: boolean
  ): Promise<any> => {
    const networkStatus = await Network.getStatus();
    if (Capacitor.getPlatform() == 'web') {
      return await api.getActivityById(activityId);
    } else {
      if (forceCache === true || !networkStatus.connected) {
        const dbcontext = context;
        const asyncReturnVal = await dbcontext.asyncQueue({
          asyncTask: async () => {
            const res = await query(
              {
                type: QueryType.DOC_TYPE_AND_ID,
                docType: DocType.ACTIVITY,
                ID: activityId
              },
              dbcontext
            );
            return JSON.parse(res[0].json);
          }
        });
        return asyncReturnVal;
      } else {
        return await api.getActivityById(activityId);
      }
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
      //TODO: implement getting old version from derver and making new with overwritten props
      // IN USEINVASIVES API
      return api.updateActivity(activity);
    } else {
      const dbcontext = context;
      const asyncReturnVal = await dbcontext.asyncQueue({
        asyncTask: () => {
          return upsert(
            [
              {
                type: UpsertType.DOC_TYPE_AND_ID_SLOW_JSON_PATCH,
                docType: DocType.ACTIVITY,
                json: activity,
                ID: activity.activity_id
              }
            ],
            dbcontext
          );
        }
      });
      return asyncReturnVal;
    }
  };

  /** //---------------COMPLETED
   * Get all the trip records
   *
   * @return {*}  {Promise<any>}
   */
  const getTrips = async (context?: { asyncQueue: (request: DBRequest) => Promise<any>; ready: boolean }) => {
    const dbcontext = context;
    const asyncReturnVal = await dbcontext.asyncQueue({
      asyncTask: () => {
        return query({ type: QueryType.DOC_TYPE, docType: DocType.TRIP }, dbcontext);
      }
    });
    return asyncReturnVal;
  };

  /** //---------------COMPLETED
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
    const asyncReturnVal = await dbcontext.asyncQueue({
      asyncTask: () => {
        return upsert([{ type: UpsertType.DOC_TYPE, docType: DocType.TRIP, json: newTripObj }], dbcontext);
      }
    });
    return asyncReturnVal;
  };

  /** //---------------COMPLETED
   * Fetch activities by search criteria.
   *
   * @param {activitiesSearchCriteria} activitiesSearchCriteria
   * @return {*}  {Promise<any>}
   */
  const getActivities = async (
    activitiesSearchCriteria: IActivitySearchCriteria,
    context?: { asyncQueue: (request: DBRequest) => Promise<any>; ready: boolean },
    forceCache?: boolean
  ): Promise<any> => {
    const networkStatus = await Network.getStatus();
    if (Capacitor.getPlatform() === 'web') {
      return api.getActivities(activitiesSearchCriteria);
    } else {
      if (forceCache === true || !networkStatus.connected) {
        const dbcontext = context;

        const asyncReturnVal = await dbcontext.asyncQueue({
          asyncTask: () => {
            return query(
              {
                type: QueryType.RAW_SQL,
                sql: `select * from activity WHERE json_extract(json(json), '$.activity_subtype') IN (${JSON.stringify(
                  activitiesSearchCriteria.activity_subtype
                ).replace(/[\[\]']+/g, '')})`
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

  /** //---------------COMPLETED
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
      const dbcontext = context;
      const asyncReturnVal = await dbcontext.asyncQueue({
        asyncTask: () => {
          return upsert(
            [
              {
                type: UpsertType.DOC_TYPE_AND_ID,
                docType: DocType.ACTIVITY,
                ID: activity.activity_id,
                json: activity
              }
            ],
            dbcontext
          );
        }
      });
      return asyncReturnVal;
    }
  };
  /** //---------------COMPLETED
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
      const asyncReturnVal = await dbcontext.asyncQueue({
        asyncTask: () => {
          return upsert(
            [
              {
                type: UpsertType.RAW_SQL,
                sql: `DELETE FROM Activity WHERE id IN ${
                  '(' + JSON.stringify(activityIds).replace(/[\[\]']+/g, '') + ')'
                }`
              }
            ],
            dbcontext
          );
        }
      });
      return asyncReturnVal;
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
      const appStateResults = await databaseContextPouch.database.find({ selector: { _id: DocType.APPSTATE } });
      return appStateResults;
    } else {
      const dbcontext = context;
      const asyncReturnVal = await dbcontext.asyncQueue({
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
      return asyncReturnVal;
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
      const res = await databaseContextPouch.database.upsert(DocType.APPSTATE, (appStateDoc) => {
        const updatedActivity = { ...appStateDoc, ...newState };
        return updatedActivity;
      });
      return res;
    } else {
      const dbcontext = context;

      let appStateDoc = await getAppState(dbcontext);

      const asyncReturnVal = await dbcontext.asyncQueue({
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
      return asyncReturnVal;
    }
  };

  return {
    getPointsOfInterest,
    getActivityById,
    updateActivity,
    getTrips,
    addTrip,
    getActivities,
    createActivity,
    deleteActivities,
    getAppState,
    setAppState
  };
};
