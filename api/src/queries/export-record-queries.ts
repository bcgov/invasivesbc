import { SQL } from 'sql-template-strings';

export const GET_LATEST_EXPORT_METADATA =
  SQL`SELECT DISTINCT ON (e.export_type) e.export_type as "type",
                                         e.export_time as "time",
                                         e.last_record,
                                         e.file_reference
      FROM export_records e
      order by export_type asc, export_time desc
  `;
