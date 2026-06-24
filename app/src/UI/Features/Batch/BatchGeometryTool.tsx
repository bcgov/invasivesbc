import { useEffect, useRef, useState } from 'react';
import { InvasivesMap } from 'UI/Features/LegacyMap/InvasivesMap';
import { useSelector } from 'utils/use_selector';
import './BatchGeometryTool.css';
import { LngLat, MapMouseEvent } from 'maplibre-gl/dist/maplibre-gl-dev';
import { area, buffer, kinks, length as turfLength, lineString, lineToPolygon, point } from '@turf/turf';
import { Feature, GeoJsonProperties, MultiPolygon, Polygon } from 'geojson';
import { stringify } from 'wkt';
import { Button, Slider } from '@mui/material';
import { CopyAll } from '@mui/icons-material';

const BatchGeometryTool = () => {
  const MAX_AREA_MSQ = 500000;
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<InvasivesMap | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const MOBILE = useSelector((state) => state.Configuration.current.build.MOBILE);

  const [clickedPoints, setClickedPoints] = useState<LngLat[]>([]);

  const clickHandler = useRef<(e: MapMouseEvent) => void>(() => {});

  const [wellKnown, setWellKnown] = useState('');
  const [bufferedRadius, setBufferedRadius] = useState(3);
  const [geometry, setGeometry] = useState<Feature<Polygon | MultiPolygon, GeoJsonProperties> | undefined | null>(null);

  const [polygonMode, setPolygonMode] = useState<'LINESTRING' | 'POLYGON'>('LINESTRING');

  const [shapeArea, setShapeArea] = useState<number | undefined>(undefined);
  const [kinked, setKinked] = useState(false);
  const [tooBig, setTooBig] = useState(false);

  const [descriptiveText, setDescriptiveText] = useState('');

  const bufferSliderDisabled = clickedPoints.length == 0 || (clickedPoints.length >= 3 && polygonMode == 'POLYGON');

  useEffect(() => {
    clickHandler.current = (e: MapMouseEvent) => {
      if (!clickedPoints.includes(e.lngLat)) {
        setClickedPoints([...clickedPoints, e.lngLat]);
      }
    };
  }, [clickedPoints]);

  useEffect(() => {
    let polygon: Feature<Polygon | MultiPolygon> | undefined | null = undefined;
    let updatedDescriptiveText = '';

    switch (clickedPoints.length) {
      case 0:
        polygon = null;
        updatedDescriptiveText = '';
        break;
      case 1:
        polygon = buffer(point([clickedPoints[0].lng, clickedPoints[0].lat]), bufferedRadius, { units: 'meters' });
        updatedDescriptiveText = `Buffered point data, radius ${bufferedRadius.toLocaleString()} meters.`;
        break;
      case 2: {
        const l = lineString([...clickedPoints.map((p) => [p.lng, p.lat])]);
        polygon = buffer(l, bufferedRadius, {
          units: 'meters'
        });
        if (polygon) {
          updatedDescriptiveText = `Buffered line segment, width ${bufferedRadius.toLocaleString()} meters. Length ${Math.round(turfLength(l, { units: 'meters' })).toLocaleString()} meters`;
        }

        break;
      }
      default: {
        if (polygonMode == 'POLYGON') {
          // close it, if we're in polygon mode
          polygon = lineToPolygon(lineString([...clickedPoints.map((p) => [p.lng, p.lat])]));
          if (polygon) {
            updatedDescriptiveText = `Closed polygon, ${clickedPoints.length.toLocaleString()} vertices`;
          }
        } else if (polygonMode == 'LINESTRING') {
          // buffer it, if we're in line mode
          const l = lineString([...clickedPoints.map((p) => [p.lng, p.lat])]);
          polygon = buffer(l, bufferedRadius, {
            units: 'meters'
          });
          if (polygon) {
            updatedDescriptiveText = `Buffered line, width ${bufferedRadius.toLocaleString()} meters. Length ${Math.round(turfLength(l, { units: 'meters' })).toLocaleString()} meters`;
          }
        } else {
          console.error(`Unexpected mode ${polygonMode}`);
        }

        break;
      }
    }

    setGeometry(polygon);

    const computedArea = (polygon && Math.round(area(polygon))) || undefined;
    setShapeArea(computedArea);
    setTooBig((computedArea && computedArea > MAX_AREA_MSQ) || false);

    if (polygon) {
      if (polygon.geometry.type === 'Polygon') {
        const isKinked = kinks(polygon as Feature<Polygon>).features.length > 0; // polygon is self-intersecting
        setKinked(isKinked);
      }
    } else {
      setKinked(false);
    }

    setDescriptiveText(updatedDescriptiveText);
  }, [clickedPoints, bufferedRadius, polygonMode]);

  useEffect(() => {
    if (mapContainer.current !== null) {
      map.current = new InvasivesMap({
        container: mapContainer.current,
        maxZoom: 24,
        zoom: 4,
        minZoom: 0,
        center: [-125.2, 55],
        style: {
          glyphs: MOBILE
            ? '/assets/basemaps/fonts/{fontstack}/{range}.pbf'
            : 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
          version: 8,
          sources: {
            'Esri-Sat-Label-Source': {
              type: 'raster',
              tiles: [
                'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
              ],
              tileSize: 256,
              attribution: 'Powered by ESRI',
              maxzoom: 18
            },
            'Esri-Sat-Layer-SD': {
              type: 'raster',
              tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
              attribution: 'Powered by ESRI',
              tileSize: 256,
              maxzoom: 18
            }
          },
          layers: [
            {
              id: `background`,
              type: 'background',
              paint: {
                'background-color': '#ddd'
              }
            },
            {
              id: `Esri-Sat-LayerSD`,
              type: 'raster',
              source: 'Esri-Sat-Layer-SD',
              minzoom: 0
            },
            {
              id: `Esri-Sat-LabelSD`,
              type: 'raster',
              source: 'Esri-Sat-Label-Source',
              minzoom: 0
            }
          ]
        }
      });

      map.current.on('click', (e: MapMouseEvent) => {
        if (clickHandler.current) {
          clickHandler.current(e);
        }
      });
      map.current.on('dblclick', (e: MapMouseEvent) => {
        e.preventDefault();
        setClickedPoints([]);
      });
      map.current.on('idle', () => {
        setMapReady(true);
      });
    }
  }, [MOBILE, mapContainer.current]);

  useEffect(() => {
    if (geometry == null) {
      return;
    }
    if (map.current == null) {
      return;
    }
    if (!mapReady) {
      return;
    }
    map.current.addSource('drawn', {
      type: 'geojson',
      data: geometry
    });
    map.current.addLayer({
      id: 'drawn',
      type: 'fill',
      source: 'drawn',
      paint: {
        'fill-color': tooBig || kinked ? 'red' : 'white',
        'fill-outline-color': 'orange',
        'fill-opacity': 0.75
      },
      minzoom: 0,
      maxzoom: 24
    });

    return () => {
      if (!map.current) {
        return;
      }
      map.current.removeLayer('drawn');
      map.current.removeSource('drawn');
    };
  }, [geometry, tooBig, kinked, map.current, mapReady]);

  useEffect(() => {
    if (geometry != null) {
      if (kinked) {
        setWellKnown('');
      } else {
        setWellKnown(stringify(geometry));
      }
    } else setWellKnown('');
  }, [geometry]);

  return (
    <div className={'geometry-tool'}>
      <h2 className={'header'}>WKT Geometry Tool</h2>
      <div className={'help'}>
        <h4>About</h4>
        <p>
          The batch templates accept activity geometries in WKT format. These tools are provided to help you draw and
          verify WKT values.
        </p>
        <p>
          Click once to draw a point, twice for a line segment, and three or more times for a line or polygon. Control
          the radius of drawn points and lines with the slider (zero-area activities are not valid).
        </p>
        <p>Double-click to clear all points.</p>
        <p>The resulting WKT will be available below the map and can be copied into your batch submissions.</p>
      </div>

      <div className={'map-container'}>
        <div className={'map'} ref={mapContainer}></div>
      </div>

      <div className={'controls'}>
        <label>Buffer Radius {bufferSliderDisabled ? 'N/A' : `${bufferedRadius} meters`}</label>
        <Slider
          id={'buffer-radius'}
          value={bufferedRadius}
          disabled={bufferSliderDisabled}
          className={'radius-slider'}
          min={1}
          max={10}
          marks
          onChange={(_, value) => {
            setBufferedRadius(value);
          }}
        ></Slider>

        <Button
          disabled={clickedPoints.length == 0}
          variant={'contained'}
          onClick={() => {
            setClickedPoints([]);
          }}
        >
          Clear
        </Button>
        <Button
          disabled={clickedPoints.length < 3 || polygonMode == 'LINESTRING'}
          variant={'contained'}
          onClick={() => {
            setPolygonMode('LINESTRING');
          }}
        >
          Switch to Buffered Line Mode
        </Button>
        <Button
          disabled={clickedPoints.length < 3 || polygonMode == 'POLYGON'}
          variant={'contained'}
          onClick={() => {
            setPolygonMode('POLYGON');
          }}
        >
          Switch to Polygon Mode
        </Button>
      </div>
      <div className={'result'}>
        <h4>Results</h4>
        <p>{descriptiveText}</p>
        {shapeArea && <p>Area {shapeArea.toLocaleString()} m²</p>}
        {tooBig && <p>Shape exceeds {(50000).toLocaleString()} m²</p>}
        {kinked && <p>The polygon you've drawn is self-intersecting</p>}
      </div>
      <div className={'wkt'}>
        <input type={'multiline'} value={wellKnown} readOnly />
        <Button
          disabled={wellKnown.length == 0}
          variant={'contained'}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(wellKnown);
            } catch {
              console.warn('Unable to copy to clipboard');
            }
          }}
        >
          <CopyAll />
          Copy WKT To Clipboard
        </Button>
      </div>
    </div>
  );
};

export default BatchGeometryTool;
