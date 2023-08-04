import booleanContains from '@turf/boolean-contains';
import booleanOverlap from '@turf/boolean-overlap';

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
