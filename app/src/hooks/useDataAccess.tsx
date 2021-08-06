import { ICreateOrUpdateActivity, IPointOfInterestSearchCriteria } from 'interfaces/useInvasivesApi-interfaces';
import { useInvasivesApi } from './useInvasivesApi';
import { DatabaseContext, query, QueryType, upsert, UpsertType } from 'contexts/DatabaseContext';
import { useContext } from 'react';
import { DocType } from 'constants/database';
import { Capacitor } from '@capacitor/core';
import { DBRequest } from 'contexts/DatabaseContext2';

/**
 * Returns a set of supported api methods.
 *
 * @return {object} object whose properties are supported api methods.
 *
 */
export const useDataAccess = () => {
  const api = useInvasivesApi();
  const databaseContext = useContext(DatabaseContext);

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
    isOnline?: boolean
  ): Promise<any> => {
    if (pointsOfInterestSearchCriteria.online) {
      return api.getPointsOfInterest(pointsOfInterestSearchCriteria);
    } else {
      if (isOnline === false) {
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
    isOnline?: boolean
  ): Promise<any> => {
    if (Capacitor.getPlatform() === 'web') {
      return api.getActivityById(activityId);
    } else {
      if (isOnline === false) {
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
    },
    isOnline?: boolean
  ): Promise<any> => {
    if (Capacitor.getPlatform() === 'web') {
      return api.updateActivity(activity);
    } else {
      if (isOnline === false) {
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
    }
  };

  return { getPointsOfInterest, getActivityById, updateActivity };
};
