import IappRecord from './IappRecord';
import UserRecord from './UserRecord';

interface IRecordTable {
  limit: number;
  loading: boolean;
  page: number;
  rows: Array<IappRecord | UserRecord>;
  tableFiltersHash: string | null;
  idList: Array<string | number>;
}

export default IRecordTable;
