import { IPointOfInterestSearchCriteria } from 'interfaces/useInvasivesApi-interfaces';
import { useInvasivesApi } from './useInvasivesApi';
import { DatabaseContext, query, QueryType, upsert, UpsertType } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState } from 'react';
import { DocType } from 'constants/database';

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

  return { getPointsOfInterest };
};
