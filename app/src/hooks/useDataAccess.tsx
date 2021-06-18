import { IPointOfInterestSearchCriteria } from 'interfaces/useInvasivesApi-interfaces';
import { useInvasivesApi } from './useInvasivesApi';
import { DatabaseContext, query, QueryType, upsert, UpsertType } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState } from 'react';
import { DocType } from 'constants/database';

const useDataAccess = () => {
  const api = useInvasivesApi();
  const databaseContext = useContext(DatabaseContext);

  const getPointsOfInterest = async (
    pointsOfInterestSearchCriteria: IPointOfInterestSearchCriteria,
    onlineQuery: boolean,
    limit?: number,
    offset?: number
  ): Promise<any> => {
    if (onlineQuery) {
      api.getPointsOfInterest(pointsOfInterestSearchCriteria);
    } else {
      query({ type: QueryType.DOC_TYPE, docType: DocType.REFERENCE_POINT_OF_INTEREST, limit: 1000 }, databaseContext);
    }
  };

  return { getPointsOfInterest };
};
