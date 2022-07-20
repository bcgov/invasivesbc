import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';

/**
 * Create the `application_user` table.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    CREATE TABLE if not exists ${DB_SCHEMA}.application_user (
        user_id integer NOT NULL,
        first_name character varying(100),
        last_name character varying(100),
        email character varying(300) NOT NULL,
        preferred_username character varying(300) NOT NULL,
        account_status smallint DEFAULT 1,
        expiry_date date,
        activation_status smallint DEFAULT 1,
        active_session_id integer,
        created_at timestamp without time zone DEFAULT now(),
        updated_at timestamp without time zone DEFAULT now()
    );

    COMMENT ON TABLE ${DB_SCHEMA}.application_user IS 'User of the application is a person with valid IDR or BCeID. Default role of the user is Viewer of InvasiveBC data records. Other typical user types are admin, subject matter expert (sme/ or data editor)';

    COMMENT ON COLUMN ${DB_SCHEMA}.application_user.user_id IS 'Auto generated primary key. Uniquely identify user';

    COMMENT ON COLUMN ${DB_SCHEMA}.application_user.first_name IS 'First name of the user';

    COMMENT ON COLUMN ${DB_SCHEMA}.application_user.last_name IS 'Last name of the user';

    COMMENT ON COLUMN ${DB_SCHEMA}.application_user.email IS 'Email address of user';

    COMMENT ON COLUMN ${DB_SCHEMA}.application_user.preferred_username IS 'IDR of BCeID associated with user';

    COMMENT ON COLUMN ${DB_SCHEMA}.application_user.account_status IS 'Status of user account. This application level enum flag values. 0 => Inactive, 1 => Active, 2 => Suspended. Currently this values are managed by application, no code table for business';

    COMMENT ON COLUMN ${DB_SCHEMA}.application_user.expiry_date IS 'Expiry date of the account';

    COMMENT ON COLUMN ${DB_SCHEMA}.application_user.activation_status IS 'Flag to check account is active or not';

    COMMENT ON COLUMN ${DB_SCHEMA}.application_user.active_session_id IS 'Reference to active session table. This is non referential colum to create soft link to user_session table. This column will used to keep track current active session of the user';

    COMMENT ON COLUMN ${DB_SCHEMA}.application_user.created_at IS 'Timestamp column to check creation time of record';

    COMMENT ON COLUMN ${DB_SCHEMA}.application_user.updated_at IS 'Timestamp column to check modify time of record';

    CREATE SEQUENCE ${DB_SCHEMA}.application_user_user_id_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;

    ALTER SEQUENCE ${DB_SCHEMA}.application_user_user_id_seq OWNED BY ${DB_SCHEMA}.application_user.user_id;

    ALTER TABLE ONLY ${DB_SCHEMA}.application_user ALTER COLUMN user_id SET DEFAULT nextval('${DB_SCHEMA}.application_user_user_id_seq'::regclass);

    ALTER TABLE ONLY ${DB_SCHEMA}.application_user
        ADD CONSTRAINT application_user_email_key UNIQUE (email);

    ALTER TABLE ONLY ${DB_SCHEMA}.application_user
        ADD CONSTRAINT application_user_pkey PRIMARY KEY (user_id);

    ALTER TABLE ONLY ${DB_SCHEMA}.application_user
        ADD CONSTRAINT application_user_preferred_username_key UNIQUE (preferred_username);

  `);
}

/**
 * Drop the `application_user` table.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    DROP TABLE IF EXISTS ${DB_SCHEMA}.application_user;
  `);
}
