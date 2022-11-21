import booleanOverlap from '@turf/boolean-overlap';
import booleanContains from '@turf/boolean-contains';
import { query, QueryType } from 'contexts/DatabaseContext';
import { gridColumnsTotalWidthSelector } from '@mui/x-data-grid';

export const getStyleForLayerFeature = (feature: any, layerStyles: any, opacity: number): any => {
  let style = {};
  if (!layerStyles) {
    return style;
  }
  layerStyles.output.rules.forEach((rule) => {
    if (rule.filter) {
      if (isFilterSatisfied(rule?.filter, feature.properties)) {
        const colorRgb = rule.symbolizers[0].color.colorRgb();
        style = {
          fillColor: 'rgba(' + colorRgb[0] + ',' + colorRgb[1] + ',' + colorRgb[2] + ',' + opacity + ')',
          color: 'rgba(' + colorRgb[0] + ',' + colorRgb[1] + ',' + colorRgb[2] + ',' + opacity + ')',
          strokeColor: 'rgba(' + colorRgb[0] + ',' + colorRgb[1] + ',' + colorRgb[2] + ',' + opacity + ')',
          zIndex: rule.symbolizers[0].zIndex && rule.symbolizers[0].zIndex
        };
      }
    }
  });
  return style;
};

export const isFilterSatisfied = (filter, featureProps): boolean => {
  let filterProp = filter[1].toString();

  if (!filter[0] || !filter[1] || !filter[2] || !featureProps[filterProp]) {
    return false;
  }

  switch (filter[0]) {
    case '>':
      return parseInt(filter[2]) > parseInt(featureProps[filterProp]);

    case '<':
      return parseInt(filter[2]) < parseInt(featureProps[filterProp]);

    case '==':
      return filter[2].toString() === featureProps[filterProp].toString();
    case 'in':
      const result = filter[2].includes(featureProps[filterProp]);
      return result;
    case 'not_in':
      const result2 = filter[2].includes(featureProps[filterProp]);
      return result2;
  }
};

export const fetchLayerDataFromLocal = async (layerName: string, mapExtent: any, databaseContext: any) => {
  //first, selecting large grid items
  const largeGridRes = await databaseContext.asyncQueue({
    asyncTask: () => {
      return query(
        {
          type: QueryType.RAW_SQL,
          sql: `SELECT * FROM LARGE_GRID_LAYER_DATA;`
        },
        databaseContext
      );
    }
  });

  //create a string containing all large grid item ids that we got
  let largeGridItemIdString = '(';
  let largeGridResIndex = 0;
  largeGridRes.forEach((gridItem) => {
    if (largeGridResIndex === largeGridRes.length - 1) {
      largeGridItemIdString += gridItem.id + ')';
    } else {
      largeGridItemIdString += gridItem.id + ',';
    }
    largeGridResIndex++;
  });

  //select small grid items with particular layer name and large grid items id
  const smallGridRes = await databaseContext.asyncQueue({
    asyncTask: () => {
      return query(
        {
          type: QueryType.RAW_SQL,
          sql: `SELECT * FROM SMALL_GRID_LAYER_DATA WHERE layerName IN ('${layerName}') AND largeGridID IN ${largeGridItemIdString};`
        },
        databaseContext
      );
    }
  });
  //foreach small grid item that we got, if grid item intersects with map extent,
  //add it to the array of grid items
  let allFeatures = [];
  smallGridRes.forEach((row) => {
    const featuresInArea = JSON.parse(row.featuresInArea);

    featuresInArea.forEach((feature) => {
      if (booleanContains(mapExtent, feature) || booleanOverlap(mapExtent, feature)) {
        allFeatures = allFeatures.concat(feature);
      }
    });
  });
  return allFeatures;
};
