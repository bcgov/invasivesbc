import { createAction } from '@reduxjs/toolkit';
import { DeepBatch, ShallowBatch } from 'state/reducers/batch';

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
class BatchActions {
  private static readonly PREFIX = 'Batch';

  static readonly list = createAction(`${this.PREFIX}/list`);
  static readonly listSuccess = createAction<ShallowBatch[]>(`${this.PREFIX}/listSuccess`);

  static readonly retrieve = createAction<string>(`${this.PREFIX}/retrieve`);
  static readonly retrieveSuccess = createAction<DeepBatch>(`${this.PREFIX}/retrieveSuccess`);

  static readonly createWithCallback = createAction<IBatchCreateWithCallback>(`${this.PREFIX}/createWithCallback`);
  static readonly createSuccess = createAction<IBatchSuccess>(`${this.PREFIX}/create`);

  static readonly update = createAction<IBatchUpdate>(`${this.PREFIX}/update`);
  static readonly updateSuccess = createAction(`${this.PREFIX}/updateSuccess`);
  static readonly updateError = createAction(`${this.PREFIX}/updateError`);

  static readonly delete = createAction(`${this.PREFIX}/delete`);
  static readonly deleteSuccess = createAction(`${this.PREFIX}/deleteSuccess`);
  static readonly deleteError = createAction(`${this.PREFIX}/deleteError`);

  static readonly execute = createAction(`${this.PREFIX}/execute`);
  static readonly executeSuccess = createAction(`${this.PREFIX}/executeSuccess`);
  static readonly executeError = createAction(`${this.PREFIX}/executeError`);

  static readonly templateList = createAction(`${this.PREFIX}/templateList`);
  static readonly templateListSuccess = createAction(`${this.PREFIX}/templateListSuccess`);
  static readonly templateListError = createAction(`${this.PREFIX}/templateListError`);

  static readonly downloadTemplate = createAction(`${this.PREFIX}/downloadTemplate`);
  static readonly downloadTemplateSuccess = createAction(`${this.PREFIX}/downloadTemplateSuccess`);
  static readonly downloadTemplateError = createAction(`${this.PREFIX}/downloadTemplateError`);
  static readonly downloadTemplateCsv = createAction(`${this.PREFIX}/downloadTemplateCsv`);
}

export default BatchActions;
