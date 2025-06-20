import { useContext, useEffect, useRef } from 'react';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { IControl } from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { MapContext } from 'UI/Features/LegacyMap/helpers/components/MapContext';

import useDrawMode from 'UI/Features/LegacyMap/helpers/components/DrawControls/hooks/useDrawMode';

import { TargetMode } from 'UI/Features/LegacyMap/helpers/components/DrawControls/constants';
import DrawModeDisplay from 'UI/Features/LegacyMap/helpers/components/DrawControls/DrawModeDisplay'; // import { DoNothing } from '../../../functional/do-nothing-mode';
import { DoNothing } from 'UI/Features/LegacyMap/helpers/functional/do-nothing-mode';

// @ts-expect-error mapboxdraw compatibility with maplibre-gl issue
MapboxDraw.constants.classes.CONTROL_BASE = 'maplibregl-ctrl';
// @ts-expect-error mapboxdraw compatibility with maplibre-gl issue
MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-';
// @ts-expect-error mapboxdraw compatibility with maplibre-gl issue
MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group';

export default function useDrawInstance() {
  const map = useContext(MapContext);
  const mode = useDrawMode();
  const drawRef = useRef<MapboxDraw>();
  const displayRef = useRef<DrawModeDisplay>();

  const disableDrawButtons = (disable: boolean) => {
    const btns = document.querySelectorAll('.mapbox-gl-draw_ctrl-draw-btn');
    btns.forEach((btn) => {
      (btn as HTMLButtonElement).disabled = disable;
      btn.classList.toggle('disabled', disable);
    });
  };

  // mount / unmount draw controls
  useEffect(() => {
    if (!map) return;

    const draw = new MapboxDraw({
      displayControlsDefault: true,
      touchEnabled: true,
      controls: {
        combine_features: false,
        uncombine_features: false
      },
      userProperties: true,
      modes: {
        ...MapboxDraw.modes,
        do_nothing: DoNothing
        // whats_here_box_mode: WhatsHereBoxMode,
        // geo_tracking_mode: GeoTrackingMode
      },
      styles: [
        {
          id: 'gl-edited-line',
          type: 'line',
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          filter: ['all', ['==', 'active', 'true']],
          paint: {
            'line-color': '#FCBA19',
            'line-dasharray': [0.2, 2],
            'line-width': 3
          }
        },
        {
          id: 'gl-drawn-line',
          type: 'line',
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          filter: ['all', ['==', 'active', 'false'], ['!=', 'user_error', 'true']],
          paint: {
            'line-color': '#FCBA19',
            'line-width': 3
          }
        },
        {
          id: 'gl-drawn-fill',
          type: 'fill',
          layout: {},
          filter: ['all', ['==', 'active', 'false'], ['!=', 'user_error', 'true']],
          paint: {
            'fill-color': 'white',
            'fill-opacity': 0.5
          }
        },
        {
          id: 'gl-error-line',
          type: 'line',
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': ['match', ['get', 'user_error'], 'true', '#B00020', 'false', '#FCBA19', '#FCBA19'],
            'line-dasharray': [1, 2],
            'line-width': 3
          }
        },
        {
          id: 'gl-draw-polygon-point',
          type: 'circle',
          paint: {
            'circle-radius': 3,
            'circle-color': ['match', ['get', 'user_error'], 'true', '#B00020', 'false', '#FCBA19', '#FCBA19'],
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          }
        },
        {
          id: 'whats-here-box-start-point-marker',
          filter: ['all', ['==', 'mode', 'whats_here_box_mode'], ['==', 'meta:type', 'Point']],
          type: 'circle',
          paint: {
            'circle-radius': 4,
            'circle-color': '#FCBA19',
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          }
        }
      ]
    });

    map.addControl(draw as unknown as IControl, 'top-left');
    drawRef.current = draw;

    const modeDisplay = new DrawModeDisplay(mode);
    map.addControl(modeDisplay, 'top-left');
    displayRef.current = modeDisplay;

    return () => {
      if (draw) {
        (map as unknown as mapboxgl.Map).removeControl(draw);
        map.removeControl(modeDisplay);
        drawRef.current = undefined;
        displayRef.current = undefined;
      }
    };
  }, [map]);

  useEffect(() => {
    const draw = drawRef.current;
    const display = displayRef.current;
    if (!draw || !display) return;

    display.setMode(mode);
    console.log('mode---->', mode, mode === TargetMode.DISABLED, draw);

    if (mode === TargetMode.DISABLED) {
      disableDrawButtons(true);
      draw.changeMode('do_nothing');
      draw.deleteAll();
      return;
    }
    disableDrawButtons(false);

    switch (mode) {
      case TargetMode.ACTIVITY:
        draw.changeMode('simple_select');
        break;

      default:
        draw.changeMode('do_nothing');
        disableDrawButtons(true);
        break;
    }
  }, [mode]);
  return drawRef.current;
}
