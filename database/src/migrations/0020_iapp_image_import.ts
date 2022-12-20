import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {

  await knex.raw(`
  set search_path=invasivesbc,public;

  CREATE TABLE iapp_imported_images (
    id serial not null primary key,
    original_iapp_id bigint not null unique,
    perspective_code varchar(1),
    sample_point_id bigint,
    site_id bigint,
    treatment_id bigint,
    image_date date not null,
    reference_no varchar(20) not null,
    comments text,
    detected_mime_type varchar(255),
    imported_at timestamp without time zone not null default current_timestamp,
    revision_count_at_import_time bigint not null,
    media_key varchar(255) unique
  );
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=invasivesbc,public;

    DROP TABLE iapp_imported_images;
    `);
}
