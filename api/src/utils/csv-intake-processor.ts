'use strict';

import csvParser from 'csv-parser';

import { Readable } from 'stream';

interface RowValidationMessage {
  messages: any[];
  row: number;
}

interface ProcessingOutcome {
  success: boolean;
  validationMessages: RowValidationMessage[];
}

class ValidatorMapping {
  column: string;
  databaseColumn?: string;
  validate: (any) => boolean | string;
  payloadProperty: string;
  required: boolean;

  constructor(column, required = false, databaseColumn = null, payloadProperty = null, validate = () => true) {
    this.column = column;
    this.databaseColumn = databaseColumn;
    this.validate = validate;
    this.payloadProperty = payloadProperty;
    this.required = required;
  }

  isValid(data) {
    if (this.required && data == null) {
      return 'Value is required';
    }

    return this.validate(data);
  }
}

// @todo data type validation
const VALIDATORS = [
  new ValidatorMapping('Activity Type', true, 'activity_type'),
  new ValidatorMapping('Activity SubType', true, 'activity_subtype'),
  new ValidatorMapping('Created Date', false, 'created_timestamp'),
  new ValidatorMapping('Biogeoclimatic Zones', false, 'biogeoclimatic_zones'),
  new ValidatorMapping('Invasive Plant Management Areas', false, 'invasive_plant_management_areas'),
  new ValidatorMapping('Elevation', false, 'elevation'),
  new ValidatorMapping('FLNRO Districts', false, 'flnro_districts'),
  new ValidatorMapping('Ownership', false, 'ownership'),
  new ValidatorMapping('Regional Districts', false, 'regional_districts'),
  new ValidatorMapping('UTM Zone', false, 'utm_zone'),
  new ValidatorMapping('UTM Northing', false, 'utm_northing'),
  new ValidatorMapping('UTM Easting', false, 'utm_easting')
];

// used by template generation
export const HEADERS = VALIDATORS.map((v) => v.column);

// validate and insert a row
const processRow = async (connection, created_by, row, skip_insert = false): Promise<any[]> => {
  const messages = [];

  // pass 1: validation
  VALIDATORS.forEach((v) => {
    if (!Object.prototype.hasOwnProperty.call(row, v.column)) {
      messages.push({ column: v.column, message: 'Missing column' });
    } else {
      const result = v.isValid(row[v.column]);

      if (result !== true) {
        messages.push({ column: v.column, message: result });
      }
    }
  });

  const valid = messages.length === 0;
  if (!valid) {
    return messages;
  }

  // pass 2: build json object
  // @todo deep property setting, more validation
  const activity_payload = {};

  VALIDATORS.filter((v) => v.payloadProperty != null).forEach((v) => {
    activity_payload[v.payloadProperty] = row[v.column];
  });

  // pass 3: insertion
  if (skip_insert) {
    // if we failed an earlier row, we skip the insert (but we still validate)
    return messages;
  }

  // metadata
  let insert_columns = [
    { column: 'created_by', data: created_by },
    { column: 'activity_payload', data: JSON.stringify(activity_payload) }
  ];

  // sql columns
  insert_columns = insert_columns.concat(
    VALIDATORS.filter((v) => v.databaseColumn != null).map((v) => {
      return {
        column: v.databaseColumn,
        data: row[v.column]
      };
    })
  );

  const q = `insert into activity_incoming_data (${insert_columns.map((c) => c.column).join(', ')}) values (${Array(
    insert_columns.length
  )
    .fill(1)
    .map((_, i) => `$${i + 1}`)
    .join(', ')}) returning activity_incoming_data_id as id`;

  try {
    await connection.query(
      q,
      insert_columns.map((c) => c.data)
    );

    //@todo send result back to the client for insertion into created_object_details
  } catch (err) {
    messages.push({
      column: null,
      message: 'Database error while inserting row.' + err
    });
  }

  return messages;
};

function processCSVData(connection, created_by, data): Promise<ProcessingOutcome> {
  return new Promise<ProcessingOutcome>((resolve, reject) => {
    let errorEncountered = false;
    const validationMessages: RowValidationMessage[] = [];

    const parser = csvParser({
      mapHeaders: ({ header }) => header.trim()
    });

    let i = 0;

    Readable.from(data)
      .pipe(parser)
      .on('data', async (row) => {
        i++;
        const messages = await processRow(connection, created_by, row, validationMessages.length > 0);
        if (messages.length > 0) {
          validationMessages.push({
            row: i,
            messages
          });
        }
      })
      .on('error', (err) => {
        errorEncountered = true;
        validationMessages.push({
          row: -1,
          messages: [err.message]
        });

        reject({
          success: false,
          validationMessages
        });
      })
      .on('end', () => {
        resolve({
          success: !errorEncountered && validationMessages.length === 0,
          validationMessages
        });
      });
  });
}

export { processCSVData };
