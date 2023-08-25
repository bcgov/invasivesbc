import "leaflet/dist/leaflet.css";
import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "./Map.css";
import OfflineLayers from "./OfflineLayers";
import { selectMap } from "state/reducers/map";
import { useSelector } from "util/use_selector";
import { RecordSetLayersRenderer } from "./RecordSetLayersRenderer";

const Map = (props: any) => {
  const mapState = useSelector(selectMap)
  return (
    <div className="map">
      <MapContainer id="themap"  center={[50.5, 30.5]} zoom={13} className="map__leaflet">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
              {mapState.IAPPGeoJSON?.features.length ? <RecordSetLayersRenderer /> : <></>}
        {props.children}
        <OfflineLayers {...props} />
      </MapContainer>
    </div>
  );
};

export default Map;
