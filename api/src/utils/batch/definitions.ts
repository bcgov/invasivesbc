import { SQL } from 'sql-template-strings';
import { PoolClient } from 'pg';
import { RowValidationResult } from './validation';

type templateDataType =
  | 'text'
  | 'numeric'
  | 'date'
  | 'datetime'
  | 'codeReference'
  | 'codeReferenceMulti'
  | 'boolean'
  | 'tristate'
  | 'WKT';

export class TemplateColumn {
  constructor(readonly name, readonly dataType: templateDataType, readonly mappedPath: string | null) {}

  helpText: string | null;
  required = false;

  validations: {
    minLength: number | null;
    maxLength: number | null;
    minValue: number | null;
    maxValue: number | null;
    containedInCodeTable: string | string[] | null;
  };

  codes: CodeEntry[] = [];

  async hydrateCodes(dbConnection: PoolClient) {
    if (
      (this.dataType === 'codeReference' || this.dataType === 'codeReferenceMulti') &&
      this.validations.containedInCodeTable !== null
    ) {
      let codesToCheck: string[];
      if (Array.isArray(this.validations.containedInCodeTable)) {
        codesToCheck = this.validations.containedInCodeTable;
      } else {
        codesToCheck = [this.validations.containedInCodeTable];
      }

      const result = await dbConnection.query(SQL`SELECT ct.code_name        as code,
                                                         ct.code_description as description,
                                                         ch.code_header_name as header
                                                  from code as ct
                                                         inner join code_header ch on ct.code_header_id = ch.code_header_id
                                                         inner join code_category cc on ch.code_category_id = cc.code_category_id
                                                  where ch.code_header_name = ANY (${codesToCheck})
                                                    and cc.code_category_name = 'invasives'
                                                  order by ct.code_sort_order asc`);
      this.codes = result.rows.map((r) => new CodeEntry(r['header'], r['code'], r['description']));
    }
  }
}

export class CodeEntry {
  constructor(readonly header: string, readonly code: string, readonly description: string) {}
}

export class TemplateColumnBuilder {
  constructor(readonly name, readonly dataType: templateDataType, readonly mappedPath = null) {
    this.validations = {
      minLength: null,
      maxLength: null,
      minValue: null,
      maxValue: null,
      containedInCodeTable: null
    };
  }

  build(): TemplateColumn {
    const tc = new TemplateColumn(this.name, this.dataType, this.mappedPath);
    tc.required = this.required;
    tc.helpText = this.helpText;
    tc.validations = {
      ...this.validations
    };
    return tc;
  }

  required = false;

  isRequired(required = true): this {
    this.required = required;
    return this;
  }

  referencesCode(codeTable: string | string[]): this {
    this.validations.containedInCodeTable = codeTable;
    return this;
  }

  valueRange(min: number | null, max: number | null): this {
    this.validations.minValue = min;
    this.validations.maxValue = max;
    return this;
  }

  lengthRange(min: number | null, max: number | null): this {
    this.validations.minLength = min;
    this.validations.maxLength = max;
    return this;
  }

  helpText: string | null;

  withHelpText(helpText: string): this {
    this.helpText = helpText;
    return this;
  }

  validations: {
    minLength: number | null;
    maxLength: number | null;
    minValue: number | null;
    maxValue: number | null;
    containedInCodeTable: string | string[] | null;
  };
}

type RowValidator = (rowData) => RowValidationResult;

export class Template {
  constructor(readonly key: string, readonly name: string, readonly helpText: string) {
    this.rowValidators = [];
    this.subtype = name;
  }

  async hydrateAllCodes(dbConnection: PoolClient) {
    for (const c of this.columns) {
      await c.hydrateCodes(dbConnection);
    }
  }

  type: string = 'Observation';
  subtype: string;
  columns: TemplateColumn[];
  rowValidators: RowValidator[];
}
