import { getSearchCriteriaFromFilters } from 'components/activities-list/Tables/Plant/ActivityGrid';
import { AuthStateContext } from 'contexts/authStateContext';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { MapRequestContext } from 'contexts/MapRequestsContext';
import { RecordSetContext } from 'contexts/recordSetContext';
import { IActivitySearchCriteria } from 'interfaces/useInvasivesApi-interfaces';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useMap, useMapEvent } from 'react-leaflet';
import { useDataAccess } from '../../../hooks/useDataAccess';
import { ActivitiesLayerV2 } from './ActivitiesLayerV2';
import { GeoJSONVtLayer } from './GeoJsonVtLayer';
import { createPolygonFromBounds } from './LtlngBoundsToPoly';

export const RecordSetLayersRenderer = (props: any) => {
  const { userInfo, rolesUserHasAccessTo } = useContext(AuthStateContext);
  const da = useDataAccess();
  const recordsetContext = useContext(RecordSetContext);
  const [layersToRender, setLayersToRender] = useState([]);
  interface ILayerToRender {
    filter: IActivitySearchCriteria;
    color: any;
    setName: string;
  }
  useEffect(() => {
    console.dir(recordsetContext.recordSetState);
    const sets = Object.keys(recordsetContext.recordSetState);
    if (!sets || !sets.length) {
      return;
    }
    console.dir(sets);

    const layers = sets.map((s) => {
      console.log(s);
      console.dir(s);
      console.log(recordsetContext.recordSetState[s].advancedFilters);
      let l: any = {};
      l.filters = getSearchCriteriaFromFilters(
        recordsetContext.recordSetState[s].advancedFilters,
        rolesUserHasAccessTo,
        recordsetContext,
        s
      );
      l.color = 'blue';
      l.setName = s;
      return l;
    });

    console.log('layers');
    console.dir(layers);
    setLayersToRender([...layers]);
  }, []);

  return (
    <>
      {layersToRender.map((l) => {
        if (l && l.filters) {
          return <ActivitiesLayerV2 key={'activitiesv2filter' + l} filters={l.filters} color={l.color} />;
        }
      })}
    </>
  );
};
