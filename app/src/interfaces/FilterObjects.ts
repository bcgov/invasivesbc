import { RecordSetType } from './UserRecordSet';
import { IFilter } from 'state/actions/userSettings/RecordSet';

interface FilterObjects {
  limit?: number;
  page?: number;
  recordSetType: RecordSetType;
  ids_to_filter?: Array<string | number>;
  selectColumns: string[];
  tableFilters: Array<IFilter>;
}

export default FilterObjects;
