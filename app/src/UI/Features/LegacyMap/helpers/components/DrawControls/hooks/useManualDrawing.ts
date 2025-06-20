import { useContext, useEffect, useRef } from 'react';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import useDrawMode from 'UI/Features/LegacyMap/helpers/components/DrawControls/hooks/useDrawMode';
import { useDispatch } from 'utils/use_selector';
import { TargetMode } from 'UI/Features/LegacyMap/helpers/components/DrawControls/constants';

import { MAP_ON_SHAPE_CREATE, MAP_ON_SHAPE_UPDATE } from 'state/actions';
import { MapContext } from 'UI/Features/LegacyMap/helpers/components/MapContext';

export default function useManualDrawing(draw?: MapboxDraw) {
  const dispatch = useDispatch();
  const map = useContext(MapContext);
  const { mode, prevMode } = useDrawMode();

  useEffect(() => {
    console.log(mode, TargetMode.ACTIVITY, mode !== TargetMode.ACTIVITY);

    // if (!map || !draw || mode !== TargetMode.ACTIVITY) {
    //   prevMode.current = mode!;
    //   return;
    // }
    const handleCreate = (e: any) => {
      const feature = e.features[0];
      draw?.deleteAll();
      draw?.add(feature);
      dispatch({ type: MAP_ON_SHAPE_CREATE, payload: feature });
    };

    const handleUpdate = (e: any) => {
      const edited = draw?.getAll().features[0];
      const incoming = e.features?.[0];

      if (edited && incoming?.id !== edited.id) {
        dispatch({ type: MAP_ON_SHAPE_UPDATE, payload: edited });
      }
    };

    if (prevMode !== TargetMode.ACTIVITY && mode === TargetMode.ACTIVITY) {
      map?.on('draw.create', handleCreate);
      map?.on('draw.selectionchange', handleUpdate);
    }

    return () => {
      if (prevMode === TargetMode.ACTIVITY && mode !== TargetMode.ACTIVITY) {
        map?.off('draw.create', handleCreate);
        map?.off('draw.selectionchange', handleUpdate);
      }
    };
  }, [map, draw, mode, prevMode, dispatch]);
}
