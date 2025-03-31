import { useContext, useEffect, useState } from 'react';
import { MapContext } from '../MapContext';
import './Coordinates.css';
import proj4 from 'proj4';

interface CoordsData {
  lng: number;
  lat: number;
  utm: [number, number];
  utmZone: number;
}

const Coordinates = () => {
  const updateCoordinates = (x: number, y: number) => {
    if (!map) return;
    const proj4_setdef = (utmZone: number): string => {
      const zdef = `+proj=utm +zone=${utmZone} +datum=WGS84 +units=m +no_defs`;
      return zdef;
    };
    const { lng, lat } = map.unproject([x, y]);
    const utmZone = Math.floor((lng + 180) / 6) + 1;
    proj4.defs([
      ['EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs'],
      ['EPSG:AUTO', proj4_setdef(utmZone)]
    ]);
    const utm: [number, number] = proj4('EPSG:4326', 'EPSG:AUTO', [lng, lat]);
    setCoords({ lng, lat, utm, utmZone });
  };

  const map = useContext(MapContext);
  const [coords, setCoords] = useState<CoordsData>();

  useEffect(() => {
    if (!map) return;
    const cont = map.getContainer();
    cont.addEventListener('mousemove', (e) => {
      updateCoordinates(e.clientX, e.clientY);
    });
    cont.addEventListener('touchstart', (e) => {
      updateCoordinates(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
    });
  }, [map]);

  if (!coords) {
    return;
  }
  return (
    <div id="coordinates-display">
      <div>
        {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
      </div>
      <div>
        Zone: {coords.utmZone}, E: {coords.utm[0].toFixed(0)}, N: {coords.utm[1].toFixed(0)}
      </div>
    </div>
  );
};
export default Coordinates;
