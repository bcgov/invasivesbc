import { getSearchCriteriaFromFilters } from 'components/activities-list/Tables/Plant/ActivityGrid';
import { IActivitySearchCriteria } from 'interfaces/useInvasivesApi-interfaces';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ActivitiesLayerV2 } from './ActivitiesLayerV2';
import { useSelector } from '../../../state/utilities/use_selector';
import { selectAuth } from '../../../state/reducers/auth';
import { selectUserSettings } from 'state/reducers/userSettings';
import { selectActivites } from 'state/reducers/activities';

export const RecordSetLayersRenderer = (props: any) => {
  const [layersToRender, setLayersToRender] = useState([]);
  const { accessRoles } = useSelector(selectAuth);
  const { recordSets } = useSelector(selectUserSettings);
  const activitiesState = useSelector(selectActivites);

  interface ILayerToRender {
    filter: IActivitySearchCriteria;
    color: any;
    setName: string;
  }

  useEffect(() => {
    const sets = Object.keys(recordSets);
    if (!sets || !sets.length) {
      return;
    }

    const layers = sets.map((s) => {
      let l: any = {};
      l.color = recordSets[s].color;
      l.setName = s;
      l.drawOrder = recordSets[s].drawOrder;
      return l;
    });

    setLayersToRender([...layers]);
  }, [recordSets, activitiesState?.activitiesGeoJSON]);

  return (
    <>
      {layersToRender.map((l) => {
        if (l && l.color) {
          return (
            <ActivitiesLayerV2
              key={'activitiesv2filter' + l.setName}
              activities={
                activitiesState?.activitiesGeoJSON?.filter((x) => {
                  return x.recordSetID === l.setName;
                })[0]?.rows
              }
              filters={l.filters}
              zIndex={999999999 - l.drawOrder}
              color={l.color}
              opacity={0.8}
            />
          );
        }
      })}
    </>
  );
};
