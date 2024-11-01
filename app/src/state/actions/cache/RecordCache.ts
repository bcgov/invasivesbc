import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RecordCacheServiceFactory } from 'utils/record-cache/context';

class RecordCache {
  static readonly PREFIX = 'RecordCache';

  static readonly downloadProgressEvent = createAction<ProgressCallbackParameters>(`${this.PREFIX}/downloadProgress`);

  static readonly repositoryList = createAsyncThunk(`${this.PREFIX}/repositoryList`, async () => {
    return await (await RecordCacheServiceFactory.getPlatformInstance()).listRepositories();
  });
  static readonly deleteRepository = createAsyncThunk(`${this.PREFIX}/repositoryDelete`, async (repository: string) => {
    const service = await RecordCacheServiceFactory.getPlatformInstance();
    await service.deleteRepository(repository);
    return await service.listRepositories();
  });
}

export default RecordCache;
