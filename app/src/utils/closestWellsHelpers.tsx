import { polygon } from '@turf/helpers';
import pointToLineDistance from '@turf/point-to-line-distance';
import polygonToLine from '@turf/polygon-to-line';
import inside from '@turf/inside';
import buffer from '@turf/buffer';
import { getDataFromDataBCv2 } from './WFSConsumer';

//gets layer data based on the layer name
export function* getClosestWells(inputGeometry, online) {
  const firstFeature = inputGeometry;
  //get the map extent as geoJson polygon feature
  const bufferedGeo = buffer(firstFeature, 1, { units: 'kilometers' });
  //if well layer is selected
  //if online, just get data from WFSonline consumer
  if (online) {
    const returnVal = yield getDataFromDataBCv2('WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW', bufferedGeo, true);

    if (!returnVal?.features) {
      return { well_objects: [], areWellsInside: undefined };
    } else {
      return getWellsArray(returnVal.features, firstFeature);
    }
  } else {
    /* TODO */
    return { well_objects: [], areWellsInside: undefined };
  }
  //if offline: try to get layer data from sqlite local storage
  /*  else {
    const allFeatures = await fetchLayerDataFromLocal(
      'WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW',
      bufferedGeo,
      databaseContext
    );*/

  //if there is a geometry drawn, get closest wells and wells inside and label them
  // return getWellsArray(allFeatures, firstFeature);
}
// Function for going through array of wells and labeling 1 closest well and wells inside the polygon
export const getWellsArray = (arrayOfWells, inputGeometry) => {
  let geoJSONFeature = inputGeometry;
  if (!geoJSONFeature.geometry?.coordinates) {
    return;
  }

  if (geoJSONFeature.geometry.type === 'Point') {
    let radius = 100;
    if (geoJSONFeature.properties?.radius) {
      radius = geoJSONFeature.properties.radius;
    }
    geoJSONFeature = buffer(geoJSONFeature, radius, { units: 'meters' });
  }

  const outputWells = [];
  let areWellsInside: boolean = false;

  const turfPolygon = polygon(geoJSONFeature.geometry.coordinates);

  arrayOfWells.forEach((well, index) => {
    if (inside(well, turfPolygon)) {
      areWellsInside = true;
      outputWells.push({ ...well, proximity: 0, inside: true });
    } else {
      outputWells.push({ ...well, proximity: pointToLineDistance(well, polygonToLine(turfPolygon)) * 1000 });
    }
  });

  //sort by proximity ASC
  outputWells.sort((wellA, wellB) => {
    return wellA.proximity - wellB.proximity;
  });

  outputWells[0] = { ...outputWells[0], closest: true };

  const fiveClosest = [];
  const insideGeoWells = [];

  outputWells.forEach((well: any) => {
    if (well.inside) {
      insideGeoWells.push(well);
    }
    if (!well.inside && fiveClosest.length < 5) {
      fiveClosest.push(well);
    }
  });

  return { well_objects: [...fiveClosest, ...insideGeoWells], areWellsInside: areWellsInside };
};
