const RECORD_CACHE_DB_MIGRATIONS_1 = [
  `CREATE TABLE CACHE_METADATA
   (
     SET_ID VARCHAR(64) NOT NULL UNIQUE PRIMARY KEY
   );`,
  `CREATE TABLE CACHED_RECORDS
   (
     ID   VARCHAR(64) NOT NULL UNIQUE PRIMARY KEY,
     DATA TEXT        NOT NULL -- store the stringified json
   );`,
  `CREATE TABLE CACHED_RECORD_TO_CACHE_METADATA
   (
     RECORD_ID         VARCHAR(64) NOT NULL,
     CACHE_METADATA_ID VARCHAR(64) NOT NULL,
     PRIMARY KEY (RECORD_ID, CACHE_METADATA_ID)
   );`
];

const RECORD_CACHE_DB_MIGRATIONS_2 = [
  `ALTER TABLE CACHED_RECORDS
   ADD COLUMN GEOJSON TEXT;`,
  `ALTER TABLE CACHED_RECORDS
   ADD COLUMN SHORT_ID TEXT;`
];

const RECORD_CACHE_DB_MIGRATIONS_3 = [
  `CREATE TABLE CACHED_IAPP_RECORDS
  (
    ID          VARCHAR(64) NOT NULL UNIQUE PRIMARY KEY,
    TABLE_DATA  TEXT NOT NULL,
    RECORD_DATA TEXT NOT NULL,
    GEOJSON     TEXT NOT NULL
  );`
];

const RECORD_CACHE_DB_MIGRATIONS_4 = [
  `ALTER TABLE CACHE_METADATA
    ADD COLUMN CACHE_TIME TEXT NOT NULL;`,
  `ALTER TABLE CACHE_METADATA
    ADD COLUMN STATUS TEXT NOT NULL;`,
  `ALTER TABLE CACHE_METADATA
    ADD COLUMN DATA TEXT NOT NULL;`
];

const RECORD_CACHE_DB_MIGRATIONS_5 = [
  `ALTER TABLE CACHED_RECORDS
    ADD COLUMN DATE_CREATED TEXT;`
];

// Recreate Tables used by SQLite, Adding more normalization and enhancing the queries we can do on data
const RECORD_CACHE_DB_MIGRATIONS_6 = [
  'DROP TABLE CACHED_RECORDS;',
  `CREATE TABLE CACHED_RECORDS(
    ID                         VARCHAR(64) NOT NULL UNIQUE PRIMARY KEY,
    LATITUDE                   NUMBER      NOT NULL,
    LONGITUDE                  NUMBER      NOT NULL,
    GEOJSON                    TEXT        NOT NULL,
    CENTROID                   TEXT        NOT NULL,
    DATA                       TEXT        NOT NULL,
    DATE_CREATED               TEXT        NOT NULL,
    ACTIVITY_ID                VARCHAR(64) NOT NULL,
    ACTIVITY_TYPE              TEXT        NOT NULL,
    SHORT_ID                   TEXT        NOT NULL,
    ACTIVITY_SUBTYPE           TEXT        NOT NULL,
    ACTIVITY_DATE              TEXT,
    PROJECT_CODE               TEXT,
    JURISDICTION_DISPLAY       TEXT,
    INVASIVE_PLANT             TEXT,
    SPECIES_POSITIVE_FULL      TEXT,
    SPECIES_NEGATIVE_FULL      TEXT,
    HAS_CURRENT_POSITIVE       TEXT,
    CURRENT_POSITIVE_SPECIES   TEXT,
    HAS_CURRENT_NEGATIVE       TEXT,
    CURRENT_NEGATIVE_SPECIES   TEXT,
    SPECIES_TREATED_FULL       TEXT,
    SPECIES_BIOCONTROL_FULL    TEXT,
    CREATED_BY                 TEXT,
    UPDATED_BY                 TEXT,
    AGENCY                     TEXT
  );`,
  `DROP TABLE CACHED_IAPP_RECORDS;`,
  `CREATE TABLE CACHED_IAPP_RECORDS
  (
    ID                                     VARCHAR(64) NOT NULL UNIQUE PRIMARY KEY,
    TABLE_DATA                             TEXT        NOT NULL,
    RECORD_DATA                            TEXT        NOT NULL,
    GEOJSON                                TEXT        NOT NULL,
    LATITUDE                               NUMBER      NOT NULL,
    LONGITUDE                              NUMBER      NOT NULL,
    SITE_ID                                TEXT,
    SITE_PAPER_FILE_ID                     TEXT,
    JURISDICTIONS_FLATTENED                TEXT,
    MIN_SURVEY                             TEXT,
    ALL_SPECIES_ON_SITE                    TEXT,
    BIOLOGICAL_AGENT                       TEXT,
    MAX_SURVEY                             TEXT,
    AGENCIES                               TEXT,
    HAS_BIOLOGICAL_TREATMENTS              TEXT,
    HAS_CHEMICAL_TREATMENTS                TEXT,
    HAS_MECHANICAL_TREATMENTS              TEXT,
    HAS_BIOLOGICAL_DISPERSALS              TEXT,
    MONITORED                              TEXT,
    REGIONAL_DISTRICT                      TEXT,
    REGIONAL_INVASIVE_SPECIES_ORGANIZATION TEXT,
    INVASIVE_PLANT_MANAGEMENT_AREA         TEXT
  );`,
  `DROP TABLE CACHE_METADATA;`,
  `CREATE TABLE CACHE_METADATA
   (
     SET_ID          VARCHAR(64) NOT NULL UNIQUE PRIMARY KEY,
     CACHE_TIME      TEXT        NOT NULL,
     STATUS          TEXT        NOT NULL,
     SET_NAME        TEXT,
     CACHED_IDS      TEXT,
     RECORD_SET_TYPE TEXT,
     CACHED_GEOJSON  TEXT,
     CACHED_CENTROID TEXT,
     BBOX            TEXT,
     FILTER_OBJECTS  TEXT
   );`
];

// Hold Migrations as named variable so we can use length to update the Db version automagically
// Note: toVersion must be an integer.
const MIGRATIONS = [
  {
    toVersion: 1,
    statements: RECORD_CACHE_DB_MIGRATIONS_1
  },
  {
    toVersion: 2,
    statements: RECORD_CACHE_DB_MIGRATIONS_2
  },
  {
    toVersion: 3,
    statements: RECORD_CACHE_DB_MIGRATIONS_3
  },
  {
    toVersion: 4,
    statements: RECORD_CACHE_DB_MIGRATIONS_4
  },
  {
    toVersion: 5,
    statements: RECORD_CACHE_DB_MIGRATIONS_5
  },
  {
    toVersion: 6,
    statements: RECORD_CACHE_DB_MIGRATIONS_6
  }
];

export default MIGRATIONS;
