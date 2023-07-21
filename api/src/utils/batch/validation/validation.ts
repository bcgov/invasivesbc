import { Template, TemplateColumn } from '../definitions';
import {
  autofillFromPostGIS,
  parseGeoJSONasWKT,
  parseWKTasGeoJSON,
  parsedGeoType,
  validateAsWKT,
  multipolygonIsConnected
} from './spatial-validation';
import slugify from 'slugify';
import moment from 'moment';
import { _mapToDBObject } from '../execution';
import { lookupAreaLimit } from 'sharedAPI';
import { getLogger } from '../../logger';
import circle from '@turf/circle';

const defaultLog = getLogger('batch');

export type ValidationMessageSeverity = 'informational' | 'warning' | 'error';

export interface BatchGlobalValidationMessage {
  severity: ValidationMessageSeverity;
  messageTitle: string;
  messageDetail: string | null;
}

export interface BatchCellValidationMessage {
  severity: ValidationMessageSeverity;
  messageTitle: string;
  messageDetail?: string | null;
}

export interface CellValidationResult {
  validationMessages: BatchCellValidationMessage[];
  parsedValue: string | number | parsedGeoType | boolean | null;
  friendlyValue?: string | null;
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

interface ColumnPrescenceCheckResult {
  missingColumns: string[];
  extraColumns: string[];
}

const DATE_ONLY_FORMAT = 'YYYY-MM-DD';
const DATE_TIME_FORMAT = 'YYYY-MM-DDThh:mm';

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

function columnPresenceCheck(template: Template, batch): ColumnPrescenceCheckResult {
  const headers = batch.headers;

  const result: ColumnPrescenceCheckResult = {
    missingColumns: [],
    extraColumns: []
  };

  result.missingColumns = template.columns.map((col) => col.name).filter((c) => !headers.includes(c));

  result.extraColumns = headers.filter((c) => {
    return !template.columns.map((col) => col.name).includes(c);
  });

  return result;
}

function _mapRowToDBObject(row, form_status, template: Template, userInfo: any): RowMappingResult {
  const messages = [];

  template.columns.forEach((col) => {
    try {
      let mappedPath = col?.mappedPath;

      if (mappedPath === null) {
        mappedPath = `unmapped_fields.${slugify(col.name)}_${row.data[col.name].spreadsheetCellAddress}`;
        messages.push(`Column [${col.name}] has no object mapping defined, using: ${mappedPath}`);
      }
    } catch (e) {
      messages.push(`error mapping field ${col.name} .  ${e}`);
    }
  });

  const mappedObject = _mapToDBObject(row, form_status, template.type, template.subtype, userInfo);

  return {
    mappedObject: mappedObject,
    messages
  };
}

async function _validateCell(
  template: Template,
  templateColumn: TemplateColumn,
  data: string,
  row?: any
): Promise<CellValidationResult> {
  const result: CellValidationResult = {
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

  if (templateColumn?.required) {
    if (data === null || data?.trim()?.length === 0) {
      result.validationMessages.push({
        severity: 'error',
        messageTitle: 'This value is required'
      });
      return result;
    }
  }

  switch (templateColumn?.dataType) {
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
      {
        const foundCode = templateColumn.codes.find((c) => c.code === data);
        result.parsedValue = foundCode?.code;
        result.friendlyValue = foundCode?.description;
        defaultLog.info({ message: `parsed ${data}`, foundCode, templateColumn });

        const isOptionalAndBlank = !templateColumn?.required && data === '';
        if (!result.parsedValue && !isOptionalAndBlank) {
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
      {
        if (!templateColumn.required && (data === null || data === undefined || data === '')) {
          break;
        }
        const parsedDate = moment(data as string, DATE_ONLY_FORMAT);
        if (!parsedDate.isValid()) {
          result.validationMessages.push({
            severity: 'error',
            messageTitle: `Date not parseable`,
            messageDetail: `Value could not be parsed as an ISO 8601 Date ${DATE_ONLY_FORMAT}`
          });
        } else {
          // convert to storage format (which happens to be the same, in this case)
          result.parsedValue = parsedDate.format('YYYY-MM-DD');
          if (
            templateColumn.validations.dateMustNotBeFuture !== null &&
            templateColumn.validations.dateMustNotBeFuture
          ) {
            const now = moment();
            if (now.isBefore(parsedDate, 'day')) {
              result.validationMessages.push({
                severity: 'error',
                messageTitle: `Date in future`,
                messageDetail: `The date cannot be in the future.`
              });
            }
          }
        }
      }
      break;
    case 'datetime':
      {
        const parsedDate = moment(data as string, DATE_TIME_FORMAT);
        if (!parsedDate.isValid()) {
          result.validationMessages.push({
            severity: 'error',
            messageTitle: `Datetime not parseable`,
            messageDetail: `Value could not be parsed as an ISO 8601 Date ${DATE_TIME_FORMAT}`
          });
        } else {
          // convert to storage format -- ISO 8601
          result.parsedValue = parsedDate.format();
          if (
            templateColumn.validations.dateMustNotBeFuture !== null &&
            templateColumn.validations.dateMustNotBeFuture
          ) {
            const now = moment();
            if (now.isBefore(parsedDate, 'day')) {
              result.validationMessages.push({
                severity: 'error',
                messageTitle: `Datetime in future`,
                messageDetail: `The datetime cannot be in the future.`
              });
            }
          }
        }
      }
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
      // validate if not polygon first to avoid WKT autofill and subsequent crashes
      const shape = data.split(' (')[0];
      if (shape !== 'POLYGON' && shape !== 'MULTIPOLYGON' && !template.key.includes('temp')) {
        result.validationMessages.push({
          severity: 'error',
          messageTitle: `Geometry shape must be a Polygon or Multipolygon, value read as ${shape}`
        });
        break;
      } else if (shape !== 'POINT' && template.key.includes('temp')) {
        result.validationMessages.push({
          severity: 'error',
          messageTitle: `Geometry shape must be a Point, value read as ${shape}`
        });
        break;
      }

      // if doesn't break from polygon or multipolygon, check for possible segments
      if (shape === 'MULTIPOLYGON' && !multipolygonIsConnected(data)) {
        result.validationMessages.push({
          severity: 'error',
          messageTitle: `This multipolygon has more than one distinct polygons`
        });
      }

      // hack for year one garbage import data
      if (shape === 'POINT') {
        const geojson = parseWKTasGeoJSON(data);
        const parsedArea = parseInt(row?.['data']?.['Area']);
        if (geojson !== null && !(parsedArea > 0)) {
          result.validationMessages.push({
            severity: 'error',
            messageTitle: `Area needs to be a number`
          });
        }
        if (geojson !== null && parsedArea > 0) {
          const radius = Math.sqrt(parsedArea / Math.PI);
          const newPoly = circle(geojson, radius, { units: 'meters', steps: 46 });
          const newWKT = parseGeoJSONasWKT(newPoly);
          data = newWKT;
        }
      }

      if (validateAsWKT(data)) {
        try {
          result.parsedValue = await autofillFromPostGIS(data);
        } catch (e) {
          result.validationMessages.push({
            severity: 'informational',
            messageTitle: 'A problem occurred when checking area, geometry validity is uncertain',
            messageDetail: e
          });
        }
      } else {
        result.validationMessages.push({
          severity: 'error',
          messageTitle: 'Could not be interpreted as a WKT geometry.'
          //          messageDetail: data
        });
      }
      try {
        const inBounds = (result.parsedValue as parsedGeoType).within_bc;
        if (!inBounds) {
          result.validationMessages.push({
            severity: 'error',
            messageTitle: 'Is not wholly within the bounds of the Province of British Columbia'
          });
        }
      } catch (e) {
        result.validationMessages.push({
          severity: 'informational',
          messageTitle: 'A problem occurred when checking bounds, geometry validity is uncertain',
          messageDetail: e
        });
      }

      if ((result.parsedValue as parsedGeoType).area > lookupAreaLimit(template.subtype)) {
        result.validationMessages.push({
          severity: 'error',
          messageTitle: `Area cannot be larger than ${lookupAreaLimit(template.subtype)}`
        });
      }

      break;
    case 'tristate':
      switch (data?.toLowerCase()) {
        case 'n':
        case 'no':
        case 'f':
        case 'false':
          result.parsedValue = 'No';
          break;
        case 'y':
        case 'yes':
        case 't':
        case 'true':
          result.parsedValue = 'Yes';
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
  validateBatchAgainstTemplate: async (
    template: Template,
    batch,
    created_activities,
    reqUser: any
  ): Promise<BatchValidationResult> => {
    const result = new BatchValidationResult();
    let totalErrorCount = 0;
    const globalValidationMessages = [];

    const batchDataCopy = { ...batch };

    const { missingColumns, extraColumns } = columnPresenceCheck(template, batchDataCopy);
    globalValidationMessages.push(
      ...missingColumns.map((c) => `The required column [${c}] is missing in your submission`)
    );
    totalErrorCount += missingColumns.length;

    globalValidationMessages.push(
      ...extraColumns.map((c) => `The extraneous column [${c}] in your submission will be ignored`)
    );

    for (let rowIndex = 0; rowIndex < batchDataCopy.rows.length; rowIndex++) {
      const row = batchDataCopy.rows[rowIndex];
      for (let colIndex = 0; colIndex < batchDataCopy.headers.length; colIndex++) {
        const field = batchDataCopy.headers[colIndex];
        const templateColumn = template.columns.find((t) => t.name === field);

        try {
          const validatedCellData = await _validateCell(template, templateColumn, row.data[field], row);
          row.data[field] = {
            inputValue: row.data[field],
            templateColumn,
            spreadsheetCellAddress: _cellAddress(rowIndex + 1 /* skip header */, colIndex + 1 /* 1-based count */),
            ...validatedCellData
          };
        } catch (e) {
          const message = e?.message || e;
          defaultLog.warn({ message: 'Error mapping', templateColumn, error: message });
        }

        if (row.data[field]?.validationMessages?.filter((r) => r.severity !== 'informational').length > 0) {
          totalErrorCount += row.data[field]?.validationMessages?.filter((r) => r.severity !== 'informational').length;
        }
      }

      const { mappedObject, messages } = _mapRowToDBObject(
        row,
        created_activities[rowIndex]?.form_status,
        template,
        reqUser
      );
      row.mappedObject = mappedObject;
      row.mappedObjectMessages = messages;

      const rowValidationResults = template.rowValidators.map((rv) => {
        try {
          return rv(row);
        } catch (e) {
          defaultLog.error({
            message: 'Caught an error while running a row-level validator',
            error: e,
            validator: rv.name
          });
        }
      });

      for (const f of rowValidationResults) {
        if (!f.valid) {
          totalErrorCount++;
          // map row-level errors back to cell-level for presentation
          f.appliesToFields.forEach((columnWithError) => {
            row?.data?.[columnWithError]?.validationMessages?.push(...f?.validationMessages);
          });
        }
      }

      row.rowValidationResult = rowValidationResults;
    }

    result.validatedBatchData = batchDataCopy;
    result.globalValidationMessages = globalValidationMessages;
    result.canProceed = totalErrorCount == 0;
    defaultLog.debug({ message: 'object validation complete' });

    return result;
  }
};
