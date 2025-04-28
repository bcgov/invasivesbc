import { Feature, Point, Polygon, polygon } from '@turf/helpers';
import pointToLineDistance from '@turf/point-to-line-distance';
import polygonToLine from '@turf/polygon-to-line';
import inside from '@turf/inside';
import buffer from '@turf/buffer';
import { getDataFromDataBCv2 } from './WFSConsumer';
import { selectNetworkState } from 'state/reducers/network';
import { select } from 'redux-saga/effects';
import { WellCacheServiceFactory } from './well-cache/context';
import GeoShapes from 'constants/geoShapes';
import WellData from 'interfaces/WellData';
import { LineString } from 'geojson';
import { MOBILE } from 'state/build-time-config';

//gets layer data based on the layer name
export function* getClosestWells(inputGeometry: Point | Polygon | LineString) {
  const firstFeature = inputGeometry;
  const networkState = yield select(selectNetworkState);
  //get the map extent as geoJson polygon feature
  const bufferedGeo = buffer(firstFeature, 1, { units: 'kilometers' });

  if (networkState.connected) {
    // if online, just get data from WFSonline consumer
    try {
      const returnVal = yield getDataFromDataBCv2('WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW', bufferedGeo, true);
      if (returnVal?.features) {
        return getWellsArray(returnVal.features, firstFeature);
      }
    } catch (ex) {
      console.error('[getClosestWells]:', ex);
    }
  }
  if (MOBILE) {
    const service = yield WellCacheServiceFactory.getPlatformInstance();
    const wellsInArea = yield service.getNearbyWells(bufferedGeo) ?? [];
    if (wellsInArea.length > 0) {
      return getWellsArray(wellsInArea, firstFeature);
    }
  }
  return { well_objects: [], areWellsInside: undefined };

  //if there is a geometry drawn, get closest wells and wells inside and label them
}

// Function for going through array of wells and labeling 1 closest well and wells inside the polygon
export const getWellsArray = (arrayOfWells, inputGeometry) => {
  let geoJSONFeature = inputGeometry;
  if (!geoJSONFeature.geometry?.coordinates) {
    return;
  }

  if (geoJSONFeature.geometry.type === GeoShapes.Point) {
    let radius = 100;
    if (geoJSONFeature.properties?.radius) {
      radius = geoJSONFeature.properties.radius;
    }
    geoJSONFeature = buffer(geoJSONFeature, radius, { units: 'meters' });
  }

  const outputWells: WellData[] = [];
  let areWellsInside: boolean = false;

  const turfPolygon = polygon(geoJSONFeature.geometry.coordinates);

  arrayOfWells.forEach((well) => {
    if (inside(well, turfPolygon)) {
      areWellsInside = true;
      outputWells.push({ ...well, proximity: 0, inside: true });
    } else {
      outputWells.push({
        ...well,
        proximity: pointToLineDistance(well, polygonToLine(turfPolygon) as Feature<LineString>) * 1000
      });
    }
  });

  //sort by proximity ASC
  outputWells.sort((wellA, wellB) => wellA.proximity - wellB.proximity);

  outputWells[0] = { ...outputWells[0], closest: true };

  const fiveClosest: WellData[] = [];
  const insideGeoWells: WellData[] = [];

  outputWells.forEach((well) => {
    if (well.inside) {
      insideGeoWells.push(well);
    }
    if (!well.inside && fiveClosest.length < 5) {
      fiveClosest.push(well);
    }
  });

  return { well_objects: [...fiveClosest, ...insideGeoWells], areWellsInside: areWellsInside };
};
