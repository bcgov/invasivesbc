import { Template, TemplateColumn } from './definitions';
import { validateAsWKT } from './spatial-validation';
import _ from 'lodash';
import slugify from 'slugify';

export type ValidationMessageSeverity = 'informational' | 'warning' | 'error';

export interface BatchGlobalValidationMessage {
  severity: ValidationMessageSeverity;
  messageTitle: string;
  messageDetail: string | null;
}

export interface BatchCellValidationMessage {
  severity: ValidationMessageSeverity;
  messageTitle: string;
  messageDetail: string | null;
}

export interface CellValidationResult {
  validationMessages: BatchCellValidationMessage[];
  parsedValue: unknown;
}

export interface RowValidationResult {
  validationMessages: BatchCellValidationMessage[];
  appliesToFields: string[];
  valid: boolean;
}

export class BatchValidationResult {
  canProceed: boolean;
  globalValidationMessages: BatchGlobalValidationMessage[] = [];
  validatedBatchData;
}

interface RowMappingResult {
  mappedObject: object;
  messages: string[];
}

function _divmod(x: number, y: number) {
  return [Math.floor(x / y), x % y];
}

function _excelColumnName(n: number) {
  let d = n;
  const c = [];
  while (d > 0) {
    let r;
    [d, r] = _divmod(d, 26);
    c.unshift('ABCDEFGHIJKLMNOPQRSTUVWXYZ'[r - 1]);
  }
  return c.join('');
}

function _cellAddress(row: number, column: number): string {
  return `${_excelColumnName(column)}${row + 1}`;
}

function _mapRowToDBObject(row, template: Template): RowMappingResult {
  const result = {};
  const messages = [];

  template.columns.forEach((col) => {
    let mappedPath = col.mappedPath;

    if (mappedPath === null) {
      mappedPath = `unmapped_fields.${slugify(col.name)}_${row.data[col.name].spreadsheetCellAddress}`;
      messages.push(`Column [${col.name}] has no object mapping defined, using: ${mappedPath}`);
    }

    let setValue = row.data[col.name].parsedValue;
    if (col.dataType === 'codeReference') {
      setValue = setValue?.code;
    }

    // @todo handle codereferencemulti

    if (!(setValue == null || (col.dataType === 'numeric' && isNaN(setValue)))) {
      _.set(result, mappedPath, setValue);
    }
  });

  return {
    mappedObject: result,
    messages
  };
}

function _validateCell(templateColumn: TemplateColumn, data: string): CellValidationResult {
  const result = {
    validationMessages: [],
    parsedValue: null
  };

  if (templateColumn === null) {
    result.validationMessages.push({
      severity: 'warning',
      messageTitle: 'Not found in template'
    });
    return result;
  }

  if (templateColumn.required) {
    if (data === null || data.trim().length === 0) {
      result.validationMessages.push({
        severity: 'error',
        messageTitle: 'This value is required'
      });
      return result;
    }
  }

  switch (templateColumn.dataType) {
    case 'boolean':
      switch (data.toLowerCase()) {
        case 'n':
        case 'no':
        case 'f':
        case 'false':
          result.parsedValue = false;
          break;
        case 'y':
        case 'yes':
        case 't':
        case 'true':
          result.parsedValue = true;
          break;
        default:
          result.validationMessages.push({
            severity: 'error',
            messageTitle: 'Could not be interpreted as a boolean value'
          });
      }
      break;
    case 'codeReference':
      if (data.trim().length > 0) {
        result.parsedValue = templateColumn.codes.find((c) => c.code === data);
        if (result.parsedValue === undefined) {
          result.validationMessages.push({
            severity: 'error',
            messageTitle: 'Code value not found',
            messageDetail: `${data} is not in the list of valid values for this code reference`
          });
        }
      }
      break;
    case 'codeReferenceMulti':
      //@todo
      result.parsedValue = data;
      break;
    case 'numeric':
      try {
        result.parsedValue = Number.parseFloat(data);
      } catch (e) {
        result.validationMessages.push({
          severity: 'error',
          messageTitle: 'Could not be interpreted as a number.',
          messageDetail: e.toString()
        });
      }
      if (templateColumn.validations.minValue !== null && result.parsedValue < templateColumn.validations.minValue) {
        result.validationMessages.push({
          severity: 'error',
          messageTitle: `Below minimum value`,
          messageDetail: `Value ${result.parsedValue} below minimum required: ${templateColumn.validations.minValue}`
        });
      }
      if (templateColumn.validations.maxValue !== null && result.parsedValue > templateColumn.validations.maxValue) {
        result.validationMessages.push({
          severity: 'error',
          messageTitle: `Above maximum value`,
          messageDetail: `Value ${result.parsedValue} above maximum required: ${templateColumn.validations.maxValue}`
        });
      }
      break;
    case 'date':
      result.parsedValue = data;
      //@todo
      break;
    case 'datetime':
      result.parsedValue = data;
      //@todo
      break;
    case 'text':
      result.parsedValue = data?.trim() || '';

      if (
        templateColumn.validations.minLength !== null &&
        result.parsedValue.length < templateColumn.validations.minLength
      ) {
        result.validationMessages.push({
          severity: 'error',
          messageTitle: `Length below minimum`,
          messageDetail: `Length ${result.parsedValue.length} below minimum: ${templateColumn.validations.minLength}`
        });
      }
      if (
        templateColumn.validations.maxLength !== null &&
        result.parsedValue.length > templateColumn.validations.maxLength
      ) {
        result.validationMessages.push({
          severity: 'error',
          messageTitle: `Length above maximum`,
          messageDetail: `Length ${result.parsedValue.length} above maximum: ${templateColumn.validations.maxLength}`
        });
      }
      //@todo validate length
      break;
    case 'WKT':
      if (validateAsWKT(data)) {
        result.parsedValue = data;
      } else {
        result.validationMessages.push({
          severity: 'error',
          messageTitle: 'Could not be interpreted as a WKT geometry.'
          //          messageDetail: data
        });
      }
      //@todo validate geometry
      break;
    case 'tristate':
      switch (data.toLowerCase()) {
        case 'n':
        case 'no':
        case 'f':
        case 'false':
          result.parsedValue = 'False';
          break;
        case 'y':
        case 'yes':
        case 't':
        case 'true':
          result.parsedValue = 'True';
          break;
        case 'u':
        case 'unknown':
          result.parsedValue = 'Unknown';
          break;
        default:
          result.validationMessages.push({
            severity: 'error',
            messageTitle: 'Could not be interpreted as a tristate (Yes/No/Unknown) value'
          });
      }
      break;
  }
  return result;
}

export const BatchValidationService = {
  validateBatchAgainstTemplate: (template: Template, batch): BatchValidationResult => {
    const result = new BatchValidationResult();
    let totalErrorCount = 0;

    const batchDataCopy = { ...batch };

    batchDataCopy.rows.forEach((row, rowIndex) => {
      batchDataCopy.headers.forEach((header, colIndex) => {
        const field = header;
        const templateColumn = template.columns.find((t) => t.name === field);
        row.data[field] = {
          inputValue: row.data[field],
          templateColumn,
          spreadsheetCellAddress: _cellAddress(rowIndex + 1 /* skip header */, colIndex + 1 /* 1-based count */),
          ..._validateCell(templateColumn, row.data[field])
        };

        totalErrorCount += row.data[field].validationMessages.filter((r) => r.severity !== 'informational').length;
      });

      const rowValidationResults = template.rowValidators.map((rv) => rv(row.data));

      for (const f of rowValidationResults) {
        if (!f.valid) {
          totalErrorCount++;
          // map row-level errors back to cell-level for presentation
          f.appliesToFields.forEach((columnWithError) => {
            row.data[columnWithError].validationMessages.push(...f.validationMessages);
          });
        }
      }

      row.rowValidationResult = rowValidationResults;

      // put the row into the json structure used in `activity_incoming_data`
      const { mappedObject, messages } = _mapRowToDBObject(row, template);
      row.mappedObject = mappedObject;
      row.mappedObjectMessages = messages;
    });

    result.validatedBatchData = batchDataCopy;
    result.globalValidationMessages = [];
    result.canProceed = totalErrorCount == 0;
    return result;
  }
};
