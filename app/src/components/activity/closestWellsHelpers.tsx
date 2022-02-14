import { polygon, Position } from '@turf/helpers';
import pointToLineDistance from '@turf/point-to-line-distance';
import polygonToLine from '@turf/polygon-to-line';
import inside from '@turf/inside';
import buffer from '@turf/buffer';
import { getDataFromDataBC } from 'components/map/WFSConsumer';
import { fetchLayerDataFromLocal } from 'components/map/LayerLoaderHelpers/AdditionalHelperFunctions';

//gets layer data based on the layer name
export const getClosestWells = async (inputGeomtry, databaseContext, invasivesApi, dataBCAcceptsGeometry, online) => {
  //get the map extent as geoJson polygon feature
  const mapExtent = buffer(inputGeomtry, 1, { units: 'kilometers' });
  //if well layer is selected
  //if online, just get data from WFSonline consumer
  if (online) {
    let returnVal = await getDataFromDataBC(
      'WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW',
      mapExtent,
      invasivesApi.getSimplifiedGeoJSON,
      dataBCAcceptsGeometry
    );
    const wellsArr = getWellsArray(returnVal.features, inputGeomtry);
    return wellsArr;
  }
  //if offline: try to get layer data from sqlite local storage
  else {
    const allFeatures = await fetchLayerDataFromLocal(
      'WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW',
      mapExtent,
      databaseContext
    );

    //if there is a geometry drawn, get closest wells and wells inside and label them
    return getWellsArray(allFeatures, inputGeomtry.geometry);
  }
};

// Function for going through array of wells and labeling 1 closest well and wells inside the polygon
const getWellsArray = (arrayOfWells, inputGeometry) => {
  if (!inputGeometry.geometry?.coordinates) {
    return;
  }
  console.log(inputGeometry);
  const outputWells = [];
  let areWellsInside: boolean = false;

  if (inputGeometry.geometry.type == 'Point') {
    console.log('Grisha to make this work for points and circles');
    return;
  }
  const turfPolygon = polygon(inputGeometry.geometry.coordinates);

  if (!arrayOfWells.length) {
    return;
  }
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
