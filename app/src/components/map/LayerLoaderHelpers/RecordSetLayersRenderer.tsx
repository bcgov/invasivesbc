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
  const userSettingsState = useSelector(selectUserSettings);
  const activitiesState = useSelector(selectActivites);

  interface ILayerToRender {
    filter: IActivitySearchCriteria;
    color: any;
    setName: string;
  }

  useEffect(() => {
    const sets = Object.keys(userSettingsState.recordSets);
    if (!sets || !sets.length) {
      return;
    }

    const layers = sets.map((s) => {
      let l: any = {};
      l.color = sets[s]?.color;
      l.setName = s;
      l.drawOrder = sets[s]?.drawOrder;
      l.activities = activitiesState?.activitiesGeoJSON?.filter((x) => {
        return x.recordSetID === l.setName;
      })[0]?.rows;
      return l;
    });

    setLayersToRender([...layers]);
    console.log(JSON.stringify(layers));
  }, [userSettingsState.recordSets, activitiesState]);

  return (
    <>
      {layersToRender.map((l) => {
        if (l && l.color) {
          return (
            <ActivitiesLayerV2
              key={'activitiesv2filter' + l.setName}
              activities={l.activities}
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
