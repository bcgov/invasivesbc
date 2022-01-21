import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';

/**
 * Create the `user_role` table.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    CREATE TABLE if not exists ${DB_SCHEMA}.user_role (
        user_role_id integer NOT NULL,
        user_id integer NOT NULL,
        role_code_id integer NOT NULL,
        created_at timestamp without time zone DEFAULT now(),
        updated_at timestamp without time zone DEFAULT now()
    );

    ALTER TABLE ${DB_SCHEMA}.user_role OWNER TO invasivebc;

    COMMENT ON TABLE ${DB_SCHEMA}.user_role IS 'This is join (pivot) table for to store different role associated with an account user. The relation between user and roles are many to many in nature.';

    COMMENT ON COLUMN ${DB_SCHEMA}.user_role.user_role_id IS 'Auto generated primary key.';

    COMMENT ON COLUMN ${DB_SCHEMA}.user_role.user_id IS 'Foreign key reference to user table';

    COMMENT ON COLUMN ${DB_SCHEMA}.user_role.role_code_id IS 'Foreign key reference to role code table';

    COMMENT ON COLUMN ${DB_SCHEMA}.user_role.created_at IS 'Timestamp column to check creation time of record';

    COMMENT ON COLUMN ${DB_SCHEMA}.user_role.updated_at IS 'Timestamp column to check modify time of record';

    CREATE SEQUENCE ${DB_SCHEMA}.user_role_user_role_id_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;

    ALTER TABLE ${DB_SCHEMA}.user_role_user_role_id_seq OWNER TO invasivebc;

    ALTER SEQUENCE ${DB_SCHEMA}.user_role_user_role_id_seq OWNED BY ${DB_SCHEMA}.user_role.user_role_id;

    ALTER TABLE ONLY ${DB_SCHEMA}.user_role ALTER COLUMN user_role_id SET DEFAULT nextval('${DB_SCHEMA}.user_role_user_role_id_seq'::regclass);

    ALTER TABLE ONLY ${DB_SCHEMA}.user_role
        ADD CONSTRAINT user_role_pkey PRIMARY KEY (user_role_id);

    ALTER TABLE ONLY ${DB_SCHEMA}.user_role
        ADD CONSTRAINT user_role_user_id_fkey FOREIGN KEY (user_id) REFERENCES ${DB_SCHEMA}.application_user(user_id) ON DELETE CASCADE;

  `);
}

/**
 * Drop the `user_role` table.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    DROP TABLE IF EXISTS ${DB_SCHEMA}.user_role;
  `);
}
