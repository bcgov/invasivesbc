import { ICreateOrUpdateActivity, IPointOfInterestSearchCriteria } from 'interfaces/useInvasivesApi-interfaces';
import { useInvasivesApi } from './useInvasivesApi';
import { DatabaseContext, query, QueryType } from 'contexts/DatabaseContext';
import { useContext } from 'react';
import { DocType } from 'constants/database';
import { Capacitor } from '@capacitor/core';

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
  const getPointsOfInterest = async (pointsOfInterestSearchCriteria: IPointOfInterestSearchCriteria): Promise<any> => {
    if (pointsOfInterestSearchCriteria.online) {
      return api.getPointsOfInterest(pointsOfInterestSearchCriteria);
    } else {
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
  };

  /**
   * Fetch a signle activity by its id.
   *
   * @param {string} activityId
   * @return {*}  {Promise<any>}
   */
  const getActivityById = async (activityId: string): Promise<any> => {
    if (Capacitor.getPlatform() === 'web') {
      return api.getActivityById(activityId);
    } else {
      //TODO: Implement for mobile
      console.log('not implemented yet');
      return;
    }
  };

  /**
   * Update an existing activity record.
   *
   * @param {ICreateOrUpdateActivity} activity
   * @return {*}  {Promise<any>}
   */
  const updateActivity = async (activity: ICreateOrUpdateActivity): Promise<any> => {
    if (Capacitor.getPlatform() === 'web') {
      return api.updateActivity(activity);
    } else {
      //TODO: Implement for mobile
      console.log('not implemented yet');
    }
  };

  return { getPointsOfInterest, getActivityById, updateActivity };
};
