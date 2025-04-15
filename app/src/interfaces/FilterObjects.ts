import { RecordSetType } from './UserRecordSet';
import { IFilter } from 'state/actions/userSettings/RecordSet';

interface FilterObjects {
  limit?: number;
  page?: number;
  recordSetType?: RecordSetType;
  selectColumns: string[];
  tableFilters: Array<IFilter>;
}

export default FilterObjects;
