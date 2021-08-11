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

/**
 * Returns a set of supported api methods.
 *
 * @return {object} object whose properties are supported api methods.
 *
 */
export const useDataAccess = () => {
  const api = useInvasivesApi();
  const databaseContext = useContext(DatabaseContext2);
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
      return api.getActivityById(activityId);
    } else {
      if (forceCache === true || !networkStatus.connected) {
        const dbcontext = context;
        const asyncReturnVal = await dbcontext.asyncQueue({
          asyncTask: () => {
            return query(
              {
                type: QueryType.DOC_TYPE_AND_ID,
                docType: DocType.ACTIVITY,
                ID: activityId
              },
              dbcontext
            );
          }
        });
        return asyncReturnVal;
      } else {
        return api.getActivityById(activityId);
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
      if (forceCache === false || !networkStatus.connected) {
        const dbcontext = context;
        const asyncReturnVal = await dbcontext.asyncQueue({
          asyncTask: () => {
            return query(
              {
                type: QueryType.DOC_TYPE,
                docType: DocType.ACTIVITY
              },
              dbcontext
            );
          }
        });
        return asyncReturnVal;
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
                type: UpsertType.DOC_TYPE_AND_ID_SLOW_JSON_PATCH,
                docType: DocType.ACTIVITY,
                ID: '1',
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
                sql: `DELETE * FROM Activity WHERE id IN ${JSON.stringify(activityIds)}`
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
    deleteActivities
  };
};
