import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    drop table if exists invasivesbc.export_records;
    drop sequence if exists invasivesbc.export_records_id_seq;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE invasivesbc.export_records
    (
      id             integer                                               NOT NULL,
      export_time    timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
      export_type    character varying(32)                                 NOT NULL,
      last_record    integer,
      file_reference character varying(512)                                NOT NULL,
      CONSTRAINT export_records_export_type_check CHECK ((length((export_type)::text) >= 4)),
      CONSTRAINT export_records_file_reference_check CHECK ((length((file_reference)::text) >= 4))
    );
    CREATE SEQUENCE invasivesbc.export_records_id_seq
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;
    ALTER SEQUENCE invasivesbc.export_records_id_seq OWNED BY invasivesbc.export_records.id;
    ALTER TABLE ONLY invasivesbc.export_records
      ALTER COLUMN id SET DEFAULT nextval('invasivesbc.export_records_id_seq'::regclass);
  `);
}
