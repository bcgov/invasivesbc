export default [
  `CREATE TABLE persisted_store
   (
     k     varchar(255) not null primary key,
     value text         null
   );`,
  `CREATE INDEX IF NOT EXISTS persisted_store_key on persisted_store (k);`
];
