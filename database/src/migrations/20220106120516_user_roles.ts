import * as Knex from 'knex';
const DB_SCHEMA = 'public';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path=invasivesbc,public;
    drop table if exists user_role;
    create table user_role(
        role_id serial primary key not null,
        role_description varchar(250) not null,
        role_name varchar(250) not null,
        created_at timestamp default CURRENT_TIMESTAMP,
        updated_at timestamp default CURRENT_TIMESTAMP
    );
    
    drop table if exists user_access;
    create table user_access(
        access_id serial primary key not null,
        user_id integer,
        role_id integer,
        constraint fk_user foreign key(user_id) references application_user(user_id) on delete cascade,
        constraint fk_role foreign key(role_id) references user_role(role_id) on delete cascade,
        created_at timestamp default CURRENT_TIMESTAMP,
        updated_at timestamp default CURRENT_TIMESTAMP
    );
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    drop table if exists user_role;
    drop table if exists user_access;
  `);
}
