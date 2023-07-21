import "leaflet/dist/leaflet.css";
import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "./Map.css";
import OfflineLayers from "./OfflineLayers";

const Map = (props: any) => {
  return (
    <div className="map">
      <MapContainer center={[50.5, 30.5]} zoom={13} className="map__leaflet">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        {props.children}
        <OfflineLayers {...props} />
      </MapContainer>
    </div>
  );
};

export default Map;
