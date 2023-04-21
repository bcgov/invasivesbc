import _ from 'lodash';
import { getLogger } from '../logger';
import { TemplateColumn } from './definitions';
import {parsedGeoType} from "./validation/spatial-validation";

const defaultLog = getLogger('batch');

interface IntermediateRowRepresentation {
  data: {
    inputValue: string;
    parsedValue: any;
    templateColumn: TemplateColumn;
  };
}

export const mapTemplateFields = (
  inputToMapTo: Record<string, any>,
  rowData: Record<string, IntermediateRowRepresentation>
) => {
  const output = { ...inputToMapTo };
  const fields = _.keys(rowData.data);

  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    const cell = rowData.data[field];
    if (!cell?.templateColumn) {
      defaultLog.error({ message: 'data consistency problem -- skipping column', field, cell });
      continue;
    }

    switch (cell?.templateColumn.dataType) {
      case 'WKT':
        try {
          _.set(output, cell?.templateColumn.mappedPath['geojson'], [{ 'geometry' : (cell.parsedValue as parsedGeoType).geojson, 'type' : 'Feature' }]);
          _.set(output, cell?.templateColumn.mappedPath['area'], (cell.parsedValue as parsedGeoType).area);
          _.set(output, cell?.templateColumn.mappedPath['latitude'], (cell.parsedValue as parsedGeoType).latitude);
          _.set(output, cell?.templateColumn.mappedPath['longitude'], (cell.parsedValue as parsedGeoType).longitude);
          _.set(output, cell?.templateColumn.mappedPath['utm_zone'], (cell.parsedValue as parsedGeoType).utm_zone);
          _.set(output, cell?.templateColumn.mappedPath['utm_northing'], (cell.parsedValue as parsedGeoType).utm_northing);
          _.set(output, cell?.templateColumn.mappedPath['utm_easting'], (cell.parsedValue as parsedGeoType).utm_easting);
          _.set(output, cell?.templateColumn.mappedPath['geog'], (cell.parsedValue as parsedGeoType).geog);

        } catch (e) {
          defaultLog.error({ message: 'error mapping field into blob', field, cell });
        }
        break;
      default:
        try {
          if(!_.get(output, cell?.templateColumn.mappedPath) && cell.parsedValue)
          {
            _.set(output, cell?.templateColumn.mappedPath, cell.parsedValue);
          }
        } catch (e) {
          defaultLog.error({ message: 'error mapping field into blob', field, cell });
        }
    }
  }

  return output;
};
