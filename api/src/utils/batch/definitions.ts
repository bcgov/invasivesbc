
type templateDataType = 'text' | 'numeric' | 'date' | 'codeReference' | 'codeReferenceMulti' | 'boolean';

export class TemplateColumn {
  constructor(readonly name, readonly dataType: templateDataType) {
  }

  helpText: string | null;
  required: boolean = false;

  validations: {
    minLength: number | null;
    maxLength: number | null;
    minValue: number | null;
    maxValue: number | null;
    containedInCodeTable: string | null;
  };
}

export class TemplateColumnBuilder {
  constructor(readonly name, readonly dataType: templateDataType) {
  }

  build(): TemplateColumn {
    const tc = new TemplateColumn(this.name, this.dataType);
    tc.required = this.required;
    tc.helpText = this.helpText;
    return tc;
  }

  required: boolean = false;

  isRequired(required: boolean = true): this {
    this.required = required;
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
    containedInCodeTable: string | null;
  };
}

export class Template {

  constructor(readonly key: string, readonly name: string, readonly helpText: string) {
  }

  columns: TemplateColumn[];
}
