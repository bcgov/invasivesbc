import IActivityTableRow from './TableRows/IActivityTableRow';
import IIappTableRow from './TableRows/IIappTableRow';

interface IRecordTable {
  limit: number;
  loading: boolean;
  page: number;
  rows: Array<IIappTableRow> | Array<IActivityTableRow>;
  tableFiltersHash: string | null;
}

export default IRecordTable;
