import IIappTableRow from './TableRows/IIappTableRow';
import { ActivityPlantRowOut } from 'api/api-schema';

interface IRecordTable {
  limit: number;
  loading: boolean;
  page: number;
  rows: Array<IIappTableRow> | Array<ActivityPlantRowOut>;
  tableFiltersHash: string | null;
}

export default IRecordTable;
