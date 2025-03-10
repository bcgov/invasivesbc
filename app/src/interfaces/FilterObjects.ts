import { IFilter } from 'state/actions/userSettings/RecordSet';
import { RecordSetType } from './UserRecordSet';

interface FilterObjects {
  limit?: number;
  page?: number;
  recordSetType?: RecordSetType;
  selectColumns: string[];
  tableFilters: Array<IFilter>;
}

export default FilterObjects;
