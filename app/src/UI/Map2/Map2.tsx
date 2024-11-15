import { MapLibreMap, MlVectorTileLayer, useAddProtocol } from '@mapcomponents/react-maplibre';
import './map.css';
import { PMTiles, Protocol } from 'pmtiles';
import { useSelector } from 'react-redux';
import { RecordSetLayers } from './RecordSetLayers';

let protocol = new Protocol();
export const Map = ({ children }) => {
    // for logged in or out layers:
  const authenticated = useSelector((state: any) => state.Auth.authenticated);

  useAddProtocol({
    protocol: 'pmtiles',
    handler: protocol.tile
  });

  return (
    <div className="map-containing-block">
      <div className="MapWrapper">
        <MapLibreMap
          mapId="map"
          options={{
            center: [-123.912, 55.25],
            zoom: 6,
            style: 'https://wms.wheregroup.com/tileserver/style/osm-bright.json',
            attributionControl: false,
            minZoom: 1
          }}
        />


        <RecordSetLayers/>


        <MlVectorTileLayer
          layerId="pmtiles"
          layers={[
            {
              id: 'invasivesbc-pmtile-vector',
              type: 'circle',
              source: 'pmtiles',
              'source-layer': 'invasives',
              layout: {
                visibility: (!authenticated)? 'visible': 'none'
              },
              paint: { 'circle-color': '#0905f5', 'circle-opacity': 1.0 },
              maxzoom: 24
            }
          ]}
          url="pmtiles://https://nrs.objectstore.gov.bc.ca/rzivsz/invasives-prod.pmtiles/{z}/{x}/{y}"
        />
        <div id="LoadingMap" className={!true ? 'loadingMap' : 'loadedMap'}>
          Loading tiles...
        </div>
        {children}
      </div>
    </div>
  );
};
