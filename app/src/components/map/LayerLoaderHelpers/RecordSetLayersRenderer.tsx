import { getSearchCriteriaFromFilters } from 'components/activities-list/Tables/Plant/ActivityGrid';
import { IActivitySearchCriteria } from 'interfaces/useInvasivesApi-interfaces';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ActivitiesLayerV2 } from './ActivitiesLayerV2';
import { useSelector } from '../../../state/utilities/use_selector';
import { selectAuth } from '../../../state/reducers/auth';
import { selectActivities } from 'state/reducers/activities';

export const RecordSetLayersRenderer = (props: any) => {
  const { accessRoles } = useSelector(selectAuth);
  const activitiesState = useSelector(selectActivities);

  interface ILayerToRender {
    filter: IActivitySearchCriteria;
    color: any;
    setName: string;
  }

  return (
    <>
      {activitiesState?.activitiesGeoJSON?.map((l) => {
        //if (l && l.layerState.color) {
        if (true) {
          return (
            <ActivitiesLayerV2
              key={'activitiesv2filter' + l.recordSetID}
              activities={l.featureCollection}
              zIndex={999999999 - l.layerState.drawOrder}
              color={l.layerState.color}
              opacity={0.8}
            />
          );
        }
      })}
      {true && activitiesState?.IAPPGeoJSON?.length > 0 ? (
        activitiesState?.IAPPGeoJSON?.map((l) => {
          //if (l && l.layerState.color) {
          if (l?.featureCollection?.features?.length > 0) {
            return (
              <ActivitiesLayerV2
                key={'activitiesv2filter' + l.recordSetID}
                activities={l.featureCollection}
                zIndex={999999999 - l.layerState.drawOrder}
                color={l.layerState.color}
                isIAPP={true}
                opacity={0.8}
              />
            );
          }
        })
      ) : (
        <></>
      )}
    </>
  );
};
