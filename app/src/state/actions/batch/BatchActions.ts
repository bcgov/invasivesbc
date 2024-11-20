import { createAction } from '@reduxjs/toolkit';
import { DeepBatch, DeepTemplate, ShallowBatch } from 'state/reducers/batch';

interface IBatchCreateWithCallback {
  csvData: Record<string, any> | null;
  template?: string;
  resolve: Function;
  reject: Function;
}

export interface IBatchSuccess extends DeepBatch {
  batchId: string;
}
export interface IBatchUpdate {
  id: string;
  csvData: string;
}
export interface IBatchExecute {
  id: string;
  desiredActivityState: string;
  treatmentOfErrorRows: string;
}

export interface IBatchListTemplate {
  name: string;
  key: string;
}

export interface IBatchDownloadTemplate {
  key: string;
  data: DeepTemplate;
}

export interface IBatchDownloadTemplateCsv {
  key: string;
  resolve: any;
}
class BatchActions {
  private static readonly PREFIX = 'Batch';

  static readonly list = createAction(`${this.PREFIX}/list`);
  static readonly listSuccess = createAction<ShallowBatch[]>(`${this.PREFIX}/listSuccess`);

  static readonly retrieve = createAction<string>(`${this.PREFIX}/retrieve`);
  static readonly retrieveSuccess = createAction<DeepBatch>(`${this.PREFIX}/retrieveSuccess`);

  static readonly createWithCallback = createAction<IBatchCreateWithCallback>(`${this.PREFIX}/createWithCallback`);
  static readonly createSuccess = createAction<IBatchSuccess>(`${this.PREFIX}/create`);

  static readonly update = createAction<IBatchUpdate>(`${this.PREFIX}/update`);
  static readonly updateSuccess = createAction<IBatchSuccess>(`${this.PREFIX}/updateSuccess`);

  static readonly delete = createAction<string>(`${this.PREFIX}/delete`);
  static readonly deleteSuccess = createAction(`${this.PREFIX}/deleteSuccess`);
  static readonly deleteError = createAction(`${this.PREFIX}/deleteError`);

  static readonly execute = createAction<IBatchExecute>(`${this.PREFIX}/execute`);
  static readonly executeSuccess = createAction<DeepBatch>(`${this.PREFIX}/executeSuccess`);
  static readonly executeError = createAction<string>(`${this.PREFIX}/executeError`);

  static readonly templateList = createAction(`${this.PREFIX}/templateList`);
  static readonly templateListSuccess = createAction<IBatchListTemplate[]>(`${this.PREFIX}/templateListSuccess`);

  static readonly downloadTemplate = createAction<string>(`${this.PREFIX}/downloadTemplate`);
  static readonly downloadTemplateSuccess = createAction<IBatchDownloadTemplate>(
    `${this.PREFIX}/downloadTemplateSuccess`
  );
  static readonly downloadTemplateCsv = createAction<IBatchDownloadTemplateCsv>(`${this.PREFIX}/downloadTemplateCsv`);
}

export default BatchActions;
