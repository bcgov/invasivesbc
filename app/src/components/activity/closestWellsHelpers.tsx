import { polygon } from '@turf/helpers';
import pointToLineDistance from '@turf/point-to-line-distance';
import polygonToLine from '@turf/polygon-to-line';
import inside from '@turf/inside';
import buffer from '@turf/buffer';
import { getDataFromDataBC } from 'components/map/WFSConsumer';
import { fetchLayerDataFromLocal } from 'components/map/LayerLoaderHelpers/AdditionalHelperFunctions';

//gets layer data based on the layer name
export const getClosestWells = async (inputGeometry, online) => {
  const firstFeature = inputGeometry[0];
  //get the map extent as geoJson polygon feature
  const bufferedGeo = buffer(firstFeature, 1, { units: 'kilometers' });
  //if well layer is selected
  //if online, just get data from WFSonline consumer
  if (online) {
    let returnVal = await getDataFromDataBC(
      'WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW',
      bufferedGeo,
      invasivesApi.getSimplifiedGeoJSON,
      true
    );

    if (!returnVal?.features) {
      return { well_objects: [], areWellsInside: undefined };
    } else {
      return getWellsArray(returnVal.features, firstFeature);
    }
  }
  //if offline: try to get layer data from sqlite local storage
  else {
    const allFeatures = await fetchLayerDataFromLocal(
      'WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW',
      bufferedGeo,
      databaseContext
    );

    //if there is a geometry drawn, get closest wells and wells inside and label them
    return getWellsArray(allFeatures, firstFeature);
  }
};
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
      outputWells.push({ ...well, inside: true });
    } else {
      outputWells.push({ ...well, proximity: pointToLineDistance(well, polygonToLine(turfPolygon)) * 1000 });
    }
  });
  //sort by proximity ASC
  outputWells.sort((wellA, wellB) => {
    return wellA.proximity - wellB.proximity;
  });

  outputWells[0] = { ...outputWells[0], closest: true };

  let fiveClosest = [];

  if (outputWells.length > 5) {
    fiveClosest = outputWells.slice(0, 5);
  } else {
    fiveClosest = outputWells;
  }

  return { well_objects: fiveClosest, areWellsInside: areWellsInside };
};
