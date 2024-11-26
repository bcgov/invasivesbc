import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'utils/use_selector';
import Map, { ScaleControl, NavigationControl } from 'react-map-gl/maplibre';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import maplibregl from 'maplibre-gl';
// import { RecordSetLayers } from './RecordSetLayers3';
import { PublicLayer } from './PublicLayer';
import { MOBILE } from 'state/build-time-config';

// to make base layers work on this map, will be refactored in the next iteration
const wmsBaseLayersValue: Record<string, string> = {
  'Esri-Sat-LayerHD': 'esri-sat-layer-hd',
  'Esri-Sat-LayerSD': 'esri-sat-layer-sd',
  'Esri-Topo': 'esri-topo'
};

type MapStyleSourceDefinition = {
  name: string;
  source: maplibregl.SourceSpecification;
};

// Base map sources
const mapStyleSources: MapStyleSourceDefinition[] = [
  {
    name: 'esri-sat-label-source',
    source: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: 'Powered by ESRI',
      maxzoom: 18
    }
  },
  {
    name: 'esri-sat-layer-hd',
    source: {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      attribution: 'Powered by ESRI',
      tileSize: 256,
      maxzoom: 24
    }
  },
  {
    name: 'esri-sat-layer-sd',
    source: {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      attribution: 'Powered by ESRI',
      tileSize: 256,
      maxzoom: 24
    }
  },
  {
    name: 'esri-topo',
    source: {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'],
      attribution: 'Powered by ESRI',
      tileSize: 256,
      maxzoom: 24
    }
  }
];

// Base map layers
const mapStyleLayers: Record<string, maplibregl.LayerSpecification[]> = {
  'esri-sat-layer-hd': [
    {
      id: 'esri-sat-layer-hd',
      type: 'raster',
      source: 'esri-sat-layer-hd',
      minzoom: 0
    },
    {
      id: `esri-sat-label-hd`,
      type: 'raster',
      source: 'esri-sat-label-source',
      minzoom: 0
    }
  ],
  'esri-sat-layer-sd': [
    {
      id: 'esri-sat-layer-sd',
      type: 'raster',
      source: 'esri-sat-layer-sd',
      minzoom: 0
    },
    {
      id: 'esri-sat-label-sd',
      type: 'raster',
      source: 'esri-sat-label-source',
      minzoom: 0
    }
  ],
  'esri-topo': [
    {
      id: 'esri-topo',
      type: 'raster',
      source: 'esri-topo',
      minzoom: 0
    }
  ]
};

export const MainMap = ({ children }) => {
  const API_BASE = useSelector((state) => state.Configuration.current.API_BASE);
  const authenticated = useSelector((state) => state.Auth.authenticated);
  const [currentAuthHeader, setCurrentAuthHeader] = useState<string>('');
  const authHeaderRef = useRef<string>();
  authHeaderRef.current = currentAuthHeader;
  const baseMapLayer = useSelector((state: any) => state.Map.baseMapLayer);
  const map_center = useSelector((state) => state.Map.map_center);

  const mapstyle_current_layer: maplibregl.LayerSpecification[] = mapStyleLayers[wmsBaseLayersValue[baseMapLayer]];

  /* map can have platform-specific options */
  const platformOptions = (() => {
    if (MOBILE) {
      return {
        maxBounds: [-141.7761, 46.41459, -114.049, 60.00678] as maplibregl.LngLatBoundsLike
      };
    }
    return {};
  })();

  useEffect(() => {
    if (!authenticated) {
      return;
    }

    // get it once with no delay
    getCurrentJWT().then((header) => {
      setCurrentAuthHeader(header);
    });

    // and then regularly thereafter
    const id = setInterval(() => {
      getCurrentJWT().then((header) => {
        setCurrentAuthHeader(header);
      });
    }, 10000);

    return () => {
      clearInterval(id);
    };
  }, [authenticated]);

  // for logged in or out layers:
  const getAuthHeaderCallback = () => {
    if (authHeaderRef.current === undefined) {
      console.error('requested access before header received');
      return '';
    }
    return authHeaderRef.current;
  };
  const transformRequest = (url, resourceType) => {
    if (url.includes(API_BASE)) {
      return {
        url,
        headers: {
          Authorization: getAuthHeaderCallback()
        }
      };
    }
    return {
      url
    };
  };
  return (
    <div className="map-containing-block">
      <div className="MapWrapper">
        <Map
          {...platformOptions}
          initialViewState={{
            longitude: map_center[1],
            latitude: map_center[0],
            zoom: 3
          }}
          minZoom={0}
          maxZoom={24}
          attributionControl={false}
          transformRequest={transformRequest}
          mapLib={maplibregl}
          // interactiveLayerIds={['pmtiles-layer']}
          mapStyle={{
            ...(MOBILE && { sprite: '/assets/basemaps/sprite/sprite' }),
            glyphs: MOBILE
              ? '/assets/basemaps/fonts/{fontstack}/{range}.pbf'
              : 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
            version: 8,
            sources: {
              ...mapStyleSources.reduce((result, item) => {
                result[item.name] = item.source;
                return result;
              }, {})
            },
            layers: mapstyle_current_layer
          }}
        >
          {/* <Source
            id='esri-sat-label-source'
            type='raster'
            tiles={[
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ]}
            tileSize={256}
            maxzoom={18}
          />
          <Source
            id='esri-sat-layer-hd'
            type='raster'
            tiles={[
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            ]}
            tileSize={256}
          >
            <Layer
              id='wms-layer'
              type='raster'
              source='esri-sat-layer-hd'
            />
          </Source> */}

          <ScaleControl maxWidth={80} unit="metric" position="top-left" />
          <NavigationControl position="top-left" />

          {!authenticated ? <PublicLayer /> : <></>}

          {/* <RecordSetLayers /> */}
        </Map>
        <div id="LoadingMap" className={!true ? 'loadingMap' : 'loadedMap'}>
          Loading tiles...
        </div>
        {children}
      </div>
    </div>
  );
};
