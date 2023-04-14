import _ from 'lodash';
import { getLogger } from '../logger';
import { TemplateColumn } from './definitions';

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
    if (!cell.templateColumn) {
      defaultLog.error({ message: 'data consistency problem -- skipping column', field, cell });
      continue;
    }

    switch (cell.templateColumn.dataType) {
      case 'WKT':
        try {
          _.set(output, cell.templateColumn.mappedPath['geometry'], cell.parsedValue['data']);
          _.set(output, cell.templateColumn.mappedPath['area'], cell.parsedValue['area']);

        } catch (e) {
          defaultLog.error({ message: 'error mapping field into blob', field, cell });
        }
        break;
      default:
        try {
          _.set(output, cell.templateColumn.mappedPath, cell.parsedValue);
        } catch (e) {
          defaultLog.error({ message: 'error mapping field into blob', field, cell });
        }
    }
  }

  return output;
};
