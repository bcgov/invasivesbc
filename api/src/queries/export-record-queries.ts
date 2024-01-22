import { SQL } from 'sql-template-strings';

export const GET_LATEST_EXPORT_METADATA = SQL`SELECT DISTINCT ON (e.export_type) e.export_type as "type",
                                                                                 e.export_time as "time",
                                                                                 e.last_record,
                                                                                 e.file_reference
                                              FROM export_records e
                                              order by export_type asc, export_time desc
`;

export const STALE_EXPORTS_SQL = SQL`select id,
                                            file_reference
                                     from export_records
                                     order by export_time desc
                                     offset 6`;

export const DELETE_STALE_EXPORT_RECORD = (id) =>
  SQL`delete
      from export_records
      where id = ${id}`;
