const PLAN_MY_TRIP_DB_MIGRATIONS_1 = [
  `CREATE TABLE PLAN_MY_TRIP
  (
    ID                 VARCHAR(64) NOT NULL UNIQUE PRIMARY KEY,
    GEOJSON            TEXT        NOT NULL,
    NAME               TEXT        NOT NULL,
    MAP_TILES          TEXT        NOT NULL,
    WMS_LAYERS         TEXT        NOT NULL,
    WELL_DATA          TEXT        NOT NULL,
    ACTIVITY_RECORDSET TEXT        NOT NULL,
    IAPP_RECORDSET     TEXT        NOT NULL
  );`
];

const MIGRATIONS = [
  {
    toVersion: 1,
    statements: PLAN_MY_TRIP_DB_MIGRATIONS_1
  }
];

export default MIGRATIONS;
