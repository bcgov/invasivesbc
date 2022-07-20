import * as Knex from 'knex';
const DB_SCHEMA = 'invasivesbc';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path=invasivesbc,public;
    drop table if exists user_role;
    create table if not exists user_role(
        role_id serial primary key not null,
        role_description varchar(250) not null,
        role_name varchar(250) not null,
        created_at timestamp default CURRENT_TIMESTAMP,
        updated_at timestamp default CURRENT_TIMESTAMP
    );
    
    create table if not exists user_access(
        access_id serial primary key not null,
        user_id integer,
        role_id integer,
        constraint fk_user foreign key(user_id) references application_user(user_id) on delete cascade,
        constraint fk_role foreign key(role_id) references user_role(role_id) on delete cascade,
        created_at timestamp default CURRENT_TIMESTAMP,
        updated_at timestamp default CURRENT_TIMESTAMP,
        UNIQUE (user_id, role_id)
    );

    CREATE SEQUENCE IF NOT EXISTS ${DB_SCHEMA}.user_role_role_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

    ALTER SEQUENCE ${DB_SCHEMA}.user_role_role_id_seq OWNED BY ${DB_SCHEMA}.user_role.role_id;

    ALTER TABLE ONLY ${DB_SCHEMA}.user_role ALTER COLUMN role_id SET DEFAULT nextval('${DB_SCHEMA}.user_role_role_id_seq'::regclass);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    drop table if exists user_role;
    drop table if exists user_access;
  `);
}
