import { getSearchCriteriaFromFilters } from 'components/activities-list/Tables/Plant/ActivityGrid';
import { RecordSetContext } from 'contexts/recordSetContext';
import { IActivitySearchCriteria } from 'interfaces/useInvasivesApi-interfaces';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ActivitiesLayerV2 } from './ActivitiesLayerV2';
import { useSelector } from "../../../state/utilities/use_selector";
import { selectAuth } from "../../../state/reducers/auth";

export const RecordSetLayersRenderer = (props: any) => {
  const recordsetContext = useContext(RecordSetContext);
  const [layersToRender, setLayersToRender] = useState([]);
  const { accessRoles } = useSelector(selectAuth);

  interface ILayerToRender {
    filter: IActivitySearchCriteria;
    color: any;
    setName: string;
  }

  useEffect(() => {
    console.log('****record set layer renderer record state***');
    console.dir(recordsetContext.recordSetState);
    const sets = Object.keys(recordsetContext.recordSetState);
    if (!sets || !sets.length) {
      return;
    }

    const layers = sets.map((s) => {
      let l: any = {};
      l.filters = getSearchCriteriaFromFilters(
        recordsetContext.recordSetState[s].advancedFilters,
        accessRoles,
        recordsetContext,
        s
      );
      l.color = recordsetContext.recordSetState[s].color;
      l.setName = s;
      l.drawOrder = recordsetContext.recordSetState[s].drawOrder;
      return l;
    });

    setLayersToRender([...layers]);
  }, [recordsetContext.recordSetState]);

  return (
    <>
      {layersToRender.map((l) => {
        if (l && l.filters && l.color) {
          return (
            <ActivitiesLayerV2
              key={'activitiesv2filter' + l.setName}
              filters={l.filters}
              zIndex={999999999 - l.drawOrder}
              color={l.color}
              opacity={0.8}
            />
          );
        } else {
          return <></>;
        }
      })}
    </>
  );
};
