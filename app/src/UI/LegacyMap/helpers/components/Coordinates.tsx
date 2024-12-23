import { MapContext } from 'UI/LegacyMap/helpers/components/MapContext';
import { useContext, useEffect, useRef } from 'react';
import proj4 from 'proj4';

const Coordinates = () => {
  const map = useContext(MapContext);
  const coordinatesContainer = useRef<HTMLDivElement>();

  useEffect(() => {
    if (!map) {
      return;
    }

    coordinatesContainer.current = document.createElement('div');
    coordinatesContainer.current.style.position = 'absolute';
    coordinatesContainer.current.style.top = '10px';
    coordinatesContainer.current.style.left = '90px';
    coordinatesContainer.current.style.background = 'rgba(255, 255, 255, 0.8)';
    coordinatesContainer.current.style.padding = '5px';
    coordinatesContainer.current.style.borderRadius = '5px';
    coordinatesContainer.current.style.zIndex = '99';

    const container = map.getContainer();
    container.appendChild(coordinatesContainer.current);

    container.addEventListener('mousemove', (e: MouseEvent) => {
      const { clientX, clientY } = e;
      updateCoordinatesContainer(clientX, clientY);
    });
    container.addEventListener('touchstart', (e: TouchEvent) => {
      const { clientX, clientY } = e.targetTouches[0];
      updateCoordinatesContainer(clientX, clientY);
    });
  }, [map]);

  const updateCoordinatesContainer = (x: number, y: number) => {
    if (!coordinatesContainer.current) return;

    const proj4_setdef = (utmZone: number): string => {
      const zdef = `+proj=utm +zone=${utmZone} +datum=WGS84 +units=m +no_defs`;
      return zdef;
    };
    if (!map || !x || !y) {
      return;
    }

    const { lng, lat } = map.unproject([x, y]);
    const utmZone = Math.floor((lng + 180) / 6) + 1;
    proj4.defs([
      ['EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs'],
      ['EPSG:AUTO', proj4_setdef(utmZone)]
    ]);

    const utm: [number, number] = proj4('EPSG:4326', 'EPSG:AUTO', [lng, lat]);

    coordinatesContainer.current.innerHTML = `
    <div>${lat.toFixed(6)}, ${lng.toFixed(6)}</div>
    <div>Zone ${utmZone}, E: ${utm[0].toFixed(0)}, N: ${utm[1].toFixed(0)}</div>
  `;
  };

  return null;
};

export { Coordinates };
