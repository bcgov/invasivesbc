import booleanContains from '@turf/boolean-contains';
import { InvasivesBCSLD } from './invasivesbc_sld';
import SLDParser from 'geostyler-sld-parser';
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

export const getPallette = async (color, globalColorschemeOverride) => {
  const res = await getSldStylesFromLocalFile()

    const Biocontrol = res?.output.rules.find((o) =>
      [
        'Activity_Biocontrol_Collection',
        'Activity_Biocontrol_Release',
        'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant',
        'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant'
      ].includes(o.name)
    );
    const FREP = res?.output.rules.find((o) => ['Activity_FREP_FormC'].includes(o.name));
    const Monitoring = res?.output.rules.find((o) =>
      [
        'Activity_Monitoring_ChemicalTerrestrialAquaticPlant',
        'Activity_Monitoring_ChemicalTerrestrialAquaticPlant'
      ].includes(o.name)
    );
    const Observation = res?.output.rules.find((o) =>
      ['Activity_Observation_PlantAquatic', 'Activity_Observation_PlantTerrestrial'].includes(o.name)
    );
    const Treatment = res?.output.rules.find((o) =>
      [
        'Activity_Treatment_ChemicalPlantAquatic',
        'Activity_Treatment_ChemicalPlantTerrestrial',
        'Activity_Treatment_MechanicalPlantAquatic',
        'Activity_Treatment_MechanicalPlantTerrestrial'
      ].includes(o.name)
    );

    let sldPalette: any = {}; //palette;
    if (globalColorschemeOverride) {
      sldPalette.Biocontrol = Biocontrol?.symbolizers[0].color ?? sldPalette.Biocontrol;
      sldPalette.FREP = FREP?.symbolizers[0].color ?? sldPalette.FREP;
      sldPalette.Monitoring = Monitoring?.symbolizers[0].color ?? sldPalette.Monitoring;
      sldPalette.Observation = Observation?.symbolizers[0].color ?? sldPalette.Observation;
      sldPalette.Treatment = Treatment?.symbolizers[0].color ?? sldPalette.Treatment;
    } else {
      sldPalette.Biocontrol = color;
      sldPalette.FREP = color;
      sldPalette.Monitoring = color;
      sldPalette.Observation = color;
      sldPalette.Treatment = color;
    } 
    return sldPalette;
}

const getOptions = (color, zIndex, opacity, globalColorschemeOverride, ids?) => {
  const initialOptions = {
    maxZoom: 24,
    tolerance: 100,
    debug: 0,
    extent: 4096, // tile extent (both width and height)
    buffer: 128, // tile buffer on each side
    indexMaxPoints: 100000, // max number of points per tile in the index
    solidChildren: false,
    layerStyles: {},
    style: {
      //      fillColor: props.color,
      //     color: props.color,
      //    strokeColor: props.color,
      stroke: true,
      strokeOpacity: 1,
      strokeWidth: 10,
      opacity: opacity || 0.5,
      fillOpacity: opacity / 2,
      weight: 3,
      zIndex: zIndex || 1000
    }

  };

      const rule = {
        name: 'iapp_ids_filter',
        filter: ['in', 'site_id', ids],
        scaleDenominator: {
          min: 1,
          max: 10000000000
        },
        symbolizers: [
          {
            kind: 'Fill',
            color: '#ed2f49',
            outlineColor: '#232323',
            outlineOpacity: 0.85,
            outlineWidth: 1
          }
        ]
      };
      const rule2 = {
        name: 'iapp_ids_filter2',
        filter: ['not_in', 'site_id', []],
        scaleDenominator: {
          min: 1,
          max: 10000000000
        },
        symbolizers: [
          {
            kind: 'Fill',
            color: '#eb9e34',
            outlineColor: '#232323',
            outlineOpacity: 0.85,
            outlineWidth: 1
          }
        ]
      };
      let updatedOptions: any = {
        ...initialOptions
      };

      if (!globalColorschemeOverride) {
        updatedOptions.style = {
          ...initialOptions.style,
          fillColor: color,
          color: color,
          strokeColor: color
        };
      } else {
        updatedOptions.layerStyles = { output: { ...res.output, rules: [...res.output.rules, rule, rule2] } };
      }

      return updatedOptions;
}

  const getSldStylesFromLocalFile = async () => {
    const sldParser = new SLDParser();
    let styles = await sldParser.readStyle(InvasivesBCSLD);
    return styles;
  };