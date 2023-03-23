import { Template, TemplateColumn } from './definitions';
import { validateAsWKT } from './spatial-validation';

type ValidationMessageSeverity = 'informational' | 'warning' | 'error';

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

export class BatchValidationResult {
  canProceed: boolean;
  globalValidationMessages: BatchGlobalValidationMessage[] = [];
  validatedBatchData;
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
      result.parsedValue = templateColumn.codes.find((c) => c.code === data);
      if (result.parsedValue === null) {
        result.validationMessages.push({
          severity: 'error',
          messageTitle: 'Code value not found',
          messageDetail: `${data} is not in the list of valid values for this code reference`
        });
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

      console.dir(result.parsedValue.length);
      console.dir(templateColumn);
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

    const batchDataCopy = { ...batch };

    for (const row of batchDataCopy.rows) {
      for (const field of batchDataCopy.headers) {
        const templateColumn = template.columns.find((t) => t.name === field);
        row.data[field] = {
          inputValue: row.data[field],
          templateColumn,
          ..._validateCell(templateColumn, row.data[field])
        };
      }
    }

    result.validatedBatchData = batchDataCopy;
    result.globalValidationMessages = [];
    result.canProceed = true;
    return result;
  }
};
