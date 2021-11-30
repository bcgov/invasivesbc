cd database
source ../.env && export DB_HOST=localhost && export REACT_APP_REAL_NODE_ENV=local
npx knex migrate:latest --env local --knexfile src/knexfile-local.ts
npx knex seed:run --env local --knexfile src/knexfile-local.ts
