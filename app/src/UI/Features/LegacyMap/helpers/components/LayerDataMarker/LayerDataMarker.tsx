import { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { MapContext } from '../MapContext';
import { MapMouseEvent, MapTouchEvent, Point, PointLike, Popup } from 'maplibre-gl';
import ReactDOM from 'react-dom/client';
import LayerDataMarkerContent from './LayerDataMarkerContent';
import { useHistory } from 'react-router';
import { useSelector } from 'utils/use_selector';

const LayerDataMarker = () => {
  const MINIMUM_ZOOM = 12;
  const BUFFER_IN_PX = 5;

  const map = useContext(MapContext);
  const history = useHistory();

  const whatsHereEnabled = useSelector((state) => state.Map.whatsHere.toggle);
  const connected = useSelector((state) => state.Network.connected);

  const drawToolsActive = useRef<boolean>(false);
  const popupRef = useRef<Popup>();
  const timeOfTouchStart = useRef<number>(0);

  const recordsetLayers = useMemo(() => {
    if (!map) return [];
    return map
      .getLayersOrder()
      .filter((layer) => layer.includes('recordset-layer-') || layer.includes('offline-activity'));
  }, [map?.getLayersOrder()]);

  const createPopupDiv = (numFeatures: number): HTMLDivElement => {
    /* 
      Maplibre needs a static element for its popup so it can calculate the anchor position. Because we're injecting React in it can't calculate the size.
      To make the anchoring work as expected, provide defaults based on its smallest size, else maplibre will calculate HxW at 0, and will frequently render outside the viewport
    */
    const BASE_CONTAINER_SIZE = 125; //in px
    const SIZE_OF_ROW = 35; //in px
    const BASE_CONTAINER_WIDTH = 210; //in px, Approximate width of smallest container size
    const estPixelHeightOfPopover = BASE_CONTAINER_SIZE + Math.min(numFeatures, 3) * SIZE_OF_ROW;

    const el = document.createElement('div');
    el.style.minHeight = `${estPixelHeightOfPopover}px`;
    el.style.minWidth = `${BASE_CONTAINER_WIDTH}px`;
    el.className = 'map-features-root';
    return el;
  };

  //
  const queryFeaturesAtTarget = useCallback(
    (e: MapMouseEvent | MapTouchEvent) => {
      if (!map || !connected || drawToolsActive.current || whatsHereEnabled || map.getZoom() < MINIMUM_ZOOM) return;
      // Buffer target to avoid needing pinpoint accuracy
      const bbox: [PointLike, PointLike] = [
        new Point(e.point.x - BUFFER_IN_PX, e.point.y - BUFFER_IN_PX),
        new Point(e.point.x + BUFFER_IN_PX, e.point.y + BUFFER_IN_PX)
      ];
      const uniqueFormattedFeaturesAtClickTarget = Array.from(
        new Map(
          map
            .queryRenderedFeatures(bbox, { layers: recordsetLayers })
            .map((feature) => {
              const isInvasivesRecord = 'short_id' in feature.properties;
              return isInvasivesRecord
                ? {
                    label: feature.properties.type,
                    value: feature.properties.short_id,
                    map_symbol: feature.properties.map_symbol,
                    url: '/Records/Activity:' + feature.properties.activity_id + '/form'
                  }
                : {
                    label: 'Site ID',
                    value: feature.properties.site_id,
                    map_symbol: feature.properties.map_symbol,
                    url: '/Records/IAPP/' + feature.properties.site_id + '/summary'
                  };
            })
            .map((obj) => [obj.value, obj])
        ).values()
      );

      if (!uniqueFormattedFeaturesAtClickTarget?.length) return;

      const el = createPopupDiv(uniqueFormattedFeaturesAtClickTarget.length);

      popupRef?.current?.remove(); // enforce singleton behaviour
      popupRef.current = new Popup({
        className: 'map-features-at-point',
        maxWidth: 'none',
        closeButton: true,
        closeOnMove: true
      })
        .setLngLat(e.lngLat)
        .setDOMContent(el)
        .addTo(map);

      // Inject React into the new static container
      const root = ReactDOM.createRoot(el);
      root.render(<LayerDataMarkerContent history={history} features={uniqueFormattedFeaturesAtClickTarget} />);
    },
    [map, recordsetLayers, popupRef, whatsHereEnabled, connected]
  );
  /**
   * @desc Sets time touch event started at
   */
  const handleTouchStart = useCallback((e: MapTouchEvent) => {
    timeOfTouchStart.current = e.originalEvent.timeStamp;
  }, []);

  const handleTouchEnd = useCallback(
    (e: MapTouchEvent) => {
      const MAXIMUM_TOUCH_TIME = 125; // ms
      if (e.originalEvent.timeStamp - timeOfTouchStart.current < MAXIMUM_TOUCH_TIME) {
        queryFeaturesAtTarget(e);
      }
    },
    [queryFeaturesAtTarget]
  );

  /**
   * @desc Updates with state of draw tools to prevent opening popup while user is attempting to draw.
   *       uses Timeout to so event doesn't occur in the same tick as 'queryFeaturesAtEpicenter'
   */
  const handleDrawModeChanged = (e) => {
    setTimeout(() => (drawToolsActive.current = e.mode !== 'simple_select'), 0);
  };

  // Setup/teardown of react hooks. remove lingering popupRef if applicable.
  useEffect(() => {
    if (!map) return;
    map.on('draw.modechange', handleDrawModeChanged);
    map.on('click', queryFeaturesAtTarget);
    map.on('touchstart', handleTouchStart);
    map.on('touchend', handleTouchEnd);
    return () => {
      map.off('draw.modechange', handleDrawModeChanged);
      map.off('click', queryFeaturesAtTarget);
      map.off('touchstart', handleTouchStart);
      map.off('touchend', handleTouchEnd);
      popupRef?.current?.remove();
    };
  }, [map?.isStyleLoaded(), whatsHereEnabled, recordsetLayers, connected]);

  return null;
};

export default LayerDataMarker;
