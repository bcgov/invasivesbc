import { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { MapContext } from '../MapContext';
import { MapMouseEvent, MapTouchEvent, Popup } from 'maplibre-gl';
import ReactDOM from 'react-dom/client';
import LayerDataMarkerContent from './LayerDataMarkerContent';
import { useHistory } from 'react-router';

const LayerDataMarker = () => {
  const map = useContext(MapContext);
  const popupRef = useRef<Popup>(); // Hold ref to prevent multiple appearing at once on Mobile
  const touchTime = useRef<number>(0);
  const history = useHistory();
  const recordsetLayers = useMemo(() => {
    if (!map) return [];
    return map
      .getLayersOrder()
      .filter((layer) => layer.includes('recordset-layer-') || layer.includes('offline-activity'));
  }, [map?.getLayersOrder()]);

  const queryFeaturesAtEpicenter = useCallback(
    (e: MapMouseEvent | MapTouchEvent) => {
      if (!map) return;

      const uniqueFormattedFeaturesAtClickTarget = Array.from(
        new Map(
          map
            .queryRenderedFeatures(e.point, { layers: recordsetLayers })
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

      // Maplibre needs a static element for its markers. Because we're injecting React in. Estimate the size of the rendered container
      // So the anchoring works as expected, else maplibre will calculate 0 for both, forcing items to render off screen.
      const el = document.createElement('div');
      const estPixelHeightOfPopover = 125 + Math.min(uniqueFormattedFeaturesAtClickTarget.length, 4) * 35;
      el.style.minHeight = `${estPixelHeightOfPopover}px`;
      el.style.minWidth = '220px';
      el.style.backgroundColor = 'transparent';
      el.className = 'map-features-root';

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
      popupRef.current.setDOMContent(el);
    },
    [map, recordsetLayers, popupRef] // dependencies
  );
  /**
   * @desc Sets time touch event started at
   */
  const handleTouchStart = useCallback((e: MapTouchEvent) => {
    touchTime.current = e.originalEvent.timeStamp;
  }, []);

  const handleTouchEnd = useCallback(
    (e: MapTouchEvent) => {
      const MAXIMUM_TOUCH_TIME = 125; // ms
      if (e.originalEvent.timeStamp - touchTime.current < MAXIMUM_TOUCH_TIME) {
        queryFeaturesAtEpicenter(e);
      }
    },
    [queryFeaturesAtEpicenter]
  );

  // Setup/teardown of react hooks. remove lingering popupRef if applicable.
  useEffect(() => {
    if (!map) return;
    map.on('click', queryFeaturesAtEpicenter);
    map.on('touchstart', handleTouchStart);
    map.on('touchend', handleTouchEnd);
    return () => {
      map.off('click', queryFeaturesAtEpicenter);
      map.off('touchstart', handleTouchStart);
      map.off('touchend', handleTouchEnd);
      popupRef?.current?.remove();
    };
  }, [map?.isStyleLoaded()]);

  return null;
};

export default LayerDataMarker;
