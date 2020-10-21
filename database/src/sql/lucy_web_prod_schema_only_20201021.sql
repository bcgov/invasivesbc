-- ************************************************************************
-- * NOTE: some modifications have been made to the raw `pg_dump` output. *
-- * 1. The `SET ...` statements have been commented out.                 *
-- * 2. The `CREATE EXTENSION ...` statements have been commented out.    *
-- * 3. The `CREATE SCHEMA ...` statement had `IF NOT EXISTS` added.      *
-- ************************************************************************

--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.10
-- Dumped by pg_dump version 9.6.10

-- SET statement_timeout = 0;
-- SET lock_timeout = 0;
-- SET idle_in_transaction_session_timeout = 0;
-- SET client_encoding = 'UTF8';
-- SET standard_conforming_strings = on;
-- SELECT pg_catalog.set_config('search_path', '', false);
-- SET check_function_bodies = false;
-- SET client_min_messages = warning;
-- SET row_security = off;

--
-- Name: invasivesbc; Type: SCHEMA; Schema: -; Owner: invasivebc
--

CREATE SCHEMA IF NOT EXISTS invasivesbc;


ALTER SCHEMA invasivesbc OWNER TO invasivebc;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

-- CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

-- COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: 
--

-- CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

-- COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: 
--

-- CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

-- COMMENT ON EXTENSION postgis IS 'PostGIS geometry, geography, and raster spatial types and functions';


--
-- Name: tablefunc; Type: EXTENSION; Schema: -; Owner: 
--

-- CREATE EXTENSION IF NOT EXISTS tablefunc WITH SCHEMA invasivesbc;


--
-- Name: EXTENSION tablefunc; Type: COMMENT; Schema: -; Owner: 
--

-- COMMENT ON EXTENSION tablefunc IS 'functions that manipulate whole tables, including crosstab';


-- SET default_tablespace = '';

-- SET default_with_oids = false;

--
-- Name: access_request; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.access_request (
    request_id integer NOT NULL,
    request_note character varying(500),
    status integer,
    approver_note character varying(500),
    requested_role_code_id integer NOT NULL,
    requester_user_id integer NOT NULL,
    approver_user_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE invasivesbc.access_request OWNER TO invasivebc;

--
-- Name: TABLE access_request; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.access_request IS 'Table to store requests of access level change for a user. Request will be handle by admin';


--
-- Name: COLUMN access_request.request_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.access_request.request_id IS 'Auto generated primary key';


--
-- Name: COLUMN access_request.request_note; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.access_request.request_note IS 'Note attached with access request.';


--
-- Name: COLUMN access_request.status; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.access_request.status IS 'This column will store status of the request. This is integer enum. Values managed by application.';


--
-- Name: COLUMN access_request.approver_note; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.access_request.approver_note IS 'Note from approver';


--
-- Name: COLUMN access_request.requested_role_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.access_request.requested_role_code_id IS 'FOREIGN KEY reference to Role Code Table. This value specify requested access type';


--
-- Name: COLUMN access_request.requester_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.access_request.requester_user_id IS 'FOREIGN KEY reference to User table to store requester id';


--
-- Name: COLUMN access_request.approver_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.access_request.approver_user_id IS 'FOREIGN KEY reference to User table to store approver id';


--
-- Name: COLUMN access_request.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.access_request.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN access_request.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.access_request.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: access_request_request_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.access_request_request_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.access_request_request_id_seq OWNER TO invasivebc;

--
-- Name: access_request_request_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.access_request_request_id_seq OWNED BY invasivesbc.access_request.request_id;


--
-- Name: adult_mussels_location_code; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.adult_mussels_location_code (
    adult_mussels_location_code_id integer NOT NULL,
    description character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.adult_mussels_location_code OWNER TO invasivebc;

--
-- Name: TABLE adult_mussels_location_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.adult_mussels_location_code IS 'Code table with options for locations on a watercraft where, upon inspection, mussels were found and/or standing water is present';


--
-- Name: COLUMN adult_mussels_location_code.adult_mussels_location_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.adult_mussels_location_code.adult_mussels_location_code_id IS 'Auto generated sequential primary key column.';


--
-- Name: COLUMN adult_mussels_location_code.description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.adult_mussels_location_code.description IS 'Brief description of the location on the watercraft where adult mussels were found';


--
-- Name: COLUMN adult_mussels_location_code.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.adult_mussels_location_code.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN adult_mussels_location_code.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.adult_mussels_location_code.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN adult_mussels_location_code.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.adult_mussels_location_code.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN adult_mussels_location_code.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.adult_mussels_location_code.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: adult_mussels_location_code_adult_mussels_location_code_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.adult_mussels_location_code_adult_mussels_location_code_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.adult_mussels_location_code_adult_mussels_location_code_id_seq OWNER TO invasivebc;

--
-- Name: adult_mussels_location_code_adult_mussels_location_code_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.adult_mussels_location_code_adult_mussels_location_code_id_seq OWNED BY invasivesbc.adult_mussels_location_code.adult_mussels_location_code_id;


--
-- Name: animal_observation; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.animal_observation (
    animal_observation_id integer NOT NULL,
    observation_timestamp timestamp without time zone NOT NULL,
    observer_first_name character varying(100),
    observer_last_name character varying(100),
    number_of_individuals integer NOT NULL,
    comments character varying(500),
    specimen_available_ind boolean DEFAULT false NOT NULL,
    animal_species_id integer,
    species_agency_code_id integer,
    life_stage_code_id integer,
    behaviour_code_id integer,
    space_geom_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.animal_observation OWNER TO invasivebc;

--
-- Name: TABLE animal_observation; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.animal_observation IS 'An observation record created for an animal species';


--
-- Name: COLUMN animal_observation.animal_observation_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.animal_observation.animal_observation_id IS 'Auto generated sequential primary key column.';


--
-- Name: COLUMN animal_observation.observation_timestamp; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.animal_observation.observation_timestamp IS 'Date and time of the observation record';


--
-- Name: COLUMN animal_observation.observer_first_name; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.animal_observation.observer_first_name IS 'First name of the observer';


--
-- Name: COLUMN animal_observation.observer_last_name; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.animal_observation.observer_last_name IS 'Last name of the observer';


--
-- Name: COLUMN animal_observation.number_of_individuals; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.animal_observation.number_of_individuals IS 'The count of observers';


--
-- Name: COLUMN animal_observation.comments; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.animal_observation.comments IS 'Free-form comments added by the observer';


--
-- Name: COLUMN animal_observation.specimen_available_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.animal_observation.specimen_available_ind IS 'This is an indicator used to indicate whether the specimen is available or not.';


--
-- Name: COLUMN animal_observation.animal_species_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.animal_observation.animal_species_id IS 'Foreign key reference to animal species table';


--
-- Name: COLUMN animal_observation.species_agency_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.animal_observation.species_agency_code_id IS 'Foreign key reference to Species Agency code table';


--
-- Name: COLUMN animal_observation.life_stage_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.animal_observation.life_stage_code_id IS 'Foreign key reference to Life stage code table';


--
-- Name: COLUMN animal_observation.behaviour_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.animal_observation.behaviour_code_id IS 'Foreign key reference to Behaviour code table';


--
-- Name: COLUMN animal_observation.space_geom_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.animal_observation.space_geom_id IS 'Spatial and Geometry reference data associated with record. Foreign key reference to space_geom table';


--
-- Name: COLUMN animal_observation.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.animal_observation.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN animal_observation.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.animal_observation.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN animal_observation.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.animal_observation.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN animal_observation.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.animal_observation.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: animal_observation_animal_observation_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.animal_observation_animal_observation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.animal_observation_animal_observation_id_seq OWNER TO invasivebc;

--
-- Name: animal_observation_animal_observation_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.animal_observation_animal_observation_id_seq OWNED BY invasivesbc.animal_observation.animal_observation_id;


--
-- Name: animal_species; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.animal_species (
    animal_species_id integer NOT NULL,
    common_name character varying(100) NOT NULL,
    scientific_name character varying(100) NOT NULL,
    species_class character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.animal_species OWNER TO invasivebc;

--
-- Name: TABLE animal_species; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.animal_species IS 'The list of all the animal species';


--
-- Name: COLUMN animal_species.animal_species_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.animal_species.animal_species_id IS 'Auto generated primary key';


--
-- Name: COLUMN animal_species.common_name; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.animal_species.common_name IS 'Common or popular name of the species';


--
-- Name: COLUMN animal_species.scientific_name; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.animal_species.scientific_name IS 'Scientific name of the species';


--
-- Name: COLUMN animal_species.species_class; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.animal_species.species_class IS 'The class that the species belongs to';


--
-- Name: COLUMN animal_species.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.animal_species.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN animal_species.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.animal_species.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN animal_species.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.animal_species.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN animal_species.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.animal_species.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: animal_species_animal_species_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.animal_species_animal_species_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.animal_species_animal_species_id_seq OWNER TO invasivebc;

--
-- Name: animal_species_animal_species_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.animal_species_animal_species_id_seq OWNED BY invasivesbc.animal_species.animal_species_id;


--
-- Name: app_migration_table; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.app_migration_table (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE invasivesbc.app_migration_table OWNER TO invasivebc;

--
-- Name: app_migration_table_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.app_migration_table_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.app_migration_table_id_seq OWNER TO invasivebc;

--
-- Name: app_migration_table_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.app_migration_table_id_seq OWNED BY invasivesbc.app_migration_table.id;


--
-- Name: app_role_code; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.app_role_code (
    role_code_id integer NOT NULL,
    role_code character varying(10) NOT NULL,
    role character varying(50),
    description character varying(300),
    active_ind boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE invasivesbc.app_role_code OWNER TO invasivebc;

--
-- Name: TABLE app_role_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.app_role_code IS 'This table holds definition of different user roles of the system along with cross domain code.';


--
-- Name: COLUMN app_role_code.role_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.app_role_code.role_code_id IS 'Auto generated primary key.';


--
-- Name: COLUMN app_role_code.role_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.app_role_code.role_code IS 'Cross domain code to uniquely identify any role';


--
-- Name: COLUMN app_role_code.role; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.app_role_code.role IS 'Role description in words';


--
-- Name: COLUMN app_role_code.description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.app_role_code.description IS 'Detail description of of different roles and access level and functional capability';


--
-- Name: COLUMN app_role_code.active_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.app_role_code.active_ind IS 'Indicator to check active status of code';


--
-- Name: COLUMN app_role_code.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.app_role_code.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN app_role_code.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.app_role_code.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: app_role_code_role_code_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.app_role_code_role_code_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.app_role_code_role_code_id_seq OWNER TO invasivebc;

--
-- Name: app_role_code_role_code_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.app_role_code_role_code_id_seq OWNED BY invasivesbc.app_role_code.role_code_id;


--
-- Name: app_seed_table; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.app_seed_table (
    seed_id integer NOT NULL,
    reference character varying(30) NOT NULL,
    seed_target character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.app_seed_table OWNER TO invasivebc;

--
-- Name: TABLE app_seed_table; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.app_seed_table IS 'Table to store seed entries';


--
-- Name: COLUMN app_seed_table.seed_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.app_seed_table.seed_id IS 'Auto generated sequential primary key column.';


--
-- Name: COLUMN app_seed_table.reference; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.app_seed_table.reference IS 'Reference to the seed file';


--
-- Name: COLUMN app_seed_table.seed_target; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.app_seed_table.seed_target IS 'Name of the target schema';


--
-- Name: COLUMN app_seed_table.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.app_seed_table.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN app_seed_table.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.app_seed_table.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN app_seed_table.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.app_seed_table.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN app_seed_table.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.app_seed_table.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: app_seed_table_seed_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.app_seed_table_seed_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.app_seed_table_seed_id_seq OWNER TO invasivebc;

--
-- Name: app_seed_table_seed_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.app_seed_table_seed_id_seq OWNED BY invasivesbc.app_seed_table.seed_id;


--
-- Name: application_event; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.application_event (
    application_event_id integer NOT NULL,
    event_type integer NOT NULL,
    event_source character varying(1000),
    event_note character varying(200),
    session_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE invasivesbc.application_event OWNER TO invasivebc;

--
-- Name: TABLE application_event; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.application_event IS 'Table to log all application events. Event such as application bootstrapping, error, warning, info. Content of this table helps to monitor and debugging.';


--
-- Name: COLUMN application_event.application_event_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.application_event.application_event_id IS 'Auto generated primary key';


--
-- Name: COLUMN application_event.event_type; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.application_event.event_type IS 'Type enum column. Enum values specify event type. Typical event types are Error, Info, Warning. No separate code tables for business exists for type. App system is managing the values.';


--
-- Name: COLUMN application_event.event_source; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.application_event.event_source IS 'Source information of event. Source will contain information like Source File/Method/Activity';


--
-- Name: COLUMN application_event.event_note; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.application_event.event_note IS 'Additional note or log data attached with event';


--
-- Name: COLUMN application_event.session_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.application_event.session_id IS 'User session attached to the event.';


--
-- Name: COLUMN application_event.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.application_event.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN application_event.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.application_event.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: application_event_application_event_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.application_event_application_event_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.application_event_application_event_id_seq OWNER TO invasivebc;

--
-- Name: application_event_application_event_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.application_event_application_event_id_seq OWNED BY invasivesbc.application_event.application_event_id;


--
-- Name: application_user; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.application_user (
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


ALTER TABLE invasivesbc.application_user OWNER TO invasivebc;

--
-- Name: TABLE application_user; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.application_user IS 'User of the application is a person with valid IDR or BCeID. Default role of the user is Viewer of InvasiveBC data records. Other typical user types are admin, subject matter expert (sme/ or data editor)';


--
-- Name: COLUMN application_user.user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.application_user.user_id IS 'Auto generated primary key. Uniquely identify user';


--
-- Name: COLUMN application_user.first_name; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.application_user.first_name IS 'First name of the user';


--
-- Name: COLUMN application_user.last_name; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.application_user.last_name IS 'Last name of the user';


--
-- Name: COLUMN application_user.email; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.application_user.email IS 'Email address of user';


--
-- Name: COLUMN application_user.preferred_username; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.application_user.preferred_username IS 'IDR of BCeID associated with user';


--
-- Name: COLUMN application_user.account_status; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.application_user.account_status IS 'Status of user account. This application level enum flag values. 0 => Inactive, 1 => Active, 2 => Suspended. Currently this values are managed by application, no code table for business';


--
-- Name: COLUMN application_user.expiry_date; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.application_user.expiry_date IS 'Expiry date of the account';


--
-- Name: COLUMN application_user.activation_status; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.application_user.activation_status IS 'Flag to check account is active or not';


--
-- Name: COLUMN application_user.active_session_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.application_user.active_session_id IS 'Reference to active session table. This is non referential colum to create soft link to user_session table. This column will used to keep track current active session of the user';


--
-- Name: COLUMN application_user.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.application_user.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN application_user.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.application_user.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: application_user_user_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.application_user_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.application_user_user_id_seq OWNER TO invasivebc;

--
-- Name: application_user_user_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.application_user_user_id_seq OWNED BY invasivesbc.application_user.user_id;


--
-- Name: behaviour_code; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.behaviour_code (
    behaviour_code_id integer NOT NULL,
    behaviour_code character varying(10) NOT NULL,
    description character varying(100),
    active_ind boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.behaviour_code OWNER TO invasivebc;

--
-- Name: TABLE behaviour_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.behaviour_code IS 'This is a list of all the different behaviours for a species';


--
-- Name: COLUMN behaviour_code.behaviour_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.behaviour_code.behaviour_code_id IS 'Auto generated primary key';


--
-- Name: COLUMN behaviour_code.behaviour_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.behaviour_code.behaviour_code IS 'Code value for the behaviours';


--
-- Name: COLUMN behaviour_code.description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.behaviour_code.description IS 'Description of code';


--
-- Name: COLUMN behaviour_code.active_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.behaviour_code.active_ind IS 'Indicator to check active status of code';


--
-- Name: COLUMN behaviour_code.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.behaviour_code.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN behaviour_code.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.behaviour_code.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN behaviour_code.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.behaviour_code.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN behaviour_code.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.behaviour_code.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: behaviour_code_behaviour_code_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.behaviour_code_behaviour_code_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.behaviour_code_behaviour_code_id_seq OWNER TO invasivebc;

--
-- Name: behaviour_code_behaviour_code_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.behaviour_code_behaviour_code_id_seq OWNED BY invasivesbc.behaviour_code.behaviour_code_id;


--
-- Name: chemical_treatment; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.chemical_treatment (
    chemical_treatment_id integer NOT NULL,
    chemical_treatment_date date NOT NULL,
    chemical_treatment_primary_paper_file_ref character varying(100),
    chemical_treatment_secondary_paper_file_ref character varying(100),
    pesticide_use_permit character varying(60),
    temperature smallint,
    humidity smallint,
    wind_speed numeric(4,1),
    species_agency_code_id integer,
    pesticide_employer_code_id integer,
    project_management_plan_code_id integer,
    first_applicator_chemical_treatment_employee_id integer,
    second_applicator_chemical_treatment_employee_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer,
    wind_direction_code_id integer,
    chemical_treatment_method_id integer,
    additional_comments character varying(500),
    mix_delivery_rate integer,
    space_geom_id integer
);


ALTER TABLE invasivesbc.chemical_treatment OWNER TO invasivebc;

--
-- Name: TABLE chemical_treatment; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.chemical_treatment IS 'An application of a herbicide. Various herbicides are used for spot treatments of weeds in British Columbia. The herbicide selected should depend on the target weed species and environmental factors. Application rate will be dictated by the size and accessibility of the infestation, its proximity to wells and other water, and the potential impacts of the application on non-target vegetation. Some herbicides have residual effects and persist in the soil in an active state for some time after application. Other herbicides become inactive once they contact soil. The residual activity of a herbicide varies with rate of application, soil properties, and climate, and its impact on non-target vegetation should be carefully considered.
To types of herbicide formats: granular and liquid. IAPP allows for liquid particulars only. Lucy will need to cover off both.';


--
-- Name: COLUMN chemical_treatment.chemical_treatment_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment.chemical_treatment_id IS 'Auto generated primary key. This is auto incremental field';


--
-- Name: COLUMN chemical_treatment.chemical_treatment_date; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment.chemical_treatment_date IS 'Date of the treatment';


--
-- Name: COLUMN chemical_treatment.chemical_treatment_primary_paper_file_ref; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment.chemical_treatment_primary_paper_file_ref IS 'Primary paper file Paper file reference associated with treatment';


--
-- Name: COLUMN chemical_treatment.chemical_treatment_secondary_paper_file_ref; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment.chemical_treatment_secondary_paper_file_ref IS 'Secondary paper file Paper file reference associated with treatment';


--
-- Name: COLUMN chemical_treatment.pesticide_use_permit; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment.pesticide_use_permit IS 'Use permit code of pesticide usage. This is free form information';


--
-- Name: COLUMN chemical_treatment.temperature; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment.temperature IS 'The recorded air temperature at the site of the treatment area at the time of treatment, in degrees Celsius';


--
-- Name: COLUMN chemical_treatment.humidity; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment.humidity IS 'The recorded air humidity at the site of the treatment area at the time of treatment, as a percentage';


--
-- Name: COLUMN chemical_treatment.wind_speed; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment.wind_speed IS 'The recorded wind speed at the site of the treatment area at the time of treatment, in km/h';


--
-- Name: COLUMN chemical_treatment.species_agency_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment.species_agency_code_id IS 'Foreign key reference to Species Agency Code table';


--
-- Name: COLUMN chemical_treatment.pesticide_employer_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment.pesticide_employer_code_id IS 'Foreign key reference to Pesticide employer table';


--
-- Name: COLUMN chemical_treatment.project_management_plan_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment.project_management_plan_code_id IS 'Foreign key reference to Project management plan code table';


--
-- Name: COLUMN chemical_treatment.first_applicator_chemical_treatment_employee_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment.first_applicator_chemical_treatment_employee_id IS 'Foreign key reference to Chemical treatment employee table';


--
-- Name: COLUMN chemical_treatment.second_applicator_chemical_treatment_employee_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment.second_applicator_chemical_treatment_employee_id IS 'Foreign key reference to Chemical treatment employee table';


--
-- Name: COLUMN chemical_treatment.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN chemical_treatment.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN chemical_treatment.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN chemical_treatment.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: COLUMN chemical_treatment.wind_direction_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment.wind_direction_code_id IS 'Foreign key reference to WindDirectionSchema';


--
-- Name: COLUMN chemical_treatment.chemical_treatment_method_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment.chemical_treatment_method_id IS 'Foreign key reference to Chemical Treatment Method codes';


--
-- Name: COLUMN chemical_treatment.additional_comments; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment.additional_comments IS 'Free-form comments added by chemical treatment provider';


--
-- Name: COLUMN chemical_treatment.mix_delivery_rate; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment.mix_delivery_rate IS 'Delivery rate of herbicide tank mix in L/ha';


--
-- Name: COLUMN chemical_treatment.space_geom_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment.space_geom_id IS 'Spatial and Geometry reference data associated with record. Foreign key reference to space_geom table';


--
-- Name: chemical_treatment_chemical_treatment_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.chemical_treatment_chemical_treatment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.chemical_treatment_chemical_treatment_id_seq OWNER TO invasivebc;

--
-- Name: chemical_treatment_chemical_treatment_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.chemical_treatment_chemical_treatment_id_seq OWNED BY invasivesbc.chemical_treatment.chemical_treatment_id;


--
-- Name: chemical_treatment_employee; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.chemical_treatment_employee (
    chemical_treatment_employee_id integer NOT NULL,
    certificate character varying(20) NOT NULL,
    first_name character varying(99) NOT NULL,
    last_name character varying(99) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.chemical_treatment_employee OWNER TO invasivebc;

--
-- Name: TABLE chemical_treatment_employee; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.chemical_treatment_employee IS 'The contractor employee who applied chemical treatment.';


--
-- Name: COLUMN chemical_treatment_employee.chemical_treatment_employee_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment_employee.chemical_treatment_employee_id IS 'Auto generated primary key. This is auto incremental field';


--
-- Name: COLUMN chemical_treatment_employee.certificate; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment_employee.certificate IS 'Certificate number associated with employee';


--
-- Name: COLUMN chemical_treatment_employee.first_name; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment_employee.first_name IS 'First name of the employee';


--
-- Name: COLUMN chemical_treatment_employee.last_name; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment_employee.last_name IS 'Last name of the employee';


--
-- Name: COLUMN chemical_treatment_employee.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment_employee.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN chemical_treatment_employee.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment_employee.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN chemical_treatment_employee.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment_employee.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN chemical_treatment_employee.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment_employee.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: chemical_treatment_employee_chemical_treatment_employee_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.chemical_treatment_employee_chemical_treatment_employee_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.chemical_treatment_employee_chemical_treatment_employee_id_seq OWNER TO invasivebc;

--
-- Name: chemical_treatment_employee_chemical_treatment_employee_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.chemical_treatment_employee_chemical_treatment_employee_id_seq OWNED BY invasivesbc.chemical_treatment_employee.chemical_treatment_employee_id;


--
-- Name: chemical_treatment_method; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.chemical_treatment_method (
    chemical_treatment_method_id integer NOT NULL,
    treatment_method_code character varying(3) NOT NULL,
    treatment_method_description character varying(30) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.chemical_treatment_method OWNER TO invasivebc;

--
-- Name: TABLE chemical_treatment_method; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.chemical_treatment_method IS 'The method used to apply the chemical to the treatment area.';


--
-- Name: COLUMN chemical_treatment_method.chemical_treatment_method_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment_method.chemical_treatment_method_id IS 'Auto generated primary key. This is auto incremental field';


--
-- Name: COLUMN chemical_treatment_method.treatment_method_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment_method.treatment_method_code IS 'The 3-letter code used to identify the treatment method';


--
-- Name: COLUMN chemical_treatment_method.treatment_method_description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment_method.treatment_method_description IS 'The name of the treatment method as it should be displayed to users';


--
-- Name: COLUMN chemical_treatment_method.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment_method.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN chemical_treatment_method.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment_method.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN chemical_treatment_method.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment_method.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN chemical_treatment_method.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.chemical_treatment_method.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: chemical_treatment_method_chemical_treatment_method_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.chemical_treatment_method_chemical_treatment_method_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.chemical_treatment_method_chemical_treatment_method_id_seq OWNER TO invasivebc;

--
-- Name: chemical_treatment_method_chemical_treatment_method_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.chemical_treatment_method_chemical_treatment_method_id_seq OWNED BY invasivesbc.chemical_treatment_method.chemical_treatment_method_id;


--
-- Name: country; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.country (
    country_code character varying(3) NOT NULL,
    description character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.country OWNER TO invasivebc;

--
-- Name: TABLE country; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.country IS 'Standard ISO-3166 code table for listed countries';


--
-- Name: COLUMN country.country_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.country.country_code IS 'ISO-3166 standard three character identifier for country name. Primary key of the table.';


--
-- Name: COLUMN country.description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.country.description IS 'Detail name of the country';


--
-- Name: COLUMN country.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.country.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN country.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.country.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN country.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.country.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN country.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.country.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: country_province; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.country_province (
    country_code character varying(3) NOT NULL,
    province_code character varying(2) NOT NULL,
    description character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.country_province OWNER TO invasivebc;

--
-- Name: TABLE country_province; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.country_province IS 'Standard ISO-3166 code table for listed countries and sub-divisions such as provinces, states, territories, etc.';


--
-- Name: COLUMN country_province.country_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.country_province.country_code IS 'ISO-3166 standard three character identifier for country name. Combines with province code generate primary key of the table';


--
-- Name: COLUMN country_province.province_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.country_province.province_code IS 'ISO-3166 standard two character sub-division identifier for provinces, states, and territories. Combines with country code to generate primary key of the table';


--
-- Name: COLUMN country_province.description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.country_province.description IS 'Descriptive name of the province, state, or territory';


--
-- Name: COLUMN country_province.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.country_province.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN country_province.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.country_province.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN country_province.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.country_province.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN country_province.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.country_province.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: efficacy_code; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.efficacy_code (
    efficacy_code_id integer NOT NULL,
    display_order integer,
    description character varying(15) NOT NULL,
    active_ind boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.efficacy_code OWNER TO invasivebc;

--
-- Name: TABLE efficacy_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.efficacy_code IS 'Code table used in monitoring records for efficacy ratings of treatments';


--
-- Name: COLUMN efficacy_code.efficacy_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.efficacy_code.efficacy_code_id IS 'Auto generated sequential primary key column.';


--
-- Name: COLUMN efficacy_code.display_order; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.efficacy_code.display_order IS 'Zero-indexed integer value indicating desired order of items in dropdown menu';


--
-- Name: COLUMN efficacy_code.description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.efficacy_code.description IS 'String indicating approximated treatment efficacy rating in percentage point ranges';


--
-- Name: COLUMN efficacy_code.active_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.efficacy_code.active_ind IS 'Indicator to check active status of code';


--
-- Name: COLUMN efficacy_code.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.efficacy_code.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN efficacy_code.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.efficacy_code.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN efficacy_code.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.efficacy_code.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN efficacy_code.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.efficacy_code.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: efficacy_code_efficacy_code_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.efficacy_code_efficacy_code_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.efficacy_code_efficacy_code_id_seq OWNER TO invasivebc;

--
-- Name: efficacy_code_efficacy_code_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.efficacy_code_efficacy_code_id_seq OWNED BY invasivesbc.efficacy_code.efficacy_code_id;


--
-- Name: herbicide; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.herbicide (
    herbicide_id integer NOT NULL,
    herbicide_code character varying(20) NOT NULL,
    composite_name character varying(100) NOT NULL,
    active_ingredient character varying(50),
    trade_name character varying(50),
    pmra_reg_num integer NOT NULL,
    formulation character varying(20),
    application_rate numeric(5,3),
    application_units character varying(10),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.herbicide OWNER TO invasivebc;

--
-- Name: TABLE herbicide; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.herbicide IS 'Table to store herbicide information';


--
-- Name: COLUMN herbicide.herbicide_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.herbicide.herbicide_id IS 'Auto generated sequential primary key column.';


--
-- Name: COLUMN herbicide.herbicide_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.herbicide.herbicide_code IS 'Code associated with herbicide. This code is used to uniquely identify with application domain';


--
-- Name: COLUMN herbicide.composite_name; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.herbicide.composite_name IS 'Name of herbicide to be displayed in herbicide dropdown menu';


--
-- Name: COLUMN herbicide.active_ingredient; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.herbicide.active_ingredient IS 'Active ingredient contained in herbicide';


--
-- Name: COLUMN herbicide.trade_name; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.herbicide.trade_name IS 'Trade name associated with herbicide';


--
-- Name: COLUMN herbicide.pmra_reg_num; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.herbicide.pmra_reg_num IS 'Pest Management Regulatory Agency registration number of herbicide';


--
-- Name: COLUMN herbicide.formulation; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.herbicide.formulation IS 'String value describing the nature of the herbicide';


--
-- Name: COLUMN herbicide.application_rate; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.herbicide.application_rate IS 'Manufacturer-recommended application rate of herbicide';


--
-- Name: COLUMN herbicide.application_units; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.herbicide.application_units IS 'Units used to describe application rate of herbicide';


--
-- Name: COLUMN herbicide.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.herbicide.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN herbicide.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.herbicide.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN herbicide.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.herbicide.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN herbicide.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.herbicide.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: herbicide_herbicide_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.herbicide_herbicide_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.herbicide_herbicide_id_seq OWNER TO invasivebc;

--
-- Name: herbicide_herbicide_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.herbicide_herbicide_id_seq OWNED BY invasivesbc.herbicide.herbicide_id;


--
-- Name: herbicide_tank_mix; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.herbicide_tank_mix (
    herbicide_tank_mix_id integer NOT NULL,
    application_rate numeric(6,3),
    dilution_rate numeric(6,3),
    herbicide_id integer,
    chemical_treatment_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.herbicide_tank_mix OWNER TO invasivebc;

--
-- Name: TABLE herbicide_tank_mix; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.herbicide_tank_mix IS 'Record of one herbicide included in the tank mix used for chemical treatment application. A tank mix includes one or more herbicides.';


--
-- Name: COLUMN herbicide_tank_mix.herbicide_tank_mix_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.herbicide_tank_mix.herbicide_tank_mix_id IS 'Auto generated primary key. This is auto incremental field';


--
-- Name: COLUMN herbicide_tank_mix.application_rate; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.herbicide_tank_mix.application_rate IS 'Application rate of herbicide to treatment area, in units of L/hectare';


--
-- Name: COLUMN herbicide_tank_mix.dilution_rate; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.herbicide_tank_mix.dilution_rate IS 'Dilution rate of herbicide, as percentage of concentrate to total volume';


--
-- Name: COLUMN herbicide_tank_mix.herbicide_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.herbicide_tank_mix.herbicide_id IS 'Foreign key reference to herbicide code table';


--
-- Name: COLUMN herbicide_tank_mix.chemical_treatment_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.herbicide_tank_mix.chemical_treatment_id IS 'Foreign key reference to chemical treatment table';


--
-- Name: COLUMN herbicide_tank_mix.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.herbicide_tank_mix.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN herbicide_tank_mix.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.herbicide_tank_mix.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN herbicide_tank_mix.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.herbicide_tank_mix.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN herbicide_tank_mix.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.herbicide_tank_mix.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: herbicide_tank_mix_herbicide_tank_mix_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.herbicide_tank_mix_herbicide_tank_mix_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.herbicide_tank_mix_herbicide_tank_mix_id_seq OWNER TO invasivebc;

--
-- Name: herbicide_tank_mix_herbicide_tank_mix_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.herbicide_tank_mix_herbicide_tank_mix_id_seq OWNED BY invasivesbc.herbicide_tank_mix.herbicide_tank_mix_id;


--
-- Name: high_risk_assessment; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.high_risk_assessment (
    high_risk_assessment_id integer NOT NULL,
    clean_drain_dry_after_inspection_ind boolean DEFAULT false NOT NULL,
    quarantine_period_issued_ind boolean DEFAULT false NOT NULL,
    standing_water_present_ind boolean DEFAULT false NOT NULL,
    adult_dreissenidae_mussel_found_ind boolean DEFAULT false NOT NULL,
    decontamination_performed_ind boolean DEFAULT false NOT NULL,
    decontamination_order_issued_ind boolean DEFAULT false NOT NULL,
    seal_issued_ind boolean DEFAULT false NOT NULL,
    watercraft_registration character varying(30),
    decontamination_reference character varying(100),
    decontamination_order_number integer,
    seal_number integer,
    other_inspection_findings character varying(100),
    general_comments character varying(300),
    standing_water_location_code_id integer,
    adult_mussels_location_code_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.high_risk_assessment OWNER TO invasivebc;

--
-- Name: TABLE high_risk_assessment; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.high_risk_assessment IS 'Table to store High Risk Assessment information of Mussel Watercraft inspection';


--
-- Name: COLUMN high_risk_assessment.high_risk_assessment_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.high_risk_assessment.high_risk_assessment_id IS 'Auto generated sequential primary key column.';


--
-- Name: COLUMN high_risk_assessment.clean_drain_dry_after_inspection_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.high_risk_assessment.clean_drain_dry_after_inspection_ind IS 'Indicator is to show, watercraft was cleaned, drained and dried after inspection';


--
-- Name: COLUMN high_risk_assessment.quarantine_period_issued_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.high_risk_assessment.quarantine_period_issued_ind IS 'Indicator is to show, watercraft was issued a quarantine period';


--
-- Name: COLUMN high_risk_assessment.standing_water_present_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.high_risk_assessment.standing_water_present_ind IS 'Indicator is to check any standing water present in watercraft during high risk assessment';


--
-- Name: COLUMN high_risk_assessment.adult_dreissenidae_mussel_found_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.high_risk_assessment.adult_dreissenidae_mussel_found_ind IS 'Status flag any adult Dreissenidae Mussel found during inspection';


--
-- Name: COLUMN high_risk_assessment.decontamination_performed_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.high_risk_assessment.decontamination_performed_ind IS 'Status flag to check decontamination performed or not';


--
-- Name: COLUMN high_risk_assessment.decontamination_order_issued_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.high_risk_assessment.decontamination_order_issued_ind IS 'Status flag to check decontamination order issued or not';


--
-- Name: COLUMN high_risk_assessment.seal_issued_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.high_risk_assessment.seal_issued_ind IS 'Status flag to check seal was issued or not';


--
-- Name: COLUMN high_risk_assessment.watercraft_registration; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.high_risk_assessment.watercraft_registration IS 'Watercraft Registration number';


--
-- Name: COLUMN high_risk_assessment.decontamination_reference; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.high_risk_assessment.decontamination_reference IS 'Decontamination reference number';


--
-- Name: COLUMN high_risk_assessment.decontamination_order_number; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.high_risk_assessment.decontamination_order_number IS 'Decontamination order number';


--
-- Name: COLUMN high_risk_assessment.seal_number; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.high_risk_assessment.seal_number IS 'Seal number';


--
-- Name: COLUMN high_risk_assessment.other_inspection_findings; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.high_risk_assessment.other_inspection_findings IS 'Additional details about high risk assessment';


--
-- Name: COLUMN high_risk_assessment.general_comments; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.high_risk_assessment.general_comments IS 'General Comments regarding high risk assessment';


--
-- Name: COLUMN high_risk_assessment.standing_water_location_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.high_risk_assessment.standing_water_location_code_id IS 'Foreign key reference to code table (named adult_mussels_location_code) of possible locations on watercraft where standing water or adult mussels may be found. This field is specifically for locations of standing water';


--
-- Name: COLUMN high_risk_assessment.adult_mussels_location_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.high_risk_assessment.adult_mussels_location_code_id IS 'Foreign key reference to code table (named adult_mussels_location_code) of possible locations on watercraft where standing water or adult mussels may be found. This field is specifically for locations where adult mussels were found on the watercraft';


--
-- Name: COLUMN high_risk_assessment.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.high_risk_assessment.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN high_risk_assessment.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.high_risk_assessment.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN high_risk_assessment.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.high_risk_assessment.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN high_risk_assessment.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.high_risk_assessment.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: high_risk_assessment_high_risk_assessment_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.high_risk_assessment_high_risk_assessment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.high_risk_assessment_high_risk_assessment_id_seq OWNER TO invasivebc;

--
-- Name: high_risk_assessment_high_risk_assessment_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.high_risk_assessment_high_risk_assessment_id_seq OWNED BY invasivesbc.high_risk_assessment.high_risk_assessment_id;


--
-- Name: jurisdiction_code; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.jurisdiction_code (
    jurisdiction_code_id integer NOT NULL,
    jurisdiction_code character varying(10) NOT NULL,
    description character varying(100),
    active_ind boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.jurisdiction_code OWNER TO invasivebc;

--
-- Name: TABLE jurisdiction_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.jurisdiction_code IS 'Jurisdiction code of observation area';


--
-- Name: COLUMN jurisdiction_code.jurisdiction_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.jurisdiction_code.jurisdiction_code_id IS 'Auto generated primary key';


--
-- Name: COLUMN jurisdiction_code.jurisdiction_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.jurisdiction_code.jurisdiction_code IS 'Unique code value for jurisdiction area';


--
-- Name: COLUMN jurisdiction_code.description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.jurisdiction_code.description IS 'Description of code';


--
-- Name: COLUMN jurisdiction_code.active_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.jurisdiction_code.active_ind IS 'Indicator to check active status of code';


--
-- Name: COLUMN jurisdiction_code.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.jurisdiction_code.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN jurisdiction_code.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.jurisdiction_code.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN jurisdiction_code.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.jurisdiction_code.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN jurisdiction_code.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.jurisdiction_code.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: jurisdiction_code_jurisdiction_code_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.jurisdiction_code_jurisdiction_code_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.jurisdiction_code_jurisdiction_code_id_seq OWNER TO invasivebc;

--
-- Name: jurisdiction_code_jurisdiction_code_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.jurisdiction_code_jurisdiction_code_id_seq OWNED BY invasivesbc.jurisdiction_code.jurisdiction_code_id;


--
-- Name: life_stage_code; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.life_stage_code (
    life_stage_code_id integer NOT NULL,
    life_stage_code character varying(10) NOT NULL,
    description character varying(100),
    active_ind boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.life_stage_code OWNER TO invasivebc;

--
-- Name: TABLE life_stage_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.life_stage_code IS 'This is a list of all the different life stages for a species';


--
-- Name: COLUMN life_stage_code.life_stage_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.life_stage_code.life_stage_code_id IS 'Auto generated primary key';


--
-- Name: COLUMN life_stage_code.life_stage_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.life_stage_code.life_stage_code IS 'Code value for the life stages';


--
-- Name: COLUMN life_stage_code.description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.life_stage_code.description IS 'Description of code';


--
-- Name: COLUMN life_stage_code.active_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.life_stage_code.active_ind IS 'Indicator to check active status of code';


--
-- Name: COLUMN life_stage_code.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.life_stage_code.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN life_stage_code.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.life_stage_code.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN life_stage_code.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.life_stage_code.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN life_stage_code.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.life_stage_code.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: life_stage_code_life_stage_code_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.life_stage_code_life_stage_code_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.life_stage_code_life_stage_code_id_seq OWNER TO invasivebc;

--
-- Name: life_stage_code_life_stage_code_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.life_stage_code_life_stage_code_id_seq OWNED BY invasivesbc.life_stage_code.life_stage_code_id;


--
-- Name: mechanical_disposal_method_code; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.mechanical_disposal_method_code (
    mechanical_disposal_method_code_id integer NOT NULL,
    mechanical_disposal_method_code character varying(6) NOT NULL,
    description character varying(100),
    active_ind boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.mechanical_disposal_method_code OWNER TO invasivebc;

--
-- Name: TABLE mechanical_disposal_method_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.mechanical_disposal_method_code IS 'Mechanical treatment disposal methods code. Indicate disposal method of species treated in mechanical treatment';


--
-- Name: COLUMN mechanical_disposal_method_code.mechanical_disposal_method_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_disposal_method_code.mechanical_disposal_method_code_id IS 'Auto generated primary key';


--
-- Name: COLUMN mechanical_disposal_method_code.mechanical_disposal_method_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_disposal_method_code.mechanical_disposal_method_code IS 'String encoded enum values for Mechanical disposal methods.';


--
-- Name: COLUMN mechanical_disposal_method_code.description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_disposal_method_code.description IS 'Description of code';


--
-- Name: COLUMN mechanical_disposal_method_code.active_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_disposal_method_code.active_ind IS 'Indicator to check active status of code';


--
-- Name: COLUMN mechanical_disposal_method_code.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_disposal_method_code.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN mechanical_disposal_method_code.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_disposal_method_code.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN mechanical_disposal_method_code.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_disposal_method_code.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN mechanical_disposal_method_code.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_disposal_method_code.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: mechanical_disposal_method_co_mechanical_disposal_method_co_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.mechanical_disposal_method_co_mechanical_disposal_method_co_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.mechanical_disposal_method_co_mechanical_disposal_method_co_seq OWNER TO invasivebc;

--
-- Name: mechanical_disposal_method_co_mechanical_disposal_method_co_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.mechanical_disposal_method_co_mechanical_disposal_method_co_seq OWNED BY invasivesbc.mechanical_disposal_method_code.mechanical_disposal_method_code_id;


--
-- Name: mechanical_method_code; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.mechanical_method_code (
    mechanical_method_code_id integer NOT NULL,
    mechanical_method_code character varying(4) NOT NULL,
    description character varying(100),
    active_ind boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.mechanical_method_code OWNER TO invasivebc;

--
-- Name: TABLE mechanical_method_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.mechanical_method_code IS 'Indicates the method of mechanical or cultural control. Examples: mulching, burning, mowing. IAPP methods: Controlled Burning, Cultivation or till, Dead-heading, Digging, Flaming / Tiger Torch burn, Hand pulling, Hot water / Steam, Mowing Mulching, Suction dredging, Sheet Mulching , Salt water / Vinegar, Targeted grazing, Tarping , Seeding, Planting';


--
-- Name: COLUMN mechanical_method_code.mechanical_method_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_method_code.mechanical_method_code_id IS 'Auto generated primary key';


--
-- Name: COLUMN mechanical_method_code.mechanical_method_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_method_code.mechanical_method_code IS 'String encoded enum values for Mechanical treatment methods.';


--
-- Name: COLUMN mechanical_method_code.description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_method_code.description IS 'Description of code';


--
-- Name: COLUMN mechanical_method_code.active_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_method_code.active_ind IS 'Indicator to check active status of code';


--
-- Name: COLUMN mechanical_method_code.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_method_code.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN mechanical_method_code.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_method_code.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN mechanical_method_code.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_method_code.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN mechanical_method_code.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_method_code.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: mechanical_method_code_mechanical_method_code_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.mechanical_method_code_mechanical_method_code_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.mechanical_method_code_mechanical_method_code_id_seq OWNER TO invasivebc;

--
-- Name: mechanical_method_code_mechanical_method_code_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.mechanical_method_code_mechanical_method_code_id_seq OWNED BY invasivesbc.mechanical_method_code.mechanical_method_code_id;


--
-- Name: mechanical_monitor; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.mechanical_monitor (
    mechanical_monitor_id integer NOT NULL,
    observer_first_name character varying(100),
    observer_last_name character varying(100),
    mechanical_monitor_timestamp timestamp without time zone NOT NULL,
    mechanical_monitor_paper_file_ref character varying(100),
    comments character varying(500),
    species_agency_code_id integer,
    mechanical_treatment_id integer,
    efficacy_code_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.mechanical_monitor OWNER TO invasivebc;

--
-- Name: TABLE mechanical_monitor; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.mechanical_monitor IS 'A monitoring record created as follow-up to a mechanical treatment';


--
-- Name: COLUMN mechanical_monitor.mechanical_monitor_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_monitor.mechanical_monitor_id IS 'Auto generated primary key. This is auto incremental field';


--
-- Name: COLUMN mechanical_monitor.observer_first_name; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_monitor.observer_first_name IS 'First name of the observer of the mechanical monitoring record';


--
-- Name: COLUMN mechanical_monitor.observer_last_name; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_monitor.observer_last_name IS 'Last name of the observer of the mechanical monitoring record';


--
-- Name: COLUMN mechanical_monitor.mechanical_monitor_timestamp; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_monitor.mechanical_monitor_timestamp IS 'Date and time of the monitoring record';


--
-- Name: COLUMN mechanical_monitor.mechanical_monitor_paper_file_ref; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_monitor.mechanical_monitor_paper_file_ref IS 'Paper file reference associated with monitoring record';


--
-- Name: COLUMN mechanical_monitor.comments; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_monitor.comments IS 'Free-form comments added by mechanical monitoring observer';


--
-- Name: COLUMN mechanical_monitor.species_agency_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_monitor.species_agency_code_id IS 'Foreign key reference to Species Agency code table';


--
-- Name: COLUMN mechanical_monitor.mechanical_treatment_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_monitor.mechanical_treatment_id IS 'Foreign key reference to Mechanical Treatments table';


--
-- Name: COLUMN mechanical_monitor.efficacy_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_monitor.efficacy_code_id IS 'Foreign key reference to Efficacy code table';


--
-- Name: COLUMN mechanical_monitor.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_monitor.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN mechanical_monitor.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_monitor.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN mechanical_monitor.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_monitor.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN mechanical_monitor.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_monitor.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: mechanical_monitor_mechanical_monitor_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.mechanical_monitor_mechanical_monitor_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.mechanical_monitor_mechanical_monitor_id_seq OWNER TO invasivebc;

--
-- Name: mechanical_monitor_mechanical_monitor_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.mechanical_monitor_mechanical_monitor_id_seq OWNED BY invasivesbc.mechanical_monitor.mechanical_monitor_id;


--
-- Name: mechanical_root_removal_code; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.mechanical_root_removal_code (
    mechanical_root_removal_code_id integer NOT NULL,
    mechanical_root_removal_code character varying(6) NOT NULL,
    description character varying(100),
    active_ind boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.mechanical_root_removal_code OWNER TO invasivebc;

--
-- Name: TABLE mechanical_root_removal_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.mechanical_root_removal_code IS 'This table is collection of mechanical root removal code for mechanical treatment';


--
-- Name: COLUMN mechanical_root_removal_code.mechanical_root_removal_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_root_removal_code.mechanical_root_removal_code_id IS 'Auto generated primary key';


--
-- Name: COLUMN mechanical_root_removal_code.mechanical_root_removal_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_root_removal_code.mechanical_root_removal_code IS 'String encoded enum values for Mechanical root system codes.';


--
-- Name: COLUMN mechanical_root_removal_code.description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_root_removal_code.description IS 'Description of code';


--
-- Name: COLUMN mechanical_root_removal_code.active_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_root_removal_code.active_ind IS 'Indicator to check active status of code';


--
-- Name: COLUMN mechanical_root_removal_code.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_root_removal_code.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN mechanical_root_removal_code.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_root_removal_code.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN mechanical_root_removal_code.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_root_removal_code.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN mechanical_root_removal_code.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_root_removal_code.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: mechanical_root_removal_code_mechanical_root_removal_code_i_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.mechanical_root_removal_code_mechanical_root_removal_code_i_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.mechanical_root_removal_code_mechanical_root_removal_code_i_seq OWNER TO invasivebc;

--
-- Name: mechanical_root_removal_code_mechanical_root_removal_code_i_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.mechanical_root_removal_code_mechanical_root_removal_code_i_seq OWNED BY invasivesbc.mechanical_root_removal_code.mechanical_root_removal_code_id;


--
-- Name: mechanical_soil_disturbance_code; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.mechanical_soil_disturbance_code (
    mechanical_soil_disturbance_code_id integer NOT NULL,
    mechanical_soil_disturbance_code character varying(6) NOT NULL,
    description character varying(100),
    active_ind boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.mechanical_soil_disturbance_code OWNER TO invasivebc;

--
-- Name: TABLE mechanical_soil_disturbance_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.mechanical_soil_disturbance_code IS 'This table is collection of soil disturbance code for mechanical treatment';


--
-- Name: COLUMN mechanical_soil_disturbance_code.mechanical_soil_disturbance_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_soil_disturbance_code.mechanical_soil_disturbance_code_id IS 'Auto generated primary key';


--
-- Name: COLUMN mechanical_soil_disturbance_code.mechanical_soil_disturbance_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_soil_disturbance_code.mechanical_soil_disturbance_code IS 'String encoded enum values for Mechanical Soil disturbance codes.';


--
-- Name: COLUMN mechanical_soil_disturbance_code.description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_soil_disturbance_code.description IS 'Description of code';


--
-- Name: COLUMN mechanical_soil_disturbance_code.active_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_soil_disturbance_code.active_ind IS 'Indicator to check active status of code';


--
-- Name: COLUMN mechanical_soil_disturbance_code.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_soil_disturbance_code.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN mechanical_soil_disturbance_code.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_soil_disturbance_code.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN mechanical_soil_disturbance_code.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_soil_disturbance_code.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN mechanical_soil_disturbance_code.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_soil_disturbance_code.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: mechanical_soil_disturbance_c_mechanical_soil_disturbance_c_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.mechanical_soil_disturbance_c_mechanical_soil_disturbance_c_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.mechanical_soil_disturbance_c_mechanical_soil_disturbance_c_seq OWNER TO invasivebc;

--
-- Name: mechanical_soil_disturbance_c_mechanical_soil_disturbance_c_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.mechanical_soil_disturbance_c_mechanical_soil_disturbance_c_seq OWNED BY invasivesbc.mechanical_soil_disturbance_code.mechanical_soil_disturbance_code_id;


--
-- Name: mechanical_treatment; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.mechanical_treatment (
    mechanical_treatment_id integer NOT NULL,
    applicator_first_name character varying(100),
    applicator_last_name character varying(100),
    secondary_applicator_first_name character varying(100),
    secondary_applicator_last_name character varying(100),
    mechanical_treatment_date date NOT NULL,
    mechanical_treatment_paper_file_ref character varying(100),
    mechanical_treatment_comment character varying(500),
    signage_on_site_ind boolean DEFAULT false NOT NULL,
    species_agency_code_id integer,
    mechanical_method_code_id integer,
    mechanical_disposal_method_code_id integer,
    mechanical_soil_disturbance_code_id integer,
    mechanical_root_removal_code_id integer,
    mechanical_treatment_issue_code_id integer,
    treatment_provider_contractor_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer,
    space_geom_id integer
);


ALTER TABLE invasivesbc.mechanical_treatment OWNER TO invasivebc;

--
-- Name: TABLE mechanical_treatment; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.mechanical_treatment IS 'An application of a mechanical or cultural control. Mechanical weed control employs various implements and techniques to physically disturb weeds or to interrupt their reproduction by depleting root reserves through repeated defoliation of the plant. Mechanical control includes the mowing, ploughing, chopping, and crushing of weeds. Cultural control includes selective grazing, irrigation and deliberate flooding, mulching, hand pulling, and burning. Strategies and timing should depend on the weed species and its location in the province.';


--
-- Name: COLUMN mechanical_treatment.mechanical_treatment_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment.mechanical_treatment_id IS 'Auto generated primary key';


--
-- Name: COLUMN mechanical_treatment.applicator_first_name; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment.applicator_first_name IS 'First name of the applicator';


--
-- Name: COLUMN mechanical_treatment.applicator_last_name; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment.applicator_last_name IS 'Last name of the applicator';


--
-- Name: COLUMN mechanical_treatment.secondary_applicator_first_name; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment.secondary_applicator_first_name IS 'First name of the secondary applicator';


--
-- Name: COLUMN mechanical_treatment.secondary_applicator_last_name; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment.secondary_applicator_last_name IS 'Last name of the secondary applicator';


--
-- Name: COLUMN mechanical_treatment.mechanical_treatment_date; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment.mechanical_treatment_date IS 'Date of the treatment';


--
-- Name: COLUMN mechanical_treatment.mechanical_treatment_paper_file_ref; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment.mechanical_treatment_paper_file_ref IS 'Paper file reference associated with treatment';


--
-- Name: COLUMN mechanical_treatment.mechanical_treatment_comment; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment.mechanical_treatment_comment IS 'Comment on treatment record';


--
-- Name: COLUMN mechanical_treatment.signage_on_site_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment.signage_on_site_ind IS 'Sign collected for on site indicator';


--
-- Name: COLUMN mechanical_treatment.species_agency_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment.species_agency_code_id IS 'Foreign key reference to Species Agency Code table';


--
-- Name: COLUMN mechanical_treatment.mechanical_method_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment.mechanical_method_code_id IS 'Foreign key reference to Mechanical Method Code table';


--
-- Name: COLUMN mechanical_treatment.mechanical_disposal_method_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment.mechanical_disposal_method_code_id IS 'Foreign key reference to Mechanical Disposal Method Code table';


--
-- Name: COLUMN mechanical_treatment.mechanical_soil_disturbance_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment.mechanical_soil_disturbance_code_id IS 'Foreign key reference to Mechanical Soil Disturbance code';


--
-- Name: COLUMN mechanical_treatment.mechanical_root_removal_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment.mechanical_root_removal_code_id IS 'Foreign key reference to Mechanical Root Removal Code table';


--
-- Name: COLUMN mechanical_treatment.mechanical_treatment_issue_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment.mechanical_treatment_issue_code_id IS 'Foreign key reference to Mechanical Treatment Issue Code table';


--
-- Name: COLUMN mechanical_treatment.treatment_provider_contractor_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment.treatment_provider_contractor_id IS 'Foreign key reference to Mechanical Treatment Provider Contractor table';


--
-- Name: COLUMN mechanical_treatment.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN mechanical_treatment.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN mechanical_treatment.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN mechanical_treatment.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: COLUMN mechanical_treatment.space_geom_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment.space_geom_id IS 'Spatial and Geometry reference data associated with record. Foreign key reference to space_geom table';


--
-- Name: mechanical_treatment_issue_code; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.mechanical_treatment_issue_code (
    mechanical_treatment_issue_code_id integer NOT NULL,
    mechanical_treatment_issue_code character varying(6) NOT NULL,
    description character varying(100),
    active_ind boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.mechanical_treatment_issue_code OWNER TO invasivebc;

--
-- Name: TABLE mechanical_treatment_issue_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.mechanical_treatment_issue_code IS 'This table is collection of code related to mechanical treatments';


--
-- Name: COLUMN mechanical_treatment_issue_code.mechanical_treatment_issue_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment_issue_code.mechanical_treatment_issue_code_id IS 'Auto generated primary key';


--
-- Name: COLUMN mechanical_treatment_issue_code.mechanical_treatment_issue_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment_issue_code.mechanical_treatment_issue_code IS 'String encoded enum values for issue code related to mechanical treatments.';


--
-- Name: COLUMN mechanical_treatment_issue_code.description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment_issue_code.description IS 'Description of code';


--
-- Name: COLUMN mechanical_treatment_issue_code.active_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment_issue_code.active_ind IS 'Indicator to check active status of code';


--
-- Name: COLUMN mechanical_treatment_issue_code.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment_issue_code.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN mechanical_treatment_issue_code.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment_issue_code.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN mechanical_treatment_issue_code.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment_issue_code.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN mechanical_treatment_issue_code.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment_issue_code.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: mechanical_treatment_issue_co_mechanical_treatment_issue_co_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.mechanical_treatment_issue_co_mechanical_treatment_issue_co_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.mechanical_treatment_issue_co_mechanical_treatment_issue_co_seq OWNER TO invasivebc;

--
-- Name: mechanical_treatment_issue_co_mechanical_treatment_issue_co_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.mechanical_treatment_issue_co_mechanical_treatment_issue_co_seq OWNED BY invasivesbc.mechanical_treatment_issue_code.mechanical_treatment_issue_code_id;


--
-- Name: mechanical_treatment_mechanical_treatment_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.mechanical_treatment_mechanical_treatment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.mechanical_treatment_mechanical_treatment_id_seq OWNER TO invasivebc;

--
-- Name: mechanical_treatment_mechanical_treatment_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.mechanical_treatment_mechanical_treatment_id_seq OWNED BY invasivesbc.mechanical_treatment.mechanical_treatment_id;


--
-- Name: mechanical_treatment_observation; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.mechanical_treatment_observation (
    mechanical_treatment_observation_id integer NOT NULL,
    observation_id integer NOT NULL,
    mechanical_treatment_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE invasivesbc.mechanical_treatment_observation OWNER TO invasivebc;

--
-- Name: TABLE mechanical_treatment_observation; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.mechanical_treatment_observation IS 'Joining table for mechanical treatment and observation';


--
-- Name: COLUMN mechanical_treatment_observation.mechanical_treatment_observation_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment_observation.mechanical_treatment_observation_id IS 'Auto generated sequential primary key column.';


--
-- Name: COLUMN mechanical_treatment_observation.observation_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment_observation.observation_id IS 'Foreign key reference to observation table';


--
-- Name: COLUMN mechanical_treatment_observation.mechanical_treatment_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment_observation.mechanical_treatment_id IS 'Foreign key reference to mechanical treatment table';


--
-- Name: COLUMN mechanical_treatment_observation.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment_observation.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN mechanical_treatment_observation.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.mechanical_treatment_observation.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: mechanical_treatment_observat_mechanical_treatment_observat_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.mechanical_treatment_observat_mechanical_treatment_observat_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.mechanical_treatment_observat_mechanical_treatment_observat_seq OWNER TO invasivebc;

--
-- Name: mechanical_treatment_observat_mechanical_treatment_observat_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.mechanical_treatment_observat_mechanical_treatment_observat_seq OWNED BY invasivesbc.mechanical_treatment_observation.mechanical_treatment_observation_id;


--
-- Name: observation; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.observation (
    observation_id integer NOT NULL,
    observation_date date,
    access_description character varying(500),
    observer_first_name character varying(100),
    observer_last_name character varying(100),
    sample_identifier character varying(50),
    range_unit_number character varying(50),
    general_comment character varying(500),
    legacy_site_ind boolean DEFAULT false NOT NULL,
    early_detection_rapid_resp_ind boolean DEFAULT false NOT NULL,
    research_detection_ind boolean DEFAULT false NOT NULL,
    sample_taken_ind boolean DEFAULT false NOT NULL,
    well_ind boolean DEFAULT false NOT NULL,
    special_care_ind boolean DEFAULT false NOT NULL,
    biological_ind boolean DEFAULT false NOT NULL,
    aquatic_ind boolean DEFAULT false NOT NULL,
    species_id integer,
    jurisdiction_code_id integer,
    species_density_code_id integer,
    species_distribution_code_id integer,
    observation_type_code_id integer,
    species_agency_code_id integer,
    soil_texture_code_id integer,
    specific_use_code_id integer,
    observation_slope_code_id integer,
    observation_aspect_code_id integer,
    observation_proposed_action_code_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer,
    space_geom_id integer
);


ALTER TABLE invasivesbc.observation OWNER TO invasivebc;

--
-- Name: TABLE observation; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.observation IS 'An observation describing the nature and extent of the species on the landscape. It may be collected by 1) an individual (a scientist or citizen) at the location, 2) a digital tracking device (airborne or ground based), or 3) an inferred analysis based on surrounding data.  An observation location provides an historical record of all surveys done regarding a particular species of invasive plant on the site. Provides a chronological recording of the change in distribution and density of invasive plants on the site. An area with confirmed ground sightings of invasive alien plants. This may be terrestrial (invasive plants on the ground) or aquatic (invasive plants in lakes, streams or other water-bodies). Within this inventory area, all roads accessible by a four-wheel drive vehicle that cross potential habitat will be checked for occurrences of invasive plants. Plants on both sides of the road will be identified as far as can be seen from the road, or as defined for specific inventory projects. In addition, all major disturbances including but not limited to landings, log sort yards, burned areas, gravel pits, air strips, landfills, parking lots, construction or maintenance sites and recreational sites and trails within the potential habitat will be checked.';


--
-- Name: COLUMN observation.observation_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.observation_id IS 'Auto generated primary key';


--
-- Name: COLUMN observation.observation_date; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.observation_date IS 'The Observation Date is the date that the invasive species occurrence was observed by the submitter.';


--
-- Name: COLUMN observation.access_description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.access_description IS 'Note to specify how to access the location';


--
-- Name: COLUMN observation.observer_first_name; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.observer_first_name IS 'First name of the observer of the observation';


--
-- Name: COLUMN observation.observer_last_name; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.observer_last_name IS 'Last name of the observer of the observation';


--
-- Name: COLUMN observation.sample_identifier; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.sample_identifier IS 'Identifier for sample taken.';


--
-- Name: COLUMN observation.range_unit_number; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.range_unit_number IS 'Identifier/Number of range unit associated with observation.';


--
-- Name: COLUMN observation.general_comment; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.general_comment IS 'General comment associated with observation';


--
-- Name: COLUMN observation.legacy_site_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.legacy_site_ind IS 'This indicator used to indicate the observation site is legacy site or not.';


--
-- Name: COLUMN observation.early_detection_rapid_resp_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.early_detection_rapid_resp_ind IS 'Indicator for early detection and rapid response for observed species.';


--
-- Name: COLUMN observation.research_detection_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.research_detection_ind IS 'Values of this column indicates this observation is research purpose or not.';


--
-- Name: COLUMN observation.sample_taken_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.sample_taken_ind IS 'This field specify any sample is taken from observed area, if this indicator is true, observer must specify sample id.';


--
-- Name: COLUMN observation.well_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.well_ind IS 'This field indicates well proximity of the observed location. If this indicator is true, observer should specify well proximity values and API will connect to GWELL service to fetch more information';


--
-- Name: COLUMN observation.special_care_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.special_care_ind IS 'This field indicates, the requirement of special care.';


--
-- Name: COLUMN observation.biological_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.biological_ind IS 'This field indicates, observation is biological or not.';


--
-- Name: COLUMN observation.aquatic_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.aquatic_ind IS 'This field indicates, observation is for aquatic element or not.';


--
-- Name: COLUMN observation.species_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.species_id IS 'Foreign key reference to species table';


--
-- Name: COLUMN observation.jurisdiction_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.jurisdiction_code_id IS 'Foreign key reference to Jurisdiction code table';


--
-- Name: COLUMN observation.species_density_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.species_density_code_id IS 'Foreign key reference to species density code table';


--
-- Name: COLUMN observation.species_distribution_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.species_distribution_code_id IS 'Foreign key reference to observation table';


--
-- Name: COLUMN observation.observation_type_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.observation_type_code_id IS 'Foreign key reference to observation type code table';


--
-- Name: COLUMN observation.species_agency_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.species_agency_code_id IS 'Foreign key reference to Species Agency code table';


--
-- Name: COLUMN observation.soil_texture_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.soil_texture_code_id IS 'Foreign key reference to Soil Texture code table';


--
-- Name: COLUMN observation.specific_use_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.specific_use_code_id IS 'Foreign key reference to Specific use code table';


--
-- Name: COLUMN observation.observation_slope_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.observation_slope_code_id IS 'Foreign key reference to observation slope code table';


--
-- Name: COLUMN observation.observation_aspect_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.observation_aspect_code_id IS 'Foreign key reference to observation directional aspect code table';


--
-- Name: COLUMN observation.observation_proposed_action_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.observation_proposed_action_code_id IS 'Foreign key reference to observation proposed action codes';


--
-- Name: COLUMN observation.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN observation.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN observation.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN observation.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: COLUMN observation.space_geom_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation.space_geom_id IS 'Spatial and Geometry reference data associated with record. Foreign key reference to space_geom table';


--
-- Name: observation_aspect_code; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.observation_aspect_code (
    observation_aspect_code_id integer NOT NULL,
    observation_aspect_code character varying(3) NOT NULL,
    description character varying(100),
    active_ind boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.observation_aspect_code OWNER TO invasivebc;

--
-- Name: TABLE observation_aspect_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.observation_aspect_code IS 'Observation area aspect code. Aspect code provides integer enum encoded values for directional aspect of the observed species. The typical values like North facing or south facing';


--
-- Name: COLUMN observation_aspect_code.observation_aspect_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_aspect_code.observation_aspect_code_id IS 'Auto generated primary key';


--
-- Name: COLUMN observation_aspect_code.observation_aspect_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_aspect_code.observation_aspect_code IS 'String encoded enum values for observation aspect code';


--
-- Name: COLUMN observation_aspect_code.description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_aspect_code.description IS 'Description of code';


--
-- Name: COLUMN observation_aspect_code.active_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_aspect_code.active_ind IS 'Indicator to check active status of code';


--
-- Name: COLUMN observation_aspect_code.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_aspect_code.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN observation_aspect_code.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_aspect_code.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN observation_aspect_code.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_aspect_code.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN observation_aspect_code.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_aspect_code.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: observation_aspect_code_observation_aspect_code_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.observation_aspect_code_observation_aspect_code_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.observation_aspect_code_observation_aspect_code_id_seq OWNER TO invasivebc;

--
-- Name: observation_aspect_code_observation_aspect_code_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.observation_aspect_code_observation_aspect_code_id_seq OWNED BY invasivesbc.observation_aspect_code.observation_aspect_code_id;


--
-- Name: observation_chemical_treatment; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.observation_chemical_treatment (
    observation_chemical_treatment_id integer NOT NULL,
    species_treatment_area_coverage numeric(4,1),
    observation_id integer,
    chemical_treatment_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.observation_chemical_treatment OWNER TO invasivebc;

--
-- Name: TABLE observation_chemical_treatment; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.observation_chemical_treatment IS 'A record of one targeted species within the treatment area';


--
-- Name: COLUMN observation_chemical_treatment.observation_chemical_treatment_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_chemical_treatment.observation_chemical_treatment_id IS 'Auto generated primary key. This is auto incremental field';


--
-- Name: COLUMN observation_chemical_treatment.species_treatment_area_coverage; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_chemical_treatment.species_treatment_area_coverage IS 'Percentage of treatment area covered by selected species';


--
-- Name: COLUMN observation_chemical_treatment.observation_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_chemical_treatment.observation_id IS 'Foreign key reference to observation ID that records the species being treated';


--
-- Name: COLUMN observation_chemical_treatment.chemical_treatment_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_chemical_treatment.chemical_treatment_id IS 'Foreign key reference to parent chemical treatment table';


--
-- Name: COLUMN observation_chemical_treatment.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_chemical_treatment.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN observation_chemical_treatment.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_chemical_treatment.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN observation_chemical_treatment.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_chemical_treatment.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN observation_chemical_treatment.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_chemical_treatment.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: observation_chemical_treatmen_observation_chemical_treatmen_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.observation_chemical_treatmen_observation_chemical_treatmen_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.observation_chemical_treatmen_observation_chemical_treatmen_seq OWNER TO invasivebc;

--
-- Name: observation_chemical_treatmen_observation_chemical_treatmen_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.observation_chemical_treatmen_observation_chemical_treatmen_seq OWNED BY invasivesbc.observation_chemical_treatment.observation_chemical_treatment_id;


--
-- Name: observation_geometry_code; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.observation_geometry_code (
    observation_geometry_code_id integer NOT NULL,
    observation_geometry_code character varying(2) NOT NULL,
    description character varying(100),
    active_ind boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.observation_geometry_code OWNER TO invasivebc;

--
-- Name: TABLE observation_geometry_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.observation_geometry_code IS 'A 2 or 3 dimensional geometry used to describe the spatial extent of an observation: Point, linear corridor, transect, circle, rectangular plot, stratified grid, radio tract, GPS tract, water body outline.';


--
-- Name: COLUMN observation_geometry_code.observation_geometry_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_geometry_code.observation_geometry_code_id IS 'Auto generated primary key';


--
-- Name: COLUMN observation_geometry_code.observation_geometry_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_geometry_code.observation_geometry_code IS 'Observation geometry code of the system';


--
-- Name: COLUMN observation_geometry_code.description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_geometry_code.description IS 'Description of code';


--
-- Name: COLUMN observation_geometry_code.active_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_geometry_code.active_ind IS 'Indicator to check active status of code';


--
-- Name: COLUMN observation_geometry_code.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_geometry_code.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN observation_geometry_code.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_geometry_code.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN observation_geometry_code.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_geometry_code.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN observation_geometry_code.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_geometry_code.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: observation_geometry_code_observation_geometry_code_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.observation_geometry_code_observation_geometry_code_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.observation_geometry_code_observation_geometry_code_id_seq OWNER TO invasivebc;

--
-- Name: observation_geometry_code_observation_geometry_code_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.observation_geometry_code_observation_geometry_code_id_seq OWNED BY invasivesbc.observation_geometry_code.observation_geometry_code_id;


--
-- Name: observation_observation_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.observation_observation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.observation_observation_id_seq OWNER TO invasivebc;

--
-- Name: observation_observation_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.observation_observation_id_seq OWNED BY invasivesbc.observation.observation_id;


--
-- Name: observation_proposed_action_code; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.observation_proposed_action_code (
    observation_proposed_action_code_id integer NOT NULL,
    observation_proposed_action_code character varying(4) NOT NULL,
    description character varying(100),
    active_ind boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.observation_proposed_action_code OWNER TO invasivebc;

--
-- Name: TABLE observation_proposed_action_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.observation_proposed_action_code IS 'The is list of proposed action item of observation like Treatment or Monitoring. So code values like CT for Chemical treatment or CM for Chemical monitoring';


--
-- Name: COLUMN observation_proposed_action_code.observation_proposed_action_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_proposed_action_code.observation_proposed_action_code_id IS 'Auto generated primary key';


--
-- Name: COLUMN observation_proposed_action_code.observation_proposed_action_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_proposed_action_code.observation_proposed_action_code IS 'String encoded enum values for proposed action items.';


--
-- Name: COLUMN observation_proposed_action_code.description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_proposed_action_code.description IS 'Description of code';


--
-- Name: COLUMN observation_proposed_action_code.active_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_proposed_action_code.active_ind IS 'Indicator to check active status of code';


--
-- Name: COLUMN observation_proposed_action_code.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_proposed_action_code.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN observation_proposed_action_code.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_proposed_action_code.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN observation_proposed_action_code.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_proposed_action_code.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN observation_proposed_action_code.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_proposed_action_code.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: observation_proposed_action_c_observation_proposed_action_c_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.observation_proposed_action_c_observation_proposed_action_c_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.observation_proposed_action_c_observation_proposed_action_c_seq OWNER TO invasivebc;

--
-- Name: observation_proposed_action_c_observation_proposed_action_c_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.observation_proposed_action_c_observation_proposed_action_c_seq OWNED BY invasivesbc.observation_proposed_action_code.observation_proposed_action_code_id;


--
-- Name: observation_slope_code; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.observation_slope_code (
    observation_slope_code_id integer NOT NULL,
    observation_slope_code character varying(5) NOT NULL,
    description character varying(100),
    active_ind boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.observation_slope_code OWNER TO invasivebc;

--
-- Name: TABLE observation_slope_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.observation_slope_code IS 'Observation area slope code. Slope code is encoded value of description . NA specified data not available and FL means flat with 0%, similarly VSTS specified very steep slop with more than 45%';


--
-- Name: COLUMN observation_slope_code.observation_slope_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_slope_code.observation_slope_code_id IS 'Auto generated primary key';


--
-- Name: COLUMN observation_slope_code.observation_slope_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_slope_code.observation_slope_code IS 'Integer encoded enum values for slope code';


--
-- Name: COLUMN observation_slope_code.description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_slope_code.description IS 'Description of code';


--
-- Name: COLUMN observation_slope_code.active_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_slope_code.active_ind IS 'Indicator to check active status of code';


--
-- Name: COLUMN observation_slope_code.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_slope_code.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN observation_slope_code.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_slope_code.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN observation_slope_code.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_slope_code.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN observation_slope_code.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_slope_code.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: observation_slope_code_observation_slope_code_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.observation_slope_code_observation_slope_code_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.observation_slope_code_observation_slope_code_id_seq OWNER TO invasivebc;

--
-- Name: observation_slope_code_observation_slope_code_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.observation_slope_code_observation_slope_code_id_seq OWNED BY invasivesbc.observation_slope_code.observation_slope_code_id;


--
-- Name: observation_type_code; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.observation_type_code (
    observation_type_code_id integer NOT NULL,
    observation_type_code character varying(5) NOT NULL,
    description character varying(100),
    active_ind boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.observation_type_code OWNER TO invasivebc;

--
-- Name: TABLE observation_type_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.observation_type_code IS 'The description of the observation was obtained (akin to quality): Operational, cursory, research, mobile, aerial photo, satellite imagery.';


--
-- Name: COLUMN observation_type_code.observation_type_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_type_code.observation_type_code_id IS 'Auto generated primary key';


--
-- Name: COLUMN observation_type_code.observation_type_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_type_code.observation_type_code IS 'Cross domain Code values for observation type types';


--
-- Name: COLUMN observation_type_code.description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_type_code.description IS 'Description of code';


--
-- Name: COLUMN observation_type_code.active_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_type_code.active_ind IS 'Indicator to check active status of code';


--
-- Name: COLUMN observation_type_code.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_type_code.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN observation_type_code.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_type_code.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN observation_type_code.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_type_code.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN observation_type_code.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observation_type_code.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: observation_type_code_observation_type_code_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.observation_type_code_observation_type_code_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.observation_type_code_observation_type_code_id_seq OWNER TO invasivebc;

--
-- Name: observation_type_code_observation_type_code_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.observation_type_code_observation_type_code_id_seq OWNED BY invasivesbc.observation_type_code.observation_type_code_id;


--
-- Name: observer_workflow; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.observer_workflow (
    observer_workflow_id integer NOT NULL,
    date date NOT NULL,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    station character varying(100),
    location character varying(100),
    shift_start_comment character varying(300),
    shift_end_comment character varying(300),
    motorized_blow_bys_counter integer DEFAULT 0 NOT NULL,
    non_motorized_blow_bys_counter integer DEFAULT 0 NOT NULL,
    boats_inspected_ind boolean DEFAULT false NOT NULL,
    k9_on_shift_ind boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.observer_workflow OWNER TO invasivebc;

--
-- Name: TABLE observer_workflow; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.observer_workflow IS 'Table to store typical work flow data for watercraft observer. Which includes start of the day form and end of the day form. This table is used to store refer from WatercraftRiskAssessment and WaterCraft quick pass schema';


--
-- Name: COLUMN observer_workflow.observer_workflow_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observer_workflow.observer_workflow_id IS 'Auto generated primary key';


--
-- Name: COLUMN observer_workflow.date; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observer_workflow.date IS 'Date of the work shift';


--
-- Name: COLUMN observer_workflow.start_time; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observer_workflow.start_time IS 'Start time of workflow';


--
-- Name: COLUMN observer_workflow.end_time; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observer_workflow.end_time IS 'End time of workflow';


--
-- Name: COLUMN observer_workflow.station; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observer_workflow.station IS 'Station name';


--
-- Name: COLUMN observer_workflow.location; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observer_workflow.location IS 'Location name';


--
-- Name: COLUMN observer_workflow.shift_start_comment; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observer_workflow.shift_start_comment IS 'This column will store user comment on start of the day';


--
-- Name: COLUMN observer_workflow.shift_end_comment; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observer_workflow.shift_end_comment IS 'This column will store user comment on end of the day';


--
-- Name: COLUMN observer_workflow.motorized_blow_bys_counter; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observer_workflow.motorized_blow_bys_counter IS 'Counter for number of motorized boats inspected during the shift';


--
-- Name: COLUMN observer_workflow.non_motorized_blow_bys_counter; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observer_workflow.non_motorized_blow_bys_counter IS 'Counter for number of non motorized boats inspected during the shift';


--
-- Name: COLUMN observer_workflow.boats_inspected_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observer_workflow.boats_inspected_ind IS 'Boolean indicator to show any boat was inspected during shift';


--
-- Name: COLUMN observer_workflow.k9_on_shift_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observer_workflow.k9_on_shift_ind IS 'Boolean indicator to show K9 on shift';


--
-- Name: COLUMN observer_workflow.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observer_workflow.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN observer_workflow.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observer_workflow.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN observer_workflow.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observer_workflow.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN observer_workflow.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.observer_workflow.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: observer_workflow_observer_workflow_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.observer_workflow_observer_workflow_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.observer_workflow_observer_workflow_id_seq OWNER TO invasivebc;

--
-- Name: observer_workflow_observer_workflow_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.observer_workflow_observer_workflow_id_seq OWNED BY invasivesbc.observer_workflow.observer_workflow_id;


--
-- Name: pesticide_employer_code; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.pesticide_employer_code (
    pesticide_employer_code_id integer NOT NULL,
    registration_number integer NOT NULL,
    business_name character varying(100) NOT NULL,
    licence_expiry_date date NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.pesticide_employer_code OWNER TO invasivebc;

--
-- Name: TABLE pesticide_employer_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.pesticide_employer_code IS 'Table to store contractor/employer information chemical treatment service providers.';


--
-- Name: COLUMN pesticide_employer_code.pesticide_employer_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.pesticide_employer_code.pesticide_employer_code_id IS 'Auto generated primary key. This is auto incremental field';


--
-- Name: COLUMN pesticide_employer_code.registration_number; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.pesticide_employer_code.registration_number IS 'Registration number associated with employer';


--
-- Name: COLUMN pesticide_employer_code.business_name; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.pesticide_employer_code.business_name IS 'Name of the employer';


--
-- Name: COLUMN pesticide_employer_code.licence_expiry_date; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.pesticide_employer_code.licence_expiry_date IS 'Date of expiry of license';


--
-- Name: COLUMN pesticide_employer_code.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.pesticide_employer_code.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN pesticide_employer_code.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.pesticide_employer_code.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN pesticide_employer_code.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.pesticide_employer_code.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN pesticide_employer_code.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.pesticide_employer_code.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: pesticide_employer_code_pesticide_employer_code_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.pesticide_employer_code_pesticide_employer_code_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.pesticide_employer_code_pesticide_employer_code_id_seq OWNER TO invasivebc;

--
-- Name: pesticide_employer_code_pesticide_employer_code_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.pesticide_employer_code_pesticide_employer_code_id_seq OWNED BY invasivesbc.pesticide_employer_code.pesticide_employer_code_id;


--
-- Name: previous_ais_knowledge_source_code; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.previous_ais_knowledge_source_code (
    previous_ais_knowledge_source_code_id integer NOT NULL,
    description character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.previous_ais_knowledge_source_code OWNER TO invasivebc;

--
-- Name: TABLE previous_ais_knowledge_source_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.previous_ais_knowledge_source_code IS 'Code table with options for sources of previous Aquatic Invasive Species (AIS) knowledge';


--
-- Name: COLUMN previous_ais_knowledge_source_code.previous_ais_knowledge_source_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.previous_ais_knowledge_source_code.previous_ais_knowledge_source_code_id IS 'Auto generated sequential primary key column.';


--
-- Name: COLUMN previous_ais_knowledge_source_code.description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.previous_ais_knowledge_source_code.description IS 'Brief description of the knowledge source';


--
-- Name: COLUMN previous_ais_knowledge_source_code.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.previous_ais_knowledge_source_code.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN previous_ais_knowledge_source_code.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.previous_ais_knowledge_source_code.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN previous_ais_knowledge_source_code.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.previous_ais_knowledge_source_code.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN previous_ais_knowledge_source_code.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.previous_ais_knowledge_source_code.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: previous_ais_knowledge_source_previous_ais_knowledge_source_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.previous_ais_knowledge_source_previous_ais_knowledge_source_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.previous_ais_knowledge_source_previous_ais_knowledge_source_seq OWNER TO invasivebc;

--
-- Name: previous_ais_knowledge_source_previous_ais_knowledge_source_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.previous_ais_knowledge_source_previous_ais_knowledge_source_seq OWNED BY invasivesbc.previous_ais_knowledge_source_code.previous_ais_knowledge_source_code_id;


--
-- Name: previous_inspection_source_code; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.previous_inspection_source_code (
    previous_inspection_source_code_id integer NOT NULL,
    description character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.previous_inspection_source_code OWNER TO invasivebc;

--
-- Name: TABLE previous_inspection_source_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.previous_inspection_source_code IS 'Code table with options for sources of previous invasive mussel inspections';


--
-- Name: COLUMN previous_inspection_source_code.previous_inspection_source_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.previous_inspection_source_code.previous_inspection_source_code_id IS 'Auto generated sequential primary key column.';


--
-- Name: COLUMN previous_inspection_source_code.description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.previous_inspection_source_code.description IS 'Brief description of the source of the previous inspection(s)';


--
-- Name: COLUMN previous_inspection_source_code.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.previous_inspection_source_code.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN previous_inspection_source_code.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.previous_inspection_source_code.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN previous_inspection_source_code.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.previous_inspection_source_code.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN previous_inspection_source_code.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.previous_inspection_source_code.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: previous_inspection_source_co_previous_inspection_source_co_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.previous_inspection_source_co_previous_inspection_source_co_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.previous_inspection_source_co_previous_inspection_source_co_seq OWNER TO invasivebc;

--
-- Name: previous_inspection_source_co_previous_inspection_source_co_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.previous_inspection_source_co_previous_inspection_source_co_seq OWNED BY invasivesbc.previous_inspection_source_code.previous_inspection_source_code_id;


--
-- Name: project_management_plan_code; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.project_management_plan_code (
    project_management_plan_code_id integer NOT NULL,
    pmp_number character varying(50) NOT NULL,
    description character varying(50) NOT NULL,
    pmp_holder character varying(50) NOT NULL,
    legal_start_date date NOT NULL,
    legal_end_date date NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.project_management_plan_code OWNER TO invasivebc;

--
-- Name: TABLE project_management_plan_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.project_management_plan_code IS 'A Pest Management Plan is a treatment plan ID number, which is required for any herbicide treatment on public lands. The PMP Number is required for verifying which herbicidal and chemical treatments are safe and allowable within a specific area.
The Province is divided into a number of zones that allow for and regulate what can be apply on the landscape. The PMP or Pest Management Plan is a document that provides the regulations for a 5 year period. The PMP number (dropdown) is required for each treatment record.';


--
-- Name: COLUMN project_management_plan_code.project_management_plan_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.project_management_plan_code.project_management_plan_code_id IS 'Auto generated primary key. This is auto incremental field';


--
-- Name: COLUMN project_management_plan_code.pmp_number; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.project_management_plan_code.pmp_number IS 'Unique number associated with Plan';


--
-- Name: COLUMN project_management_plan_code.description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.project_management_plan_code.description IS 'Description of plan';


--
-- Name: COLUMN project_management_plan_code.pmp_holder; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.project_management_plan_code.pmp_holder IS 'Holder of plan';


--
-- Name: COLUMN project_management_plan_code.legal_start_date; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.project_management_plan_code.legal_start_date IS 'Legal start date of plan';


--
-- Name: COLUMN project_management_plan_code.legal_end_date; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.project_management_plan_code.legal_end_date IS 'Legal end data of plan';


--
-- Name: COLUMN project_management_plan_code.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.project_management_plan_code.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN project_management_plan_code.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.project_management_plan_code.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN project_management_plan_code.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.project_management_plan_code.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN project_management_plan_code.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.project_management_plan_code.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: project_management_plan_code_project_management_plan_code_i_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.project_management_plan_code_project_management_plan_code_i_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.project_management_plan_code_project_management_plan_code_i_seq OWNER TO invasivebc;

--
-- Name: project_management_plan_code_project_management_plan_code_i_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.project_management_plan_code_project_management_plan_code_i_seq OWNED BY invasivesbc.project_management_plan_code.project_management_plan_code_id;


--
-- Name: session_activity_code; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.session_activity_code (
    session_activity_code_id integer NOT NULL,
    session_activity_code character varying(10) NOT NULL,
    description character varying(100),
    active_ind boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.session_activity_code OWNER TO invasivebc;

--
-- Name: TABLE session_activity_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.session_activity_code IS 'Code table to hold various session activities, like Date Add (DA), Data edit (DE), Date Delete (DD), Reporting (RP), Other Activities (OTHER)';


--
-- Name: COLUMN session_activity_code.session_activity_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.session_activity_code.session_activity_code_id IS 'Auto generated primary key';


--
-- Name: COLUMN session_activity_code.session_activity_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.session_activity_code.session_activity_code IS 'Unique activity code for session';


--
-- Name: COLUMN session_activity_code.description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.session_activity_code.description IS 'Description of code';


--
-- Name: COLUMN session_activity_code.active_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.session_activity_code.active_ind IS 'Indicator to check active status of code';


--
-- Name: COLUMN session_activity_code.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.session_activity_code.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN session_activity_code.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.session_activity_code.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN session_activity_code.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.session_activity_code.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN session_activity_code.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.session_activity_code.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: session_activity_code_session_activity_code_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.session_activity_code_session_activity_code_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.session_activity_code_session_activity_code_id_seq OWNER TO invasivebc;

--
-- Name: session_activity_code_session_activity_code_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.session_activity_code_session_activity_code_id_seq OWNED BY invasivesbc.session_activity_code.session_activity_code_id;


--
-- Name: soil_texture_code; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.soil_texture_code (
    soil_texture_code_id integer NOT NULL,
    soil_texture_code character varying(1) NOT NULL,
    description character varying(100),
    active_ind boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.soil_texture_code OWNER TO invasivebc;

--
-- Name: TABLE soil_texture_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.soil_texture_code IS 'Code table for schema of soil texture codes';


--
-- Name: COLUMN soil_texture_code.soil_texture_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.soil_texture_code.soil_texture_code_id IS 'Auto generated primary key';


--
-- Name: COLUMN soil_texture_code.soil_texture_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.soil_texture_code.soil_texture_code IS 'Soil texture code values in the system';


--
-- Name: COLUMN soil_texture_code.description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.soil_texture_code.description IS 'Description of code';


--
-- Name: COLUMN soil_texture_code.active_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.soil_texture_code.active_ind IS 'Indicator to check active status of code';


--
-- Name: COLUMN soil_texture_code.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.soil_texture_code.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN soil_texture_code.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.soil_texture_code.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN soil_texture_code.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.soil_texture_code.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN soil_texture_code.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.soil_texture_code.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: soil_texture_code_soil_texture_code_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.soil_texture_code_soil_texture_code_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.soil_texture_code_soil_texture_code_id_seq OWNER TO invasivebc;

--
-- Name: soil_texture_code_soil_texture_code_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.soil_texture_code_soil_texture_code_id_seq OWNED BY invasivesbc.soil_texture_code.soil_texture_code_id;


--
-- Name: space_geom; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.space_geom (
    space_geom_id integer NOT NULL,
    latitude numeric(9,6) NOT NULL,
    longitude numeric(9,6) NOT NULL,
    hex_id character varying(50),
    sub_hex_id character varying(50),
    input_geometry jsonb,
    meta_data character varying(99),
    observation_geometry_code_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.space_geom OWNER TO invasivebc;

--
-- Name: TABLE space_geom; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.space_geom IS 'Table to store raw spatial data for any spatial record like Observation, Treatments, Monitoring.';


--
-- Name: COLUMN space_geom.space_geom_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.space_geom.space_geom_id IS 'Auto generated sequential primary key column.';


--
-- Name: COLUMN space_geom.latitude; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.space_geom.latitude IS 'Latitude of treatment  location';


--
-- Name: COLUMN space_geom.longitude; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.space_geom.longitude IS 'Longitude of treatment location.';


--
-- Name: COLUMN space_geom.hex_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.space_geom.hex_id IS 'Spatial methodology to store and stratify spatial data to a 1 hectare standardized provincial hexagonally shaped grid system.';


--
-- Name: COLUMN space_geom.sub_hex_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.space_geom.sub_hex_id IS 'Unique spatial sub hex id to identify record location within a hex.';


--
-- Name: COLUMN space_geom.input_geometry; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.space_geom.input_geometry IS 'Input Geometry geometry of the spatial record as GeoJSON format';


--
-- Name: COLUMN space_geom.meta_data; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.space_geom.meta_data IS 'Application level meta data to identify associated spatial object';


--
-- Name: COLUMN space_geom.observation_geometry_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.space_geom.observation_geometry_code_id IS 'Foreign key reference to observation geometry code table';


--
-- Name: COLUMN space_geom.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.space_geom.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN space_geom.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.space_geom.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN space_geom.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.space_geom.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN space_geom.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.space_geom.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: space_geom_space_geom_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.space_geom_space_geom_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.space_geom_space_geom_id_seq OWNER TO invasivebc;

--
-- Name: space_geom_space_geom_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.space_geom_space_geom_id_seq OWNED BY invasivesbc.space_geom.space_geom_id;


--
-- Name: species; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.species (
    species_id integer NOT NULL,
    map_code character varying(10) NOT NULL,
    early_detection_ind boolean DEFAULT false,
    containment_species smallint,
    containment_species_spatial_ref smallint,
    species_code character varying(10) NOT NULL,
    genus_code character varying(5) NOT NULL,
    common_name character varying(100) NOT NULL,
    latin_name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.species OWNER TO invasivebc;

--
-- Name: TABLE species; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.species IS 'Universal species table. A species is often defined as a group of individuals that actually or potentially interbreed in nature. Taxonomic Level: Domain, Kingdom, Phylum, Class, Order, Family,Genus, Species';


--
-- Name: COLUMN species.species_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species.species_id IS 'Auto generated primary key';


--
-- Name: COLUMN species.map_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species.map_code IS 'Code associated with species. This code is used to uniquely identify with application domain';


--
-- Name: COLUMN species.early_detection_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species.early_detection_ind IS 'This indicator indicates early detection of species';


--
-- Name: COLUMN species.containment_species; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species.containment_species IS 'Code to check species containment level';


--
-- Name: COLUMN species.containment_species_spatial_ref; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species.containment_species_spatial_ref IS 'Containment spatial reference of species';


--
-- Name: COLUMN species.species_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species.species_code IS 'Species Code. String enum to identify species with application domain';


--
-- Name: COLUMN species.genus_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species.genus_code IS 'Latin Genus name of the species (first 3 characters)';


--
-- Name: COLUMN species.common_name; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species.common_name IS 'Common or popular name of the species';


--
-- Name: COLUMN species.latin_name; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species.latin_name IS 'Latin or scientific name of the species';


--
-- Name: COLUMN species.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN species.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN species.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN species.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: species_agency_code; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.species_agency_code (
    species_agency_code_id integer NOT NULL,
    species_agency_code character varying(10) NOT NULL,
    description character varying(100),
    active_ind boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.species_agency_code OWNER TO invasivebc;

--
-- Name: TABLE species_agency_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.species_agency_code IS 'Code table for schema of species agencies';


--
-- Name: COLUMN species_agency_code.species_agency_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species_agency_code.species_agency_code_id IS 'Auto generated primary key';


--
-- Name: COLUMN species_agency_code.species_agency_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species_agency_code.species_agency_code IS 'Agency code values for managing invasive species';


--
-- Name: COLUMN species_agency_code.description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species_agency_code.description IS 'Description of code';


--
-- Name: COLUMN species_agency_code.active_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species_agency_code.active_ind IS 'Indicator to check active status of code';


--
-- Name: COLUMN species_agency_code.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species_agency_code.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN species_agency_code.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species_agency_code.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN species_agency_code.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species_agency_code.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN species_agency_code.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species_agency_code.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: species_agency_code_species_agency_code_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.species_agency_code_species_agency_code_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.species_agency_code_species_agency_code_id_seq OWNER TO invasivebc;

--
-- Name: species_agency_code_species_agency_code_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.species_agency_code_species_agency_code_id_seq OWNED BY invasivesbc.species_agency_code.species_agency_code_id;


--
-- Name: species_density_code; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.species_density_code (
    species_density_code_id integer NOT NULL,
    density_code character varying(5) NOT NULL,
    description character varying(100),
    active_ind boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.species_density_code OWNER TO invasivebc;

--
-- Name: TABLE species_density_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.species_density_code IS 'Density enum code table for a species of observation';


--
-- Name: COLUMN species_density_code.species_density_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species_density_code.species_density_code_id IS 'Auto generated primary key';


--
-- Name: COLUMN species_density_code.density_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species_density_code.density_code IS 'Density code values based on species present on location';


--
-- Name: COLUMN species_density_code.description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species_density_code.description IS 'Description of code';


--
-- Name: COLUMN species_density_code.active_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species_density_code.active_ind IS 'Indicator to check active status of code';


--
-- Name: COLUMN species_density_code.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species_density_code.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN species_density_code.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species_density_code.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN species_density_code.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species_density_code.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN species_density_code.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species_density_code.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: species_density_code_species_density_code_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.species_density_code_species_density_code_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.species_density_code_species_density_code_id_seq OWNER TO invasivebc;

--
-- Name: species_density_code_species_density_code_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.species_density_code_species_density_code_id_seq OWNED BY invasivesbc.species_density_code.species_density_code_id;


--
-- Name: species_distribution_code; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.species_distribution_code (
    species_distribution_code_id integer NOT NULL,
    description character varying(100) NOT NULL,
    active_ind boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.species_distribution_code OWNER TO invasivebc;

--
-- Name: TABLE species_distribution_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.species_distribution_code IS 'Distribution code table of species for an observation';


--
-- Name: COLUMN species_distribution_code.species_distribution_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species_distribution_code.species_distribution_code_id IS 'Identifier as code';


--
-- Name: COLUMN species_distribution_code.description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species_distribution_code.description IS 'Description of distribution code';


--
-- Name: COLUMN species_distribution_code.active_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species_distribution_code.active_ind IS 'Indicator to check active status of code';


--
-- Name: COLUMN species_distribution_code.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species_distribution_code.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN species_distribution_code.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species_distribution_code.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN species_distribution_code.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species_distribution_code.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN species_distribution_code.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.species_distribution_code.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: species_species_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.species_species_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.species_species_id_seq OWNER TO invasivebc;

--
-- Name: species_species_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.species_species_id_seq OWNED BY invasivesbc.species.species_id;


--
-- Name: specific_use_code; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.specific_use_code (
    specific_use_code_id integer NOT NULL,
    specific_use_code character varying(2) NOT NULL,
    description character varying(100),
    active_ind boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.specific_use_code OWNER TO invasivebc;

--
-- Name: TABLE specific_use_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.specific_use_code IS 'Code table for schema of Specific use codes of the observation';


--
-- Name: COLUMN specific_use_code.specific_use_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.specific_use_code.specific_use_code_id IS 'Auto generated primary key';


--
-- Name: COLUMN specific_use_code.specific_use_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.specific_use_code.specific_use_code IS 'Code values of specific use codes';


--
-- Name: COLUMN specific_use_code.description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.specific_use_code.description IS 'Description of code';


--
-- Name: COLUMN specific_use_code.active_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.specific_use_code.active_ind IS 'Indicator to check active status of code';


--
-- Name: COLUMN specific_use_code.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.specific_use_code.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN specific_use_code.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.specific_use_code.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN specific_use_code.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.specific_use_code.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN specific_use_code.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.specific_use_code.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: specific_use_code_specific_use_code_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.specific_use_code_specific_use_code_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.specific_use_code_specific_use_code_id_seq OWNER TO invasivebc;

--
-- Name: specific_use_code_specific_use_code_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.specific_use_code_specific_use_code_id_seq OWNED BY invasivesbc.specific_use_code.specific_use_code_id;


--
-- Name: treatment_provider_contractor; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.treatment_provider_contractor (
    treatment_provider_contractor_id integer NOT NULL,
    registration_number integer NOT NULL,
    business_name character varying(100) NOT NULL,
    category character varying(100) NOT NULL,
    address character varying(200) NOT NULL,
    region_operation character varying(1000),
    license_expiry_date date NOT NULL,
    service_provide_ind boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.treatment_provider_contractor OWNER TO invasivebc;

--
-- Name: TABLE treatment_provider_contractor; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.treatment_provider_contractor IS 'Treatment providers are govt contractors, who executes/applies treatment. This table contains list of such contractor and their details.';


--
-- Name: COLUMN treatment_provider_contractor.treatment_provider_contractor_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.treatment_provider_contractor.treatment_provider_contractor_id IS 'Auto generated primary key';


--
-- Name: COLUMN treatment_provider_contractor.registration_number; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.treatment_provider_contractor.registration_number IS 'The registration number associated with contractor';


--
-- Name: COLUMN treatment_provider_contractor.business_name; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.treatment_provider_contractor.business_name IS 'The name of the contactor organization';


--
-- Name: COLUMN treatment_provider_contractor.category; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.treatment_provider_contractor.category IS 'The category label mentioned for contractor';


--
-- Name: COLUMN treatment_provider_contractor.address; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.treatment_provider_contractor.address IS 'The address of the contractor';


--
-- Name: COLUMN treatment_provider_contractor.region_operation; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.treatment_provider_contractor.region_operation IS 'Comma separated values of region of operation. Example LOWER MAINLAND, OMINECA, PEACE';


--
-- Name: COLUMN treatment_provider_contractor.license_expiry_date; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.treatment_provider_contractor.license_expiry_date IS 'Date of expiry of license of contractor';


--
-- Name: COLUMN treatment_provider_contractor.service_provide_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.treatment_provider_contractor.service_provide_ind IS 'Indicator to show, associated contractor is active or not';


--
-- Name: COLUMN treatment_provider_contractor.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.treatment_provider_contractor.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN treatment_provider_contractor.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.treatment_provider_contractor.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN treatment_provider_contractor.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.treatment_provider_contractor.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN treatment_provider_contractor.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.treatment_provider_contractor.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: treatment_provider_contractor_treatment_provider_contractor_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.treatment_provider_contractor_treatment_provider_contractor_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.treatment_provider_contractor_treatment_provider_contractor_seq OWNER TO invasivebc;

--
-- Name: treatment_provider_contractor_treatment_provider_contractor_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.treatment_provider_contractor_treatment_provider_contractor_seq OWNED BY invasivesbc.treatment_provider_contractor.treatment_provider_contractor_id;


--
-- Name: user_message; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.user_message (
    message_id integer NOT NULL,
    title character varying(200),
    body character varying(1000),
    message_type smallint DEFAULT 0 NOT NULL,
    message_status smallint DEFAULT 0 NOT NULL,
    receiver_user_id integer,
    creator_user_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE invasivesbc.user_message OWNER TO invasivebc;

--
-- Name: TABLE user_message; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.user_message IS 'Table to store user messages. Messages can be created by system or other user. This messages will be displayed as notification.';


--
-- Name: COLUMN user_message.message_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.user_message.message_id IS 'Auto generated primary key';


--
-- Name: COLUMN user_message.title; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.user_message.title IS 'Title of the messages.';


--
-- Name: COLUMN user_message.body; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.user_message.body IS 'Message body';


--
-- Name: COLUMN user_message.message_type; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.user_message.message_type IS 'Integer enum value to specify message type. Currently types are managed by application';


--
-- Name: COLUMN user_message.message_status; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.user_message.message_status IS 'Integer enum value to specify message status. Currently types are managed by application';


--
-- Name: COLUMN user_message.receiver_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.user_message.receiver_user_id IS 'FOREIGN KEY reference to User table. This column will store receiver of the message';


--
-- Name: COLUMN user_message.creator_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.user_message.creator_user_id IS 'FOREIGN KEY reference to User table. This column will store creator of the message ';


--
-- Name: COLUMN user_message.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.user_message.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN user_message.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.user_message.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: user_message_message_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.user_message_message_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.user_message_message_id_seq OWNER TO invasivebc;

--
-- Name: user_message_message_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.user_message_message_id_seq OWNED BY invasivesbc.user_message.message_id;


--
-- Name: user_role; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.user_role (
    user_role_id integer NOT NULL,
    user_id integer NOT NULL,
    role_code_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE invasivesbc.user_role OWNER TO invasivebc;

--
-- Name: TABLE user_role; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.user_role IS 'This is join (pivot) table for to store different role associated with an account user. The relation between user and roles are many to many in nature.';


--
-- Name: COLUMN user_role.user_role_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.user_role.user_role_id IS 'Auto generated primary key.';


--
-- Name: COLUMN user_role.user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.user_role.user_id IS 'Foreign key reference to user table';


--
-- Name: COLUMN user_role.role_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.user_role.role_code_id IS 'Foreign key reference to role code table';


--
-- Name: COLUMN user_role.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.user_role.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN user_role.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.user_role.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: user_role_user_role_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.user_role_user_role_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.user_role_user_role_id_seq OWNER TO invasivebc;

--
-- Name: user_role_user_role_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.user_role_user_role_id_seq OWNED BY invasivesbc.user_role.user_role_id;


--
-- Name: user_session; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.user_session (
    session_id integer NOT NULL,
    last_login_at timestamp without time zone,
    token character varying(1000),
    token_expiry timestamp without time zone,
    token_lifetime integer,
    last_active_at timestamp without time zone,
    user_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE invasivesbc.user_session OWNER TO invasivebc;

--
-- Name: TABLE user_session; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.user_session IS 'User session information. This table is maintain all session of user.';


--
-- Name: COLUMN user_session.session_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.user_session.session_id IS 'Auto generated primary key';


--
-- Name: COLUMN user_session.last_login_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.user_session.last_login_at IS 'Last login timestamp';


--
-- Name: COLUMN user_session.token; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.user_session.token IS 'Keyclock token of the user';


--
-- Name: COLUMN user_session.token_expiry; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.user_session.token_expiry IS 'Keyclock token expiry timestamp';


--
-- Name: COLUMN user_session.token_lifetime; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.user_session.token_lifetime IS 'Life time of KC token in sec';


--
-- Name: COLUMN user_session.last_active_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.user_session.last_active_at IS 'Timestamp to check last activity of user';


--
-- Name: COLUMN user_session.user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.user_session.user_id IS 'Foreign key reference to user table. Owner of the session.';


--
-- Name: COLUMN user_session.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.user_session.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN user_session.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.user_session.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: user_session_activity; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.user_session_activity (
    user_session_activity_id integer NOT NULL,
    session_activity_info character varying(500),
    session_activity_code_id integer NOT NULL,
    session_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE invasivesbc.user_session_activity OWNER TO invasivebc;

--
-- Name: TABLE user_session_activity; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.user_session_activity IS 'This table is used to hold user session activities. Activities are defined by session activity code table';


--
-- Name: COLUMN user_session_activity.user_session_activity_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.user_session_activity.user_session_activity_id IS 'Auto generated primary key';


--
-- Name: COLUMN user_session_activity.session_activity_info; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.user_session_activity.session_activity_info IS 'Additional information on activity';


--
-- Name: COLUMN user_session_activity.session_activity_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.user_session_activity.session_activity_code_id IS 'Foreign key reference to session_activity_code table.';


--
-- Name: COLUMN user_session_activity.session_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.user_session_activity.session_id IS 'Foreign key reference to user session table';


--
-- Name: COLUMN user_session_activity.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.user_session_activity.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN user_session_activity.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.user_session_activity.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: user_session_activity_user_session_activity_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.user_session_activity_user_session_activity_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.user_session_activity_user_session_activity_id_seq OWNER TO invasivebc;

--
-- Name: user_session_activity_user_session_activity_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.user_session_activity_user_session_activity_id_seq OWNED BY invasivesbc.user_session_activity.user_session_activity_id;


--
-- Name: user_session_session_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.user_session_session_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.user_session_session_id_seq OWNER TO invasivebc;

--
-- Name: user_session_session_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.user_session_session_id_seq OWNED BY invasivesbc.user_session.session_id;


--
-- Name: water_body; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.water_body (
    water_body_id integer NOT NULL,
    water_body_name character varying(100) NOT NULL,
    water_body_latitude numeric(10,7) NOT NULL,
    water_body_longitude numeric(10,7) NOT NULL,
    country_code character varying(3),
    province_code character varying(2),
    closest_city character varying(100) NOT NULL,
    distance numeric(10,5),
    active_ind boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.water_body OWNER TO invasivebc;

--
-- Name: TABLE water_body; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.water_body IS 'The table to store all lake/water body information. Watercraft observation require  information regarding its source and destination.';


--
-- Name: COLUMN water_body.water_body_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.water_body.water_body_id IS 'Auto generated primary key';


--
-- Name: COLUMN water_body.water_body_name; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.water_body.water_body_name IS 'Common or popular name of the water-body';


--
-- Name: COLUMN water_body.water_body_latitude; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.water_body.water_body_latitude IS 'Latitude of water body location';


--
-- Name: COLUMN water_body.water_body_longitude; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.water_body.water_body_longitude IS 'Longitude of water body location';


--
-- Name: COLUMN water_body.country_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.water_body.country_code IS 'Country of the water-body location. Joint foreign key reference to country_province table country_code column along with province_code.';


--
-- Name: COLUMN water_body.province_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.water_body.province_code IS 'Province of the water-body location. Joint foreign key reference to country_province table province_code column along with country code.';


--
-- Name: COLUMN water_body.closest_city; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.water_body.closest_city IS 'Nearest city/landmark from the water body';


--
-- Name: COLUMN water_body.distance; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.water_body.distance IS 'Distance from closest city/landmark in kilometer';


--
-- Name: COLUMN water_body.active_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.water_body.active_ind IS 'Boolean flag to check, the record is active or not.';


--
-- Name: COLUMN water_body.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.water_body.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN water_body.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.water_body.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN water_body.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.water_body.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN water_body.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.water_body.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: water_body_water_body_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.water_body_water_body_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.water_body_water_body_id_seq OWNER TO invasivebc;

--
-- Name: water_body_water_body_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.water_body_water_body_id_seq OWNED BY invasivesbc.water_body.water_body_id;


--
-- Name: watercraft_journey; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.watercraft_journey (
    watercraft_journey_id integer NOT NULL,
    journey_type integer DEFAULT 0 NOT NULL,
    number_of_days_out integer,
    other_water_body_detail character varying(300),
    watercraft_risk_assessment_id integer,
    water_body_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.watercraft_journey OWNER TO invasivebc;

--
-- Name: TABLE watercraft_journey; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.watercraft_journey IS 'Joining table for water-body details and a inspection';


--
-- Name: COLUMN watercraft_journey.watercraft_journey_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_journey.watercraft_journey_id IS 'Auto generated sequential primary key column.';


--
-- Name: COLUMN watercraft_journey.journey_type; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_journey.journey_type IS 'Journey type of the associated regarding water body. i.e Previous (0) and next (1)';


--
-- Name: COLUMN watercraft_journey.number_of_days_out; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_journey.number_of_days_out IS 'Number of days out of water';


--
-- Name: COLUMN watercraft_journey.other_water_body_detail; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_journey.other_water_body_detail IS 'Details of not listed water body. This is an optional field. User can provide a brief description of water-body which is not listed in application water body list.';


--
-- Name: COLUMN watercraft_journey.watercraft_risk_assessment_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_journey.watercraft_risk_assessment_id IS 'Foreign key reference to Watercraft risk assessment table';


--
-- Name: COLUMN watercraft_journey.water_body_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_journey.water_body_id IS 'Foreign key reference to Water body detail table';


--
-- Name: COLUMN watercraft_journey.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_journey.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN watercraft_journey.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_journey.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN watercraft_journey.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_journey.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN watercraft_journey.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_journey.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: watercraft_journey_watercraft_journey_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.watercraft_journey_watercraft_journey_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.watercraft_journey_watercraft_journey_id_seq OWNER TO invasivebc;

--
-- Name: watercraft_journey_watercraft_journey_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.watercraft_journey_watercraft_journey_id_seq OWNED BY invasivesbc.watercraft_journey.watercraft_journey_id;


--
-- Name: watercraft_risk_assessment; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.watercraft_risk_assessment (
    watercraft_risk_assessment_id integer NOT NULL,
    "timestamp" timestamp without time zone NOT NULL,
    passport_holder_ind boolean DEFAULT false NOT NULL,
    k9_inspection_ind boolean DEFAULT false NOT NULL,
    marine_species_found_ind boolean DEFAULT false NOT NULL,
    aquatic_plants_found_ind boolean DEFAULT false NOT NULL,
    previous_ais_knowledge_ind boolean DEFAULT false NOT NULL,
    previous_inspection_ind boolean DEFAULT false NOT NULL,
    marine_mussel_found_ind boolean DEFAULT false NOT NULL,
    adult_dreissenidae_found_ind boolean DEFAULT false NOT NULL,
    launched_outside_bc_ind boolean DEFAULT false NOT NULL,
    decontamination_performed_ind boolean DEFAULT false NOT NULL,
    commercially_hauled_ind boolean DEFAULT false NOT NULL,
    high_risk_area_ind boolean DEFAULT false NOT NULL,
    high_risk_ais_ind boolean DEFAULT false NOT NULL,
    previous_dry_storage_ind boolean DEFAULT false NOT NULL,
    destination_dry_storage_ind boolean DEFAULT false NOT NULL,
    unknown_previous_water_body_ind boolean DEFAULT false NOT NULL,
    unknown_destination_water_body_ind boolean DEFAULT false NOT NULL,
    commercial_manufacturer_as_previous_water_body_ind boolean DEFAULT false NOT NULL,
    commercial_manufacturer_as_destination_water_body_ind boolean DEFAULT false NOT NULL,
    non_motorized_counter integer,
    simple_counter integer,
    complex_counter integer,
    very_complex_count integer,
    previous_inspection_days_count integer,
    general_comment character varying(300),
    passport_number character varying(100),
    decontamination_reference character varying(100),
    high_risk_assessment_id integer,
    previous_ais_knowledge_source_code_id integer,
    previous_inspection_source_code_id integer,
    province_code character varying(3),
    country_code character varying(3),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer,
    observer_workflow_id integer,
    number_of_people_in_party integer DEFAULT 1
);


ALTER TABLE invasivesbc.watercraft_risk_assessment OWNER TO invasivebc;

--
-- Name: TABLE watercraft_risk_assessment; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.watercraft_risk_assessment IS 'This is schema for data model of water craft observation for invasive aquatic species specially Mussels. This data model will be used to capture all kind of variables related to a water craft observation';


--
-- Name: COLUMN watercraft_risk_assessment.watercraft_risk_assessment_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.watercraft_risk_assessment_id IS 'Auto generated primary key';


--
-- Name: COLUMN watercraft_risk_assessment."timestamp"; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment."timestamp" IS 'Date and time of watercraft observation.';


--
-- Name: COLUMN watercraft_risk_assessment.passport_holder_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.passport_holder_ind IS 'Indicator to show that inspected boat has previously issued passport';


--
-- Name: COLUMN watercraft_risk_assessment.k9_inspection_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.k9_inspection_ind IS 'Indicator to show that inspection type is K9';


--
-- Name: COLUMN watercraft_risk_assessment.marine_species_found_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.marine_species_found_ind IS 'Indicator to show any marine species found during inspection';


--
-- Name: COLUMN watercraft_risk_assessment.aquatic_plants_found_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.aquatic_plants_found_ind IS 'Indicator to show any aquatic plants found during inspection';


--
-- Name: COLUMN watercraft_risk_assessment.previous_ais_knowledge_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.previous_ais_knowledge_ind IS 'Indicator to store status of previous AIS knowledge';


--
-- Name: COLUMN watercraft_risk_assessment.previous_inspection_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.previous_inspection_ind IS 'Indicator to store status of previous inspection';


--
-- Name: COLUMN watercraft_risk_assessment.marine_mussel_found_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.marine_mussel_found_ind IS 'Indicator to store status marine mussel found during inspection';


--
-- Name: COLUMN watercraft_risk_assessment.adult_dreissenidae_found_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.adult_dreissenidae_found_ind IS 'Status flag any adult Dreissenidae found during inspection';


--
-- Name: COLUMN watercraft_risk_assessment.launched_outside_bc_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.launched_outside_bc_ind IS 'Status flag to check the boat was launched outside of bc or not';


--
-- Name: COLUMN watercraft_risk_assessment.decontamination_performed_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.decontamination_performed_ind IS 'Status flag to check any decontamination performed during inspection';


--
-- Name: COLUMN watercraft_risk_assessment.commercially_hauled_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.commercially_hauled_ind IS 'Status flag to check inspected boats are commercially hauled or not';


--
-- Name: COLUMN watercraft_risk_assessment.high_risk_area_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.high_risk_area_ind IS 'Indicator flag to check boats are from High risk area or not.';


--
-- Name: COLUMN watercraft_risk_assessment.high_risk_ais_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.high_risk_ais_ind IS 'Indicator flag to check high risk AIS or not';


--
-- Name: COLUMN watercraft_risk_assessment.previous_dry_storage_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.previous_dry_storage_ind IS 'Boolean indicator that watercraft''s previous water body is Dry Storage';


--
-- Name: COLUMN watercraft_risk_assessment.destination_dry_storage_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.destination_dry_storage_ind IS 'Boolean indicator that watercraft''s destination water body is Dry Storage';


--
-- Name: COLUMN watercraft_risk_assessment.unknown_previous_water_body_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.unknown_previous_water_body_ind IS 'Boolean indicate that watercraft''s previous water body is unknown';


--
-- Name: COLUMN watercraft_risk_assessment.unknown_destination_water_body_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.unknown_destination_water_body_ind IS 'Boolean indicate that watercraft''s destination water body is unknown';


--
-- Name: COLUMN watercraft_risk_assessment.commercial_manufacturer_as_previous_water_body_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.commercial_manufacturer_as_previous_water_body_ind IS 'Boolean indicate that watercraft''s previous water body is commercial manufacturer';


--
-- Name: COLUMN watercraft_risk_assessment.commercial_manufacturer_as_destination_water_body_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.commercial_manufacturer_as_destination_water_body_ind IS 'Boolean indicate that watercraft''s destination water body is commercial manufacturer';


--
-- Name: COLUMN watercraft_risk_assessment.non_motorized_counter; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.non_motorized_counter IS 'Counter for non motorized boats in inspection';


--
-- Name: COLUMN watercraft_risk_assessment.simple_counter; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.simple_counter IS 'Counter for number of simple boats in the inspection';


--
-- Name: COLUMN watercraft_risk_assessment.complex_counter; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.complex_counter IS 'Counter for number of complex boats in the inspection';


--
-- Name: COLUMN watercraft_risk_assessment.very_complex_count; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.very_complex_count IS 'Counter for number of very complex boats in the inspection';


--
-- Name: COLUMN watercraft_risk_assessment.previous_inspection_days_count; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.previous_inspection_days_count IS 'Counter for number of very complex boats in the inspection';


--
-- Name: COLUMN watercraft_risk_assessment.general_comment; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.general_comment IS 'General comment associated with assessment';


--
-- Name: COLUMN watercraft_risk_assessment.passport_number; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.passport_number IS 'Passport number associated with previous inspection';


--
-- Name: COLUMN watercraft_risk_assessment.decontamination_reference; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.decontamination_reference IS 'Decontamination reference number. Optional and dependent on decontaminationPerformed indicator';


--
-- Name: COLUMN watercraft_risk_assessment.high_risk_assessment_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.high_risk_assessment_id IS 'Foreign key reference to High risk assessment of the inspection';


--
-- Name: COLUMN watercraft_risk_assessment.previous_ais_knowledge_source_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.previous_ais_knowledge_source_code_id IS 'Foreign key reference to previous_ais_knowledge_source_code table';


--
-- Name: COLUMN watercraft_risk_assessment.previous_inspection_source_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.previous_inspection_source_code_id IS 'Foreign key reference to previous_inspection_source_code table';


--
-- Name: COLUMN watercraft_risk_assessment.province_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.province_code IS 'Province of residence of the boat. Joint foreign key reference to country_province table province_code column along with country code';


--
-- Name: COLUMN watercraft_risk_assessment.country_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.country_code IS 'Country of the water-body location. Joint foreign key reference to country_province table country_code column along with province_code.';


--
-- Name: COLUMN watercraft_risk_assessment.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN watercraft_risk_assessment.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN watercraft_risk_assessment.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN watercraft_risk_assessment.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: COLUMN watercraft_risk_assessment.observer_workflow_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.observer_workflow_id IS 'Foreign key reference to reference to observer_workflow table';


--
-- Name: COLUMN watercraft_risk_assessment.number_of_people_in_party; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.watercraft_risk_assessment.number_of_people_in_party IS 'Number of peoples in inspected boats';


--
-- Name: watercraft_risk_assessment_watercraft_risk_assessment_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.watercraft_risk_assessment_watercraft_risk_assessment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.watercraft_risk_assessment_watercraft_risk_assessment_id_seq OWNER TO invasivebc;

--
-- Name: watercraft_risk_assessment_watercraft_risk_assessment_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.watercraft_risk_assessment_watercraft_risk_assessment_id_seq OWNED BY invasivesbc.watercraft_risk_assessment.watercraft_risk_assessment_id;


--
-- Name: wind_direction_code; Type: TABLE; Schema: invasivesbc; Owner: invasivebc
--

CREATE TABLE invasivesbc.wind_direction_code (
    wind_direction_code_id integer NOT NULL,
    wind_direction_code character varying(3) NOT NULL,
    description character varying(50) NOT NULL,
    active_ind boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by_user_id integer,
    created_by_user_id integer
);


ALTER TABLE invasivesbc.wind_direction_code OWNER TO invasivebc;

--
-- Name: TABLE wind_direction_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON TABLE invasivesbc.wind_direction_code IS 'List of valid menu items to be displayed in dropdown menu for Wind Direction';


--
-- Name: COLUMN wind_direction_code.wind_direction_code_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.wind_direction_code.wind_direction_code_id IS 'Auto generated primary key';


--
-- Name: COLUMN wind_direction_code.wind_direction_code; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.wind_direction_code.wind_direction_code IS 'Identifier as code';


--
-- Name: COLUMN wind_direction_code.description; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.wind_direction_code.description IS 'Description of wind direction code';


--
-- Name: COLUMN wind_direction_code.active_ind; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.wind_direction_code.active_ind IS 'Indicator to check active status of code';


--
-- Name: COLUMN wind_direction_code.created_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.wind_direction_code.created_at IS 'Timestamp column to check creation time of record';


--
-- Name: COLUMN wind_direction_code.updated_at; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.wind_direction_code.updated_at IS 'Timestamp column to check modify time of record';


--
-- Name: COLUMN wind_direction_code.updated_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.wind_direction_code.updated_by_user_id IS 'Audit column to track creator';


--
-- Name: COLUMN wind_direction_code.created_by_user_id; Type: COMMENT; Schema: invasivesbc; Owner: invasivebc
--

COMMENT ON COLUMN invasivesbc.wind_direction_code.created_by_user_id IS 'Audit column to track modifier';


--
-- Name: wind_direction_code_wind_direction_code_id_seq; Type: SEQUENCE; Schema: invasivesbc; Owner: invasivebc
--

CREATE SEQUENCE invasivesbc.wind_direction_code_wind_direction_code_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE invasivesbc.wind_direction_code_wind_direction_code_id_seq OWNER TO invasivebc;

--
-- Name: wind_direction_code_wind_direction_code_id_seq; Type: SEQUENCE OWNED BY; Schema: invasivesbc; Owner: invasivebc
--

ALTER SEQUENCE invasivesbc.wind_direction_code_wind_direction_code_id_seq OWNED BY invasivesbc.wind_direction_code.wind_direction_code_id;


--
-- Name: access_request request_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.access_request ALTER COLUMN request_id SET DEFAULT nextval('invasivesbc.access_request_request_id_seq'::regclass);


--
-- Name: adult_mussels_location_code adult_mussels_location_code_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.adult_mussels_location_code ALTER COLUMN adult_mussels_location_code_id SET DEFAULT nextval('invasivesbc.adult_mussels_location_code_adult_mussels_location_code_id_seq'::regclass);


--
-- Name: animal_observation animal_observation_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.animal_observation ALTER COLUMN animal_observation_id SET DEFAULT nextval('invasivesbc.animal_observation_animal_observation_id_seq'::regclass);


--
-- Name: animal_species animal_species_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.animal_species ALTER COLUMN animal_species_id SET DEFAULT nextval('invasivesbc.animal_species_animal_species_id_seq'::regclass);


--
-- Name: app_migration_table id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.app_migration_table ALTER COLUMN id SET DEFAULT nextval('invasivesbc.app_migration_table_id_seq'::regclass);


--
-- Name: app_role_code role_code_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.app_role_code ALTER COLUMN role_code_id SET DEFAULT nextval('invasivesbc.app_role_code_role_code_id_seq'::regclass);


--
-- Name: app_seed_table seed_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.app_seed_table ALTER COLUMN seed_id SET DEFAULT nextval('invasivesbc.app_seed_table_seed_id_seq'::regclass);


--
-- Name: application_event application_event_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.application_event ALTER COLUMN application_event_id SET DEFAULT nextval('invasivesbc.application_event_application_event_id_seq'::regclass);


--
-- Name: application_user user_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.application_user ALTER COLUMN user_id SET DEFAULT nextval('invasivesbc.application_user_user_id_seq'::regclass);


--
-- Name: behaviour_code behaviour_code_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.behaviour_code ALTER COLUMN behaviour_code_id SET DEFAULT nextval('invasivesbc.behaviour_code_behaviour_code_id_seq'::regclass);


--
-- Name: chemical_treatment chemical_treatment_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.chemical_treatment ALTER COLUMN chemical_treatment_id SET DEFAULT nextval('invasivesbc.chemical_treatment_chemical_treatment_id_seq'::regclass);


--
-- Name: chemical_treatment_employee chemical_treatment_employee_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.chemical_treatment_employee ALTER COLUMN chemical_treatment_employee_id SET DEFAULT nextval('invasivesbc.chemical_treatment_employee_chemical_treatment_employee_id_seq'::regclass);


--
-- Name: chemical_treatment_method chemical_treatment_method_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.chemical_treatment_method ALTER COLUMN chemical_treatment_method_id SET DEFAULT nextval('invasivesbc.chemical_treatment_method_chemical_treatment_method_id_seq'::regclass);


--
-- Name: efficacy_code efficacy_code_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.efficacy_code ALTER COLUMN efficacy_code_id SET DEFAULT nextval('invasivesbc.efficacy_code_efficacy_code_id_seq'::regclass);


--
-- Name: herbicide herbicide_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.herbicide ALTER COLUMN herbicide_id SET DEFAULT nextval('invasivesbc.herbicide_herbicide_id_seq'::regclass);


--
-- Name: herbicide_tank_mix herbicide_tank_mix_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.herbicide_tank_mix ALTER COLUMN herbicide_tank_mix_id SET DEFAULT nextval('invasivesbc.herbicide_tank_mix_herbicide_tank_mix_id_seq'::regclass);


--
-- Name: high_risk_assessment high_risk_assessment_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.high_risk_assessment ALTER COLUMN high_risk_assessment_id SET DEFAULT nextval('invasivesbc.high_risk_assessment_high_risk_assessment_id_seq'::regclass);


--
-- Name: jurisdiction_code jurisdiction_code_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.jurisdiction_code ALTER COLUMN jurisdiction_code_id SET DEFAULT nextval('invasivesbc.jurisdiction_code_jurisdiction_code_id_seq'::regclass);


--
-- Name: life_stage_code life_stage_code_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.life_stage_code ALTER COLUMN life_stage_code_id SET DEFAULT nextval('invasivesbc.life_stage_code_life_stage_code_id_seq'::regclass);


--
-- Name: mechanical_disposal_method_code mechanical_disposal_method_code_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_disposal_method_code ALTER COLUMN mechanical_disposal_method_code_id SET DEFAULT nextval('invasivesbc.mechanical_disposal_method_co_mechanical_disposal_method_co_seq'::regclass);


--
-- Name: mechanical_method_code mechanical_method_code_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_method_code ALTER COLUMN mechanical_method_code_id SET DEFAULT nextval('invasivesbc.mechanical_method_code_mechanical_method_code_id_seq'::regclass);


--
-- Name: mechanical_monitor mechanical_monitor_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_monitor ALTER COLUMN mechanical_monitor_id SET DEFAULT nextval('invasivesbc.mechanical_monitor_mechanical_monitor_id_seq'::regclass);


--
-- Name: mechanical_root_removal_code mechanical_root_removal_code_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_root_removal_code ALTER COLUMN mechanical_root_removal_code_id SET DEFAULT nextval('invasivesbc.mechanical_root_removal_code_mechanical_root_removal_code_i_seq'::regclass);


--
-- Name: mechanical_soil_disturbance_code mechanical_soil_disturbance_code_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_soil_disturbance_code ALTER COLUMN mechanical_soil_disturbance_code_id SET DEFAULT nextval('invasivesbc.mechanical_soil_disturbance_c_mechanical_soil_disturbance_c_seq'::regclass);


--
-- Name: mechanical_treatment mechanical_treatment_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_treatment ALTER COLUMN mechanical_treatment_id SET DEFAULT nextval('invasivesbc.mechanical_treatment_mechanical_treatment_id_seq'::regclass);


--
-- Name: mechanical_treatment_issue_code mechanical_treatment_issue_code_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_treatment_issue_code ALTER COLUMN mechanical_treatment_issue_code_id SET DEFAULT nextval('invasivesbc.mechanical_treatment_issue_co_mechanical_treatment_issue_co_seq'::regclass);


--
-- Name: mechanical_treatment_observation mechanical_treatment_observation_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_treatment_observation ALTER COLUMN mechanical_treatment_observation_id SET DEFAULT nextval('invasivesbc.mechanical_treatment_observat_mechanical_treatment_observat_seq'::regclass);


--
-- Name: observation observation_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation ALTER COLUMN observation_id SET DEFAULT nextval('invasivesbc.observation_observation_id_seq'::regclass);


--
-- Name: observation_aspect_code observation_aspect_code_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_aspect_code ALTER COLUMN observation_aspect_code_id SET DEFAULT nextval('invasivesbc.observation_aspect_code_observation_aspect_code_id_seq'::regclass);


--
-- Name: observation_chemical_treatment observation_chemical_treatment_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_chemical_treatment ALTER COLUMN observation_chemical_treatment_id SET DEFAULT nextval('invasivesbc.observation_chemical_treatmen_observation_chemical_treatmen_seq'::regclass);


--
-- Name: observation_geometry_code observation_geometry_code_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_geometry_code ALTER COLUMN observation_geometry_code_id SET DEFAULT nextval('invasivesbc.observation_geometry_code_observation_geometry_code_id_seq'::regclass);


--
-- Name: observation_proposed_action_code observation_proposed_action_code_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_proposed_action_code ALTER COLUMN observation_proposed_action_code_id SET DEFAULT nextval('invasivesbc.observation_proposed_action_c_observation_proposed_action_c_seq'::regclass);


--
-- Name: observation_slope_code observation_slope_code_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_slope_code ALTER COLUMN observation_slope_code_id SET DEFAULT nextval('invasivesbc.observation_slope_code_observation_slope_code_id_seq'::regclass);


--
-- Name: observation_type_code observation_type_code_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_type_code ALTER COLUMN observation_type_code_id SET DEFAULT nextval('invasivesbc.observation_type_code_observation_type_code_id_seq'::regclass);


--
-- Name: observer_workflow observer_workflow_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observer_workflow ALTER COLUMN observer_workflow_id SET DEFAULT nextval('invasivesbc.observer_workflow_observer_workflow_id_seq'::regclass);


--
-- Name: pesticide_employer_code pesticide_employer_code_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.pesticide_employer_code ALTER COLUMN pesticide_employer_code_id SET DEFAULT nextval('invasivesbc.pesticide_employer_code_pesticide_employer_code_id_seq'::regclass);


--
-- Name: previous_ais_knowledge_source_code previous_ais_knowledge_source_code_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.previous_ais_knowledge_source_code ALTER COLUMN previous_ais_knowledge_source_code_id SET DEFAULT nextval('invasivesbc.previous_ais_knowledge_source_previous_ais_knowledge_source_seq'::regclass);


--
-- Name: previous_inspection_source_code previous_inspection_source_code_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.previous_inspection_source_code ALTER COLUMN previous_inspection_source_code_id SET DEFAULT nextval('invasivesbc.previous_inspection_source_co_previous_inspection_source_co_seq'::regclass);


--
-- Name: project_management_plan_code project_management_plan_code_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.project_management_plan_code ALTER COLUMN project_management_plan_code_id SET DEFAULT nextval('invasivesbc.project_management_plan_code_project_management_plan_code_i_seq'::regclass);


--
-- Name: session_activity_code session_activity_code_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.session_activity_code ALTER COLUMN session_activity_code_id SET DEFAULT nextval('invasivesbc.session_activity_code_session_activity_code_id_seq'::regclass);


--
-- Name: soil_texture_code soil_texture_code_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.soil_texture_code ALTER COLUMN soil_texture_code_id SET DEFAULT nextval('invasivesbc.soil_texture_code_soil_texture_code_id_seq'::regclass);


--
-- Name: space_geom space_geom_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.space_geom ALTER COLUMN space_geom_id SET DEFAULT nextval('invasivesbc.space_geom_space_geom_id_seq'::regclass);


--
-- Name: species species_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.species ALTER COLUMN species_id SET DEFAULT nextval('invasivesbc.species_species_id_seq'::regclass);


--
-- Name: species_agency_code species_agency_code_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.species_agency_code ALTER COLUMN species_agency_code_id SET DEFAULT nextval('invasivesbc.species_agency_code_species_agency_code_id_seq'::regclass);


--
-- Name: species_density_code species_density_code_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.species_density_code ALTER COLUMN species_density_code_id SET DEFAULT nextval('invasivesbc.species_density_code_species_density_code_id_seq'::regclass);


--
-- Name: specific_use_code specific_use_code_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.specific_use_code ALTER COLUMN specific_use_code_id SET DEFAULT nextval('invasivesbc.specific_use_code_specific_use_code_id_seq'::regclass);


--
-- Name: treatment_provider_contractor treatment_provider_contractor_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.treatment_provider_contractor ALTER COLUMN treatment_provider_contractor_id SET DEFAULT nextval('invasivesbc.treatment_provider_contractor_treatment_provider_contractor_seq'::regclass);


--
-- Name: user_message message_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.user_message ALTER COLUMN message_id SET DEFAULT nextval('invasivesbc.user_message_message_id_seq'::regclass);


--
-- Name: user_role user_role_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.user_role ALTER COLUMN user_role_id SET DEFAULT nextval('invasivesbc.user_role_user_role_id_seq'::regclass);


--
-- Name: user_session session_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.user_session ALTER COLUMN session_id SET DEFAULT nextval('invasivesbc.user_session_session_id_seq'::regclass);


--
-- Name: user_session_activity user_session_activity_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.user_session_activity ALTER COLUMN user_session_activity_id SET DEFAULT nextval('invasivesbc.user_session_activity_user_session_activity_id_seq'::regclass);


--
-- Name: water_body water_body_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.water_body ALTER COLUMN water_body_id SET DEFAULT nextval('invasivesbc.water_body_water_body_id_seq'::regclass);


--
-- Name: watercraft_journey watercraft_journey_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.watercraft_journey ALTER COLUMN watercraft_journey_id SET DEFAULT nextval('invasivesbc.watercraft_journey_watercraft_journey_id_seq'::regclass);


--
-- Name: watercraft_risk_assessment watercraft_risk_assessment_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.watercraft_risk_assessment ALTER COLUMN watercraft_risk_assessment_id SET DEFAULT nextval('invasivesbc.watercraft_risk_assessment_watercraft_risk_assessment_id_seq'::regclass);


--
-- Name: wind_direction_code wind_direction_code_id; Type: DEFAULT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.wind_direction_code ALTER COLUMN wind_direction_code_id SET DEFAULT nextval('invasivesbc.wind_direction_code_wind_direction_code_id_seq'::regclass);


--
-- Name: app_migration_table PK_2f0135c558a3c8c2257f67d3b2d; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.app_migration_table
    ADD CONSTRAINT "PK_2f0135c558a3c8c2257f67d3b2d" PRIMARY KEY (id);


--
-- Name: access_request access_request_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.access_request
    ADD CONSTRAINT access_request_pkey PRIMARY KEY (request_id);


--
-- Name: adult_mussels_location_code adult_mussels_location_code_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.adult_mussels_location_code
    ADD CONSTRAINT adult_mussels_location_code_pkey PRIMARY KEY (adult_mussels_location_code_id);


--
-- Name: animal_observation animal_observation_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.animal_observation
    ADD CONSTRAINT animal_observation_pkey PRIMARY KEY (animal_observation_id);


--
-- Name: animal_species animal_species_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.animal_species
    ADD CONSTRAINT animal_species_pkey PRIMARY KEY (animal_species_id);


--
-- Name: app_role_code app_role_code_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.app_role_code
    ADD CONSTRAINT app_role_code_pkey PRIMARY KEY (role_code_id);


--
-- Name: app_role_code app_role_code_role_code_key; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.app_role_code
    ADD CONSTRAINT app_role_code_role_code_key UNIQUE (role_code);


--
-- Name: app_seed_table app_seed_table_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.app_seed_table
    ADD CONSTRAINT app_seed_table_pkey PRIMARY KEY (seed_id);


--
-- Name: app_seed_table app_seed_table_reference_key; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.app_seed_table
    ADD CONSTRAINT app_seed_table_reference_key UNIQUE (reference);


--
-- Name: application_event application_event_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.application_event
    ADD CONSTRAINT application_event_pkey PRIMARY KEY (application_event_id);


--
-- Name: application_user application_user_email_key; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.application_user
    ADD CONSTRAINT application_user_email_key UNIQUE (email);


--
-- Name: application_user application_user_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.application_user
    ADD CONSTRAINT application_user_pkey PRIMARY KEY (user_id);


--
-- Name: application_user application_user_preferred_username_key; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.application_user
    ADD CONSTRAINT application_user_preferred_username_key UNIQUE (preferred_username);


--
-- Name: behaviour_code behaviour_code_behaviour_code_key; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.behaviour_code
    ADD CONSTRAINT behaviour_code_behaviour_code_key UNIQUE (behaviour_code);


--
-- Name: behaviour_code behaviour_code_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.behaviour_code
    ADD CONSTRAINT behaviour_code_pkey PRIMARY KEY (behaviour_code_id);


--
-- Name: chemical_treatment_employee chemical_treatment_employee_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.chemical_treatment_employee
    ADD CONSTRAINT chemical_treatment_employee_pkey PRIMARY KEY (chemical_treatment_employee_id);


--
-- Name: chemical_treatment_method chemical_treatment_method_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.chemical_treatment_method
    ADD CONSTRAINT chemical_treatment_method_pkey PRIMARY KEY (chemical_treatment_method_id);


--
-- Name: chemical_treatment chemical_treatment_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.chemical_treatment
    ADD CONSTRAINT chemical_treatment_pkey PRIMARY KEY (chemical_treatment_id);


--
-- Name: country country_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.country
    ADD CONSTRAINT country_pkey PRIMARY KEY (country_code);


--
-- Name: efficacy_code efficacy_code_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.efficacy_code
    ADD CONSTRAINT efficacy_code_pkey PRIMARY KEY (efficacy_code_id);


--
-- Name: herbicide herbicide_composite_name_key; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.herbicide
    ADD CONSTRAINT herbicide_composite_name_key UNIQUE (composite_name);


--
-- Name: herbicide herbicide_herbicide_code_key; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.herbicide
    ADD CONSTRAINT herbicide_herbicide_code_key UNIQUE (herbicide_code);


--
-- Name: herbicide herbicide_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.herbicide
    ADD CONSTRAINT herbicide_pkey PRIMARY KEY (herbicide_id);


--
-- Name: herbicide herbicide_pmra_reg_num_key; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.herbicide
    ADD CONSTRAINT herbicide_pmra_reg_num_key UNIQUE (pmra_reg_num);


--
-- Name: herbicide_tank_mix herbicide_tank_mix_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.herbicide_tank_mix
    ADD CONSTRAINT herbicide_tank_mix_pkey PRIMARY KEY (herbicide_tank_mix_id);


--
-- Name: high_risk_assessment high_risk_assessment_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.high_risk_assessment
    ADD CONSTRAINT high_risk_assessment_pkey PRIMARY KEY (high_risk_assessment_id);


--
-- Name: jurisdiction_code jurisdiction_code_jurisdiction_code_key; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.jurisdiction_code
    ADD CONSTRAINT jurisdiction_code_jurisdiction_code_key UNIQUE (jurisdiction_code);


--
-- Name: jurisdiction_code jurisdiction_code_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.jurisdiction_code
    ADD CONSTRAINT jurisdiction_code_pkey PRIMARY KEY (jurisdiction_code_id);


--
-- Name: life_stage_code life_stage_code_life_stage_code_key; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.life_stage_code
    ADD CONSTRAINT life_stage_code_life_stage_code_key UNIQUE (life_stage_code);


--
-- Name: life_stage_code life_stage_code_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.life_stage_code
    ADD CONSTRAINT life_stage_code_pkey PRIMARY KEY (life_stage_code_id);


--
-- Name: mechanical_disposal_method_code mechanical_disposal_method_co_mechanical_disposal_method_co_key; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_disposal_method_code
    ADD CONSTRAINT mechanical_disposal_method_co_mechanical_disposal_method_co_key UNIQUE (mechanical_disposal_method_code);


--
-- Name: mechanical_disposal_method_code mechanical_disposal_method_code_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_disposal_method_code
    ADD CONSTRAINT mechanical_disposal_method_code_pkey PRIMARY KEY (mechanical_disposal_method_code_id);


--
-- Name: mechanical_method_code mechanical_method_code_mechanical_method_code_key; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_method_code
    ADD CONSTRAINT mechanical_method_code_mechanical_method_code_key UNIQUE (mechanical_method_code);


--
-- Name: mechanical_method_code mechanical_method_code_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_method_code
    ADD CONSTRAINT mechanical_method_code_pkey PRIMARY KEY (mechanical_method_code_id);


--
-- Name: mechanical_monitor mechanical_monitor_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_monitor
    ADD CONSTRAINT mechanical_monitor_pkey PRIMARY KEY (mechanical_monitor_id);


--
-- Name: mechanical_root_removal_code mechanical_root_removal_code_mechanical_root_removal_code_key; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_root_removal_code
    ADD CONSTRAINT mechanical_root_removal_code_mechanical_root_removal_code_key UNIQUE (mechanical_root_removal_code);


--
-- Name: mechanical_root_removal_code mechanical_root_removal_code_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_root_removal_code
    ADD CONSTRAINT mechanical_root_removal_code_pkey PRIMARY KEY (mechanical_root_removal_code_id);


--
-- Name: mechanical_soil_disturbance_code mechanical_soil_disturbance_c_mechanical_soil_disturbance_c_key; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_soil_disturbance_code
    ADD CONSTRAINT mechanical_soil_disturbance_c_mechanical_soil_disturbance_c_key UNIQUE (mechanical_soil_disturbance_code);


--
-- Name: mechanical_soil_disturbance_code mechanical_soil_disturbance_code_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_soil_disturbance_code
    ADD CONSTRAINT mechanical_soil_disturbance_code_pkey PRIMARY KEY (mechanical_soil_disturbance_code_id);


--
-- Name: mechanical_treatment_issue_code mechanical_treatment_issue_co_mechanical_treatment_issue_co_key; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_treatment_issue_code
    ADD CONSTRAINT mechanical_treatment_issue_co_mechanical_treatment_issue_co_key UNIQUE (mechanical_treatment_issue_code);


--
-- Name: mechanical_treatment_issue_code mechanical_treatment_issue_code_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_treatment_issue_code
    ADD CONSTRAINT mechanical_treatment_issue_code_pkey PRIMARY KEY (mechanical_treatment_issue_code_id);


--
-- Name: mechanical_treatment_observation mechanical_treatment_observation_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_treatment_observation
    ADD CONSTRAINT mechanical_treatment_observation_pkey PRIMARY KEY (mechanical_treatment_observation_id);


--
-- Name: mechanical_treatment mechanical_treatment_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_treatment
    ADD CONSTRAINT mechanical_treatment_pkey PRIMARY KEY (mechanical_treatment_id);


--
-- Name: observation_aspect_code observation_aspect_code_observation_aspect_code_key; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_aspect_code
    ADD CONSTRAINT observation_aspect_code_observation_aspect_code_key UNIQUE (observation_aspect_code);


--
-- Name: observation_aspect_code observation_aspect_code_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_aspect_code
    ADD CONSTRAINT observation_aspect_code_pkey PRIMARY KEY (observation_aspect_code_id);


--
-- Name: observation_chemical_treatment observation_chemical_treatment_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_chemical_treatment
    ADD CONSTRAINT observation_chemical_treatment_pkey PRIMARY KEY (observation_chemical_treatment_id);


--
-- Name: observation_geometry_code observation_geometry_code_observation_geometry_code_key; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_geometry_code
    ADD CONSTRAINT observation_geometry_code_observation_geometry_code_key UNIQUE (observation_geometry_code);


--
-- Name: observation_geometry_code observation_geometry_code_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_geometry_code
    ADD CONSTRAINT observation_geometry_code_pkey PRIMARY KEY (observation_geometry_code_id);


--
-- Name: observation observation_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation
    ADD CONSTRAINT observation_pkey PRIMARY KEY (observation_id);


--
-- Name: observation_proposed_action_code observation_proposed_action_c_observation_proposed_action_c_key; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_proposed_action_code
    ADD CONSTRAINT observation_proposed_action_c_observation_proposed_action_c_key UNIQUE (observation_proposed_action_code);


--
-- Name: observation_proposed_action_code observation_proposed_action_code_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_proposed_action_code
    ADD CONSTRAINT observation_proposed_action_code_pkey PRIMARY KEY (observation_proposed_action_code_id);


--
-- Name: observation_slope_code observation_slope_code_observation_slope_code_key; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_slope_code
    ADD CONSTRAINT observation_slope_code_observation_slope_code_key UNIQUE (observation_slope_code);


--
-- Name: observation_slope_code observation_slope_code_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_slope_code
    ADD CONSTRAINT observation_slope_code_pkey PRIMARY KEY (observation_slope_code_id);


--
-- Name: observation_type_code observation_type_code_observation_type_code_key; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_type_code
    ADD CONSTRAINT observation_type_code_observation_type_code_key UNIQUE (observation_type_code);


--
-- Name: observation_type_code observation_type_code_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_type_code
    ADD CONSTRAINT observation_type_code_pkey PRIMARY KEY (observation_type_code_id);


--
-- Name: observer_workflow observer_workflow_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observer_workflow
    ADD CONSTRAINT observer_workflow_pkey PRIMARY KEY (observer_workflow_id);


--
-- Name: pesticide_employer_code pesticide_employer_code_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.pesticide_employer_code
    ADD CONSTRAINT pesticide_employer_code_pkey PRIMARY KEY (pesticide_employer_code_id);


--
-- Name: pesticide_employer_code pesticide_employer_code_registration_number_key; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.pesticide_employer_code
    ADD CONSTRAINT pesticide_employer_code_registration_number_key UNIQUE (registration_number);


--
-- Name: country_province pk_country_province; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.country_province
    ADD CONSTRAINT pk_country_province PRIMARY KEY (country_code, province_code);


--
-- Name: previous_ais_knowledge_source_code previous_ais_knowledge_source_code_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.previous_ais_knowledge_source_code
    ADD CONSTRAINT previous_ais_knowledge_source_code_pkey PRIMARY KEY (previous_ais_knowledge_source_code_id);


--
-- Name: previous_inspection_source_code previous_inspection_source_code_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.previous_inspection_source_code
    ADD CONSTRAINT previous_inspection_source_code_pkey PRIMARY KEY (previous_inspection_source_code_id);


--
-- Name: project_management_plan_code project_management_plan_code_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.project_management_plan_code
    ADD CONSTRAINT project_management_plan_code_pkey PRIMARY KEY (project_management_plan_code_id);


--
-- Name: project_management_plan_code project_management_plan_code_pmp_number_key; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.project_management_plan_code
    ADD CONSTRAINT project_management_plan_code_pmp_number_key UNIQUE (pmp_number);


--
-- Name: session_activity_code session_activity_code_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.session_activity_code
    ADD CONSTRAINT session_activity_code_pkey PRIMARY KEY (session_activity_code_id);


--
-- Name: session_activity_code session_activity_code_session_activity_code_key; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.session_activity_code
    ADD CONSTRAINT session_activity_code_session_activity_code_key UNIQUE (session_activity_code);


--
-- Name: soil_texture_code soil_texture_code_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.soil_texture_code
    ADD CONSTRAINT soil_texture_code_pkey PRIMARY KEY (soil_texture_code_id);


--
-- Name: soil_texture_code soil_texture_code_soil_texture_code_key; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.soil_texture_code
    ADD CONSTRAINT soil_texture_code_soil_texture_code_key UNIQUE (soil_texture_code);


--
-- Name: space_geom space_geom_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.space_geom
    ADD CONSTRAINT space_geom_pkey PRIMARY KEY (space_geom_id);


--
-- Name: species_agency_code species_agency_code_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.species_agency_code
    ADD CONSTRAINT species_agency_code_pkey PRIMARY KEY (species_agency_code_id);


--
-- Name: species_agency_code species_agency_code_species_agency_code_key; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.species_agency_code
    ADD CONSTRAINT species_agency_code_species_agency_code_key UNIQUE (species_agency_code);


--
-- Name: species_density_code species_density_code_density_code_key; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.species_density_code
    ADD CONSTRAINT species_density_code_density_code_key UNIQUE (density_code);


--
-- Name: species_density_code species_density_code_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.species_density_code
    ADD CONSTRAINT species_density_code_pkey PRIMARY KEY (species_density_code_id);


--
-- Name: species_distribution_code species_distribution_code_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.species_distribution_code
    ADD CONSTRAINT species_distribution_code_pkey PRIMARY KEY (species_distribution_code_id);


--
-- Name: species species_map_code_key; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.species
    ADD CONSTRAINT species_map_code_key UNIQUE (map_code);


--
-- Name: species species_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.species
    ADD CONSTRAINT species_pkey PRIMARY KEY (species_id);


--
-- Name: specific_use_code specific_use_code_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.specific_use_code
    ADD CONSTRAINT specific_use_code_pkey PRIMARY KEY (specific_use_code_id);


--
-- Name: specific_use_code specific_use_code_specific_use_code_key; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.specific_use_code
    ADD CONSTRAINT specific_use_code_specific_use_code_key UNIQUE (specific_use_code);


--
-- Name: treatment_provider_contractor treatment_provider_contractor_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.treatment_provider_contractor
    ADD CONSTRAINT treatment_provider_contractor_pkey PRIMARY KEY (treatment_provider_contractor_id);


--
-- Name: treatment_provider_contractor treatment_provider_contractor_registration_number_key; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.treatment_provider_contractor
    ADD CONSTRAINT treatment_provider_contractor_registration_number_key UNIQUE (registration_number);


--
-- Name: user_message user_message_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.user_message
    ADD CONSTRAINT user_message_pkey PRIMARY KEY (message_id);


--
-- Name: user_role user_role_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.user_role
    ADD CONSTRAINT user_role_pkey PRIMARY KEY (user_role_id);


--
-- Name: user_session_activity user_session_activity_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.user_session_activity
    ADD CONSTRAINT user_session_activity_pkey PRIMARY KEY (user_session_activity_id);


--
-- Name: user_session user_session_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.user_session
    ADD CONSTRAINT user_session_pkey PRIMARY KEY (session_id);


--
-- Name: water_body water_body_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.water_body
    ADD CONSTRAINT water_body_pkey PRIMARY KEY (water_body_id);


--
-- Name: watercraft_journey watercraft_journey_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.watercraft_journey
    ADD CONSTRAINT watercraft_journey_pkey PRIMARY KEY (watercraft_journey_id);


--
-- Name: watercraft_risk_assessment watercraft_risk_assessment_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.watercraft_risk_assessment
    ADD CONSTRAINT watercraft_risk_assessment_pkey PRIMARY KEY (watercraft_risk_assessment_id);


--
-- Name: wind_direction_code wind_direction_code_pkey; Type: CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.wind_direction_code
    ADD CONSTRAINT wind_direction_code_pkey PRIMARY KEY (wind_direction_code_id);


--
-- Name: watercraft_risk_assessment_id_watercraft_journey_idx; Type: INDEX; Schema: invasivesbc; Owner: invasivebc
--

CREATE INDEX watercraft_risk_assessment_id_watercraft_journey_idx ON invasivesbc.watercraft_journey USING btree (watercraft_risk_assessment_id);


--
-- Name: access_request access_request_approver_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.access_request
    ADD CONSTRAINT access_request_approver_user_id_fkey FOREIGN KEY (approver_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: access_request access_request_requested_role_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.access_request
    ADD CONSTRAINT access_request_requested_role_code_id_fkey FOREIGN KEY (requested_role_code_id) REFERENCES invasivesbc.app_role_code(role_code_id) ON DELETE SET NULL;


--
-- Name: access_request access_request_requester_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.access_request
    ADD CONSTRAINT access_request_requester_user_id_fkey FOREIGN KEY (requester_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: adult_mussels_location_code adult_mussels_location_code_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.adult_mussels_location_code
    ADD CONSTRAINT adult_mussels_location_code_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: adult_mussels_location_code adult_mussels_location_code_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.adult_mussels_location_code
    ADD CONSTRAINT adult_mussels_location_code_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: animal_observation animal_observation_animal_species_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.animal_observation
    ADD CONSTRAINT animal_observation_animal_species_id_fkey FOREIGN KEY (animal_species_id) REFERENCES invasivesbc.animal_species(animal_species_id) ON DELETE CASCADE;


--
-- Name: animal_observation animal_observation_behaviour_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.animal_observation
    ADD CONSTRAINT animal_observation_behaviour_code_id_fkey FOREIGN KEY (behaviour_code_id) REFERENCES invasivesbc.behaviour_code(behaviour_code_id) ON DELETE CASCADE;


--
-- Name: animal_observation animal_observation_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.animal_observation
    ADD CONSTRAINT animal_observation_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: animal_observation animal_observation_life_stage_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.animal_observation
    ADD CONSTRAINT animal_observation_life_stage_code_id_fkey FOREIGN KEY (life_stage_code_id) REFERENCES invasivesbc.life_stage_code(life_stage_code_id) ON DELETE CASCADE;


--
-- Name: animal_observation animal_observation_space_geom_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.animal_observation
    ADD CONSTRAINT animal_observation_space_geom_id_fkey FOREIGN KEY (space_geom_id) REFERENCES invasivesbc.space_geom(space_geom_id) ON DELETE SET NULL;


--
-- Name: animal_observation animal_observation_species_agency_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.animal_observation
    ADD CONSTRAINT animal_observation_species_agency_code_id_fkey FOREIGN KEY (species_agency_code_id) REFERENCES invasivesbc.species_agency_code(species_agency_code_id) ON DELETE SET NULL;


--
-- Name: animal_observation animal_observation_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.animal_observation
    ADD CONSTRAINT animal_observation_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: animal_species animal_species_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.animal_species
    ADD CONSTRAINT animal_species_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: animal_species animal_species_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.animal_species
    ADD CONSTRAINT animal_species_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: app_seed_table app_seed_table_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.app_seed_table
    ADD CONSTRAINT app_seed_table_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: app_seed_table app_seed_table_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.app_seed_table
    ADD CONSTRAINT app_seed_table_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: application_event application_event_session_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.application_event
    ADD CONSTRAINT application_event_session_id_fkey FOREIGN KEY (session_id) REFERENCES invasivesbc.user_session(session_id) ON DELETE SET NULL;


--
-- Name: behaviour_code behaviour_code_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.behaviour_code
    ADD CONSTRAINT behaviour_code_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: behaviour_code behaviour_code_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.behaviour_code
    ADD CONSTRAINT behaviour_code_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: chemical_treatment chemical_treatment_chemical_treatment_method_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.chemical_treatment
    ADD CONSTRAINT chemical_treatment_chemical_treatment_method_id_fkey FOREIGN KEY (chemical_treatment_method_id) REFERENCES invasivesbc.chemical_treatment_method(chemical_treatment_method_id) ON DELETE SET NULL;


--
-- Name: chemical_treatment chemical_treatment_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.chemical_treatment
    ADD CONSTRAINT chemical_treatment_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: chemical_treatment_employee chemical_treatment_employee_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.chemical_treatment_employee
    ADD CONSTRAINT chemical_treatment_employee_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: chemical_treatment_employee chemical_treatment_employee_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.chemical_treatment_employee
    ADD CONSTRAINT chemical_treatment_employee_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: chemical_treatment chemical_treatment_first_applicator_chemical_treatment_emp_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.chemical_treatment
    ADD CONSTRAINT chemical_treatment_first_applicator_chemical_treatment_emp_fkey FOREIGN KEY (first_applicator_chemical_treatment_employee_id) REFERENCES invasivesbc.chemical_treatment_employee(chemical_treatment_employee_id) ON DELETE SET NULL;


--
-- Name: chemical_treatment_method chemical_treatment_method_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.chemical_treatment_method
    ADD CONSTRAINT chemical_treatment_method_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: chemical_treatment_method chemical_treatment_method_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.chemical_treatment_method
    ADD CONSTRAINT chemical_treatment_method_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: chemical_treatment chemical_treatment_pesticide_employer_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.chemical_treatment
    ADD CONSTRAINT chemical_treatment_pesticide_employer_code_id_fkey FOREIGN KEY (pesticide_employer_code_id) REFERENCES invasivesbc.pesticide_employer_code(pesticide_employer_code_id) ON DELETE SET NULL;


--
-- Name: chemical_treatment chemical_treatment_project_management_plan_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.chemical_treatment
    ADD CONSTRAINT chemical_treatment_project_management_plan_code_id_fkey FOREIGN KEY (project_management_plan_code_id) REFERENCES invasivesbc.project_management_plan_code(project_management_plan_code_id) ON DELETE SET NULL;


--
-- Name: chemical_treatment chemical_treatment_second_applicator_chemical_treatment_em_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.chemical_treatment
    ADD CONSTRAINT chemical_treatment_second_applicator_chemical_treatment_em_fkey FOREIGN KEY (second_applicator_chemical_treatment_employee_id) REFERENCES invasivesbc.chemical_treatment_employee(chemical_treatment_employee_id) ON DELETE SET NULL;


--
-- Name: chemical_treatment chemical_treatment_space_geom_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.chemical_treatment
    ADD CONSTRAINT chemical_treatment_space_geom_id_fkey FOREIGN KEY (space_geom_id) REFERENCES invasivesbc.space_geom(space_geom_id) ON DELETE SET NULL;


--
-- Name: chemical_treatment chemical_treatment_species_agency_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.chemical_treatment
    ADD CONSTRAINT chemical_treatment_species_agency_code_id_fkey FOREIGN KEY (species_agency_code_id) REFERENCES invasivesbc.species_agency_code(species_agency_code_id) ON DELETE SET NULL;


--
-- Name: chemical_treatment chemical_treatment_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.chemical_treatment
    ADD CONSTRAINT chemical_treatment_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: chemical_treatment chemical_treatment_wind_direction_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.chemical_treatment
    ADD CONSTRAINT chemical_treatment_wind_direction_code_id_fkey FOREIGN KEY (wind_direction_code_id) REFERENCES invasivesbc.wind_direction_code(wind_direction_code_id) ON DELETE SET NULL;


--
-- Name: country country_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.country
    ADD CONSTRAINT country_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: country_province country_province_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.country_province
    ADD CONSTRAINT country_province_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: country_province country_province_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.country_province
    ADD CONSTRAINT country_province_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: country country_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.country
    ADD CONSTRAINT country_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: efficacy_code efficacy_code_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.efficacy_code
    ADD CONSTRAINT efficacy_code_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: efficacy_code efficacy_code_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.efficacy_code
    ADD CONSTRAINT efficacy_code_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: country_province fk_country_province; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.country_province
    ADD CONSTRAINT fk_country_province FOREIGN KEY (country_code) REFERENCES invasivesbc.country(country_code) ON DELETE CASCADE;


--
-- Name: water_body fk_water_body_country_province; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.water_body
    ADD CONSTRAINT fk_water_body_country_province FOREIGN KEY (country_code, province_code) REFERENCES invasivesbc.country_province(country_code, province_code) ON DELETE SET NULL;


--
-- Name: watercraft_risk_assessment fk_watercraft_risk_assessment_country_province; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.watercraft_risk_assessment
    ADD CONSTRAINT fk_watercraft_risk_assessment_country_province FOREIGN KEY (country_code, province_code) REFERENCES invasivesbc.country_province(country_code, province_code) ON DELETE SET NULL;


--
-- Name: herbicide herbicide_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.herbicide
    ADD CONSTRAINT herbicide_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: herbicide_tank_mix herbicide_tank_mix_chemical_treatment_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.herbicide_tank_mix
    ADD CONSTRAINT herbicide_tank_mix_chemical_treatment_id_fkey FOREIGN KEY (chemical_treatment_id) REFERENCES invasivesbc.chemical_treatment(chemical_treatment_id) ON DELETE CASCADE;


--
-- Name: herbicide_tank_mix herbicide_tank_mix_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.herbicide_tank_mix
    ADD CONSTRAINT herbicide_tank_mix_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: herbicide_tank_mix herbicide_tank_mix_herbicide_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.herbicide_tank_mix
    ADD CONSTRAINT herbicide_tank_mix_herbicide_id_fkey FOREIGN KEY (herbicide_id) REFERENCES invasivesbc.herbicide(herbicide_id) ON DELETE SET NULL;


--
-- Name: herbicide_tank_mix herbicide_tank_mix_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.herbicide_tank_mix
    ADD CONSTRAINT herbicide_tank_mix_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: herbicide herbicide_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.herbicide
    ADD CONSTRAINT herbicide_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: high_risk_assessment high_risk_assessment_adult_mussels_location_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.high_risk_assessment
    ADD CONSTRAINT high_risk_assessment_adult_mussels_location_code_id_fkey FOREIGN KEY (adult_mussels_location_code_id) REFERENCES invasivesbc.adult_mussels_location_code(adult_mussels_location_code_id) ON DELETE SET NULL;


--
-- Name: high_risk_assessment high_risk_assessment_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.high_risk_assessment
    ADD CONSTRAINT high_risk_assessment_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: high_risk_assessment high_risk_assessment_standing_water_location_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.high_risk_assessment
    ADD CONSTRAINT high_risk_assessment_standing_water_location_code_id_fkey FOREIGN KEY (standing_water_location_code_id) REFERENCES invasivesbc.adult_mussels_location_code(adult_mussels_location_code_id) ON DELETE SET NULL;


--
-- Name: high_risk_assessment high_risk_assessment_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.high_risk_assessment
    ADD CONSTRAINT high_risk_assessment_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: jurisdiction_code jurisdiction_code_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.jurisdiction_code
    ADD CONSTRAINT jurisdiction_code_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: jurisdiction_code jurisdiction_code_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.jurisdiction_code
    ADD CONSTRAINT jurisdiction_code_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: life_stage_code life_stage_code_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.life_stage_code
    ADD CONSTRAINT life_stage_code_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: life_stage_code life_stage_code_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.life_stage_code
    ADD CONSTRAINT life_stage_code_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: mechanical_disposal_method_code mechanical_disposal_method_code_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_disposal_method_code
    ADD CONSTRAINT mechanical_disposal_method_code_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: mechanical_disposal_method_code mechanical_disposal_method_code_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_disposal_method_code
    ADD CONSTRAINT mechanical_disposal_method_code_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: mechanical_method_code mechanical_method_code_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_method_code
    ADD CONSTRAINT mechanical_method_code_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: mechanical_method_code mechanical_method_code_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_method_code
    ADD CONSTRAINT mechanical_method_code_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: mechanical_monitor mechanical_monitor_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_monitor
    ADD CONSTRAINT mechanical_monitor_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: mechanical_monitor mechanical_monitor_efficacy_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_monitor
    ADD CONSTRAINT mechanical_monitor_efficacy_code_id_fkey FOREIGN KEY (efficacy_code_id) REFERENCES invasivesbc.efficacy_code(efficacy_code_id) ON DELETE SET NULL;


--
-- Name: mechanical_monitor mechanical_monitor_mechanical_treatment_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_monitor
    ADD CONSTRAINT mechanical_monitor_mechanical_treatment_id_fkey FOREIGN KEY (mechanical_treatment_id) REFERENCES invasivesbc.mechanical_treatment(mechanical_treatment_id) ON DELETE SET NULL;


--
-- Name: mechanical_monitor mechanical_monitor_species_agency_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_monitor
    ADD CONSTRAINT mechanical_monitor_species_agency_code_id_fkey FOREIGN KEY (species_agency_code_id) REFERENCES invasivesbc.species_agency_code(species_agency_code_id) ON DELETE SET NULL;


--
-- Name: mechanical_monitor mechanical_monitor_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_monitor
    ADD CONSTRAINT mechanical_monitor_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: mechanical_root_removal_code mechanical_root_removal_code_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_root_removal_code
    ADD CONSTRAINT mechanical_root_removal_code_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: mechanical_root_removal_code mechanical_root_removal_code_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_root_removal_code
    ADD CONSTRAINT mechanical_root_removal_code_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: mechanical_soil_disturbance_code mechanical_soil_disturbance_code_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_soil_disturbance_code
    ADD CONSTRAINT mechanical_soil_disturbance_code_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: mechanical_soil_disturbance_code mechanical_soil_disturbance_code_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_soil_disturbance_code
    ADD CONSTRAINT mechanical_soil_disturbance_code_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: mechanical_treatment mechanical_treatment_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_treatment
    ADD CONSTRAINT mechanical_treatment_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: mechanical_treatment_issue_code mechanical_treatment_issue_code_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_treatment_issue_code
    ADD CONSTRAINT mechanical_treatment_issue_code_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: mechanical_treatment_issue_code mechanical_treatment_issue_code_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_treatment_issue_code
    ADD CONSTRAINT mechanical_treatment_issue_code_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: mechanical_treatment mechanical_treatment_mechanical_disposal_method_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_treatment
    ADD CONSTRAINT mechanical_treatment_mechanical_disposal_method_code_id_fkey FOREIGN KEY (mechanical_disposal_method_code_id) REFERENCES invasivesbc.mechanical_disposal_method_code(mechanical_disposal_method_code_id) ON DELETE SET NULL;


--
-- Name: mechanical_treatment mechanical_treatment_mechanical_method_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_treatment
    ADD CONSTRAINT mechanical_treatment_mechanical_method_code_id_fkey FOREIGN KEY (mechanical_method_code_id) REFERENCES invasivesbc.mechanical_method_code(mechanical_method_code_id) ON DELETE SET NULL;


--
-- Name: mechanical_treatment mechanical_treatment_mechanical_root_removal_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_treatment
    ADD CONSTRAINT mechanical_treatment_mechanical_root_removal_code_id_fkey FOREIGN KEY (mechanical_root_removal_code_id) REFERENCES invasivesbc.mechanical_root_removal_code(mechanical_root_removal_code_id) ON DELETE SET NULL;


--
-- Name: mechanical_treatment mechanical_treatment_mechanical_soil_disturbance_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_treatment
    ADD CONSTRAINT mechanical_treatment_mechanical_soil_disturbance_code_id_fkey FOREIGN KEY (mechanical_soil_disturbance_code_id) REFERENCES invasivesbc.mechanical_soil_disturbance_code(mechanical_soil_disturbance_code_id) ON DELETE SET NULL;


--
-- Name: mechanical_treatment mechanical_treatment_mechanical_treatment_issue_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_treatment
    ADD CONSTRAINT mechanical_treatment_mechanical_treatment_issue_code_id_fkey FOREIGN KEY (mechanical_treatment_issue_code_id) REFERENCES invasivesbc.mechanical_treatment_issue_code(mechanical_treatment_issue_code_id) ON DELETE SET NULL;


--
-- Name: mechanical_treatment_observation mechanical_treatment_observation_mechanical_treatment_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_treatment_observation
    ADD CONSTRAINT mechanical_treatment_observation_mechanical_treatment_id_fkey FOREIGN KEY (mechanical_treatment_id) REFERENCES invasivesbc.mechanical_treatment(mechanical_treatment_id) ON DELETE CASCADE;


--
-- Name: mechanical_treatment_observation mechanical_treatment_observation_observation_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_treatment_observation
    ADD CONSTRAINT mechanical_treatment_observation_observation_id_fkey FOREIGN KEY (observation_id) REFERENCES invasivesbc.observation(observation_id) ON DELETE CASCADE;


--
-- Name: mechanical_treatment mechanical_treatment_space_geom_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_treatment
    ADD CONSTRAINT mechanical_treatment_space_geom_id_fkey FOREIGN KEY (space_geom_id) REFERENCES invasivesbc.space_geom(space_geom_id) ON DELETE SET NULL;


--
-- Name: mechanical_treatment mechanical_treatment_species_agency_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_treatment
    ADD CONSTRAINT mechanical_treatment_species_agency_code_id_fkey FOREIGN KEY (species_agency_code_id) REFERENCES invasivesbc.species_agency_code(species_agency_code_id) ON DELETE SET NULL;


--
-- Name: mechanical_treatment mechanical_treatment_treatment_provider_contractor_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_treatment
    ADD CONSTRAINT mechanical_treatment_treatment_provider_contractor_id_fkey FOREIGN KEY (treatment_provider_contractor_id) REFERENCES invasivesbc.treatment_provider_contractor(treatment_provider_contractor_id) ON DELETE SET NULL;


--
-- Name: mechanical_treatment mechanical_treatment_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.mechanical_treatment
    ADD CONSTRAINT mechanical_treatment_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: observation_aspect_code observation_aspect_code_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_aspect_code
    ADD CONSTRAINT observation_aspect_code_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: observation_aspect_code observation_aspect_code_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_aspect_code
    ADD CONSTRAINT observation_aspect_code_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: observation_chemical_treatment observation_chemical_treatment_chemical_treatment_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_chemical_treatment
    ADD CONSTRAINT observation_chemical_treatment_chemical_treatment_id_fkey FOREIGN KEY (chemical_treatment_id) REFERENCES invasivesbc.chemical_treatment(chemical_treatment_id) ON DELETE CASCADE;


--
-- Name: observation_chemical_treatment observation_chemical_treatment_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_chemical_treatment
    ADD CONSTRAINT observation_chemical_treatment_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: observation_chemical_treatment observation_chemical_treatment_observation_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_chemical_treatment
    ADD CONSTRAINT observation_chemical_treatment_observation_id_fkey FOREIGN KEY (observation_id) REFERENCES invasivesbc.observation(observation_id) ON DELETE SET NULL;


--
-- Name: observation_chemical_treatment observation_chemical_treatment_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_chemical_treatment
    ADD CONSTRAINT observation_chemical_treatment_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: observation observation_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation
    ADD CONSTRAINT observation_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: observation_geometry_code observation_geometry_code_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_geometry_code
    ADD CONSTRAINT observation_geometry_code_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: observation_geometry_code observation_geometry_code_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_geometry_code
    ADD CONSTRAINT observation_geometry_code_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: observation observation_jurisdiction_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation
    ADD CONSTRAINT observation_jurisdiction_code_id_fkey FOREIGN KEY (jurisdiction_code_id) REFERENCES invasivesbc.jurisdiction_code(jurisdiction_code_id) ON DELETE CASCADE;


--
-- Name: observation observation_observation_aspect_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation
    ADD CONSTRAINT observation_observation_aspect_code_id_fkey FOREIGN KEY (observation_aspect_code_id) REFERENCES invasivesbc.observation_aspect_code(observation_aspect_code_id) ON DELETE SET NULL;


--
-- Name: observation observation_observation_proposed_action_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation
    ADD CONSTRAINT observation_observation_proposed_action_code_id_fkey FOREIGN KEY (observation_proposed_action_code_id) REFERENCES invasivesbc.observation_proposed_action_code(observation_proposed_action_code_id) ON DELETE SET NULL;


--
-- Name: observation observation_observation_slope_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation
    ADD CONSTRAINT observation_observation_slope_code_id_fkey FOREIGN KEY (observation_slope_code_id) REFERENCES invasivesbc.observation_slope_code(observation_slope_code_id) ON DELETE SET NULL;


--
-- Name: observation observation_observation_type_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation
    ADD CONSTRAINT observation_observation_type_code_id_fkey FOREIGN KEY (observation_type_code_id) REFERENCES invasivesbc.observation_type_code(observation_type_code_id) ON DELETE SET NULL;


--
-- Name: observation_proposed_action_code observation_proposed_action_code_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_proposed_action_code
    ADD CONSTRAINT observation_proposed_action_code_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: observation_proposed_action_code observation_proposed_action_code_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_proposed_action_code
    ADD CONSTRAINT observation_proposed_action_code_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: observation_slope_code observation_slope_code_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_slope_code
    ADD CONSTRAINT observation_slope_code_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: observation_slope_code observation_slope_code_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_slope_code
    ADD CONSTRAINT observation_slope_code_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: observation observation_soil_texture_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation
    ADD CONSTRAINT observation_soil_texture_code_id_fkey FOREIGN KEY (soil_texture_code_id) REFERENCES invasivesbc.soil_texture_code(soil_texture_code_id) ON DELETE SET NULL;


--
-- Name: observation observation_space_geom_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation
    ADD CONSTRAINT observation_space_geom_id_fkey FOREIGN KEY (space_geom_id) REFERENCES invasivesbc.space_geom(space_geom_id) ON DELETE SET NULL;


--
-- Name: observation observation_species_agency_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation
    ADD CONSTRAINT observation_species_agency_code_id_fkey FOREIGN KEY (species_agency_code_id) REFERENCES invasivesbc.species_agency_code(species_agency_code_id) ON DELETE SET NULL;


--
-- Name: observation observation_species_density_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation
    ADD CONSTRAINT observation_species_density_code_id_fkey FOREIGN KEY (species_density_code_id) REFERENCES invasivesbc.species_density_code(species_density_code_id) ON DELETE SET NULL;


--
-- Name: observation observation_species_distribution_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation
    ADD CONSTRAINT observation_species_distribution_code_id_fkey FOREIGN KEY (species_distribution_code_id) REFERENCES invasivesbc.species_distribution_code(species_distribution_code_id) ON DELETE SET NULL;


--
-- Name: observation observation_species_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation
    ADD CONSTRAINT observation_species_id_fkey FOREIGN KEY (species_id) REFERENCES invasivesbc.species(species_id) ON DELETE CASCADE;


--
-- Name: observation observation_specific_use_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation
    ADD CONSTRAINT observation_specific_use_code_id_fkey FOREIGN KEY (specific_use_code_id) REFERENCES invasivesbc.specific_use_code(specific_use_code_id) ON DELETE SET NULL;


--
-- Name: observation_type_code observation_type_code_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_type_code
    ADD CONSTRAINT observation_type_code_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: observation_type_code observation_type_code_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation_type_code
    ADD CONSTRAINT observation_type_code_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: observation observation_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observation
    ADD CONSTRAINT observation_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: observer_workflow observer_workflow_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observer_workflow
    ADD CONSTRAINT observer_workflow_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: observer_workflow observer_workflow_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.observer_workflow
    ADD CONSTRAINT observer_workflow_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: pesticide_employer_code pesticide_employer_code_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.pesticide_employer_code
    ADD CONSTRAINT pesticide_employer_code_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: pesticide_employer_code pesticide_employer_code_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.pesticide_employer_code
    ADD CONSTRAINT pesticide_employer_code_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: previous_ais_knowledge_source_code previous_ais_knowledge_source_code_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.previous_ais_knowledge_source_code
    ADD CONSTRAINT previous_ais_knowledge_source_code_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: previous_ais_knowledge_source_code previous_ais_knowledge_source_code_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.previous_ais_knowledge_source_code
    ADD CONSTRAINT previous_ais_knowledge_source_code_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: previous_inspection_source_code previous_inspection_source_code_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.previous_inspection_source_code
    ADD CONSTRAINT previous_inspection_source_code_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: previous_inspection_source_code previous_inspection_source_code_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.previous_inspection_source_code
    ADD CONSTRAINT previous_inspection_source_code_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: project_management_plan_code project_management_plan_code_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.project_management_plan_code
    ADD CONSTRAINT project_management_plan_code_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: project_management_plan_code project_management_plan_code_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.project_management_plan_code
    ADD CONSTRAINT project_management_plan_code_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: session_activity_code session_activity_code_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.session_activity_code
    ADD CONSTRAINT session_activity_code_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: session_activity_code session_activity_code_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.session_activity_code
    ADD CONSTRAINT session_activity_code_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: soil_texture_code soil_texture_code_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.soil_texture_code
    ADD CONSTRAINT soil_texture_code_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: soil_texture_code soil_texture_code_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.soil_texture_code
    ADD CONSTRAINT soil_texture_code_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: space_geom space_geom_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.space_geom
    ADD CONSTRAINT space_geom_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: space_geom space_geom_observation_geometry_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.space_geom
    ADD CONSTRAINT space_geom_observation_geometry_code_id_fkey FOREIGN KEY (observation_geometry_code_id) REFERENCES invasivesbc.observation_geometry_code(observation_geometry_code_id) ON DELETE SET NULL;


--
-- Name: space_geom space_geom_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.space_geom
    ADD CONSTRAINT space_geom_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: species_agency_code species_agency_code_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.species_agency_code
    ADD CONSTRAINT species_agency_code_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: species_agency_code species_agency_code_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.species_agency_code
    ADD CONSTRAINT species_agency_code_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: species species_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.species
    ADD CONSTRAINT species_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: species_density_code species_density_code_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.species_density_code
    ADD CONSTRAINT species_density_code_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: species_density_code species_density_code_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.species_density_code
    ADD CONSTRAINT species_density_code_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: species_distribution_code species_distribution_code_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.species_distribution_code
    ADD CONSTRAINT species_distribution_code_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: species_distribution_code species_distribution_code_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.species_distribution_code
    ADD CONSTRAINT species_distribution_code_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: species species_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.species
    ADD CONSTRAINT species_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: specific_use_code specific_use_code_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.specific_use_code
    ADD CONSTRAINT specific_use_code_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: specific_use_code specific_use_code_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.specific_use_code
    ADD CONSTRAINT specific_use_code_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: treatment_provider_contractor treatment_provider_contractor_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.treatment_provider_contractor
    ADD CONSTRAINT treatment_provider_contractor_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: treatment_provider_contractor treatment_provider_contractor_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.treatment_provider_contractor
    ADD CONSTRAINT treatment_provider_contractor_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: user_message user_message_creator_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.user_message
    ADD CONSTRAINT user_message_creator_user_id_fkey FOREIGN KEY (creator_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: user_message user_message_receiver_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.user_message
    ADD CONSTRAINT user_message_receiver_user_id_fkey FOREIGN KEY (receiver_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: user_role user_role_role_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.user_role
    ADD CONSTRAINT user_role_role_code_id_fkey FOREIGN KEY (role_code_id) REFERENCES invasivesbc.app_role_code(role_code_id) ON DELETE CASCADE;


--
-- Name: user_role user_role_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.user_role
    ADD CONSTRAINT user_role_user_id_fkey FOREIGN KEY (user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE CASCADE;


--
-- Name: user_session_activity user_session_activity_session_activity_code_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.user_session_activity
    ADD CONSTRAINT user_session_activity_session_activity_code_id_fkey FOREIGN KEY (session_activity_code_id) REFERENCES invasivesbc.session_activity_code(session_activity_code_id) ON DELETE SET NULL;


--
-- Name: user_session_activity user_session_activity_session_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.user_session_activity
    ADD CONSTRAINT user_session_activity_session_id_fkey FOREIGN KEY (session_id) REFERENCES invasivesbc.user_session(session_id) ON DELETE CASCADE;


--
-- Name: user_session user_session_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.user_session
    ADD CONSTRAINT user_session_user_id_fkey FOREIGN KEY (user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE CASCADE;


--
-- Name: water_body water_body_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.water_body
    ADD CONSTRAINT water_body_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: water_body water_body_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.water_body
    ADD CONSTRAINT water_body_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: watercraft_journey watercraft_journey_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.watercraft_journey
    ADD CONSTRAINT watercraft_journey_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: watercraft_journey watercraft_journey_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.watercraft_journey
    ADD CONSTRAINT watercraft_journey_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: watercraft_journey watercraft_journey_water_body_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.watercraft_journey
    ADD CONSTRAINT watercraft_journey_water_body_id_fkey FOREIGN KEY (water_body_id) REFERENCES invasivesbc.water_body(water_body_id) ON DELETE SET NULL;


--
-- Name: watercraft_journey watercraft_journey_watercraft_risk_assessment_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.watercraft_journey
    ADD CONSTRAINT watercraft_journey_watercraft_risk_assessment_id_fkey FOREIGN KEY (watercraft_risk_assessment_id) REFERENCES invasivesbc.watercraft_risk_assessment(watercraft_risk_assessment_id) ON DELETE SET NULL;


--
-- Name: watercraft_risk_assessment watercraft_risk_assessment_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.watercraft_risk_assessment
    ADD CONSTRAINT watercraft_risk_assessment_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: watercraft_risk_assessment watercraft_risk_assessment_high_risk_assessment_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.watercraft_risk_assessment
    ADD CONSTRAINT watercraft_risk_assessment_high_risk_assessment_id_fkey FOREIGN KEY (high_risk_assessment_id) REFERENCES invasivesbc.high_risk_assessment(high_risk_assessment_id) ON DELETE SET NULL;


--
-- Name: watercraft_risk_assessment watercraft_risk_assessment_observer_workflow_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.watercraft_risk_assessment
    ADD CONSTRAINT watercraft_risk_assessment_observer_workflow_id_fkey FOREIGN KEY (observer_workflow_id) REFERENCES invasivesbc.observer_workflow(observer_workflow_id) ON DELETE SET NULL;


--
-- Name: watercraft_risk_assessment watercraft_risk_assessment_previous_ais_knowledge_source_c_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.watercraft_risk_assessment
    ADD CONSTRAINT watercraft_risk_assessment_previous_ais_knowledge_source_c_fkey FOREIGN KEY (previous_ais_knowledge_source_code_id) REFERENCES invasivesbc.previous_ais_knowledge_source_code(previous_ais_knowledge_source_code_id) ON DELETE SET NULL;


--
-- Name: watercraft_risk_assessment watercraft_risk_assessment_previous_inspection_source_code_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.watercraft_risk_assessment
    ADD CONSTRAINT watercraft_risk_assessment_previous_inspection_source_code_fkey FOREIGN KEY (previous_inspection_source_code_id) REFERENCES invasivesbc.previous_inspection_source_code(previous_inspection_source_code_id) ON DELETE SET NULL;


--
-- Name: watercraft_risk_assessment watercraft_risk_assessment_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.watercraft_risk_assessment
    ADD CONSTRAINT watercraft_risk_assessment_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: wind_direction_code wind_direction_code_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.wind_direction_code
    ADD CONSTRAINT wind_direction_code_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- Name: wind_direction_code wind_direction_code_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: invasivesbc; Owner: invasivebc
--

ALTER TABLE ONLY invasivesbc.wind_direction_code
    ADD CONSTRAINT wind_direction_code_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES invasivesbc.application_user(user_id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

