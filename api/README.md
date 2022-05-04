# bcgov/invasivesbc/api

## Technologies Used

| Technology | Version | Website                              | Description          |
| ---------- | ------- | ------------------------------------ | -------------------- |
| node       | 10.x.x  | https://nodejs.org/en/               | JavaScript Runtime   |
| npm        | 6.x.x   | https://www.npmjs.com/               | Node Package Manager |
| PostgreSQL | 9.6     | https://www.postgresql.org/download/ | PSQL database        |

<br />

# Running Locally with Docker

See `./Makefile` for all available commands.

## Primary make commands

- Build and run a dockerized instance of the api, a postgresql database, and an nginx reverse proxy.

  ```
  make local
  ```

- Build and run a dockerized instance of the api, a postgresql database, and an nginx reverse proxy, in debug mode where all docker output is printed to the console:

  ```
  make local-debug
  ```

## Calling the API

Access the api directly: `localhost:3002/api/`

Access the api via the nginx reverse proxy: `localhost:80/api/`

<br />

# Running Locally without Docker

## Prerequisites

- A PostgreSQL database, with details matching the _DB\_\*_ variables in `./env_config/env.local`, is available.

## Commands

1. Download dependencies

```
npm install
```

2. Run the app

```
npm start
```

3. Go to http://localhost:3002/api/docs/ to verify that the application is running.

<br />

# API Specification

The API is defined in `api-doc.yaml`.

If this project is running locally, you can view the api docs at: `http://localhost:3002/api/docs/` or `http://localhost:7080/api/docs/` if running in Docker.

This project uses npm package `express-openapi` via `./app.ts` to automatically generate the express server and its routes, based on the contents of the `api-doc.yaml` and the `./src/path/` content.

- The endpoint paths are defined based on the folder structure of the `./src/paths/` folder.
  - Example: `<host>/api/activity` is handled by `./src/paths/activity.ts`
  - Example: `<host>/api/code/observation/plant` is handled by `./src/paths/code/observation/plant.ts`

Recommend reviewing the [Open API Specification](https://swagger.io/docs/specification/about/) before making any changes to the `api-doc.yaml` file.

_Note: This API currently uses OpenAPI 2.0, as 3.0 is not yet fully supported by many of the swagger libraries/tools used._

<br />

# Database Migrations

## Info

This api users `Knex` to manage and run database migrations.

A log of executed migrations can be found in the `migration` postgres table. Knex will not re-run a migration that has been run before (indicated by an entry in the `migration` table).

### Technologies used

- [Knex](http://knexjs.org/)

### Configuration file

- knexfile.ts

## Running migrations Locally

- Set up the environment variables required by the `knexfile.ts` config

  ```
  make setup-local
  ```

- Run migrations:

  ```
  npm run migrate:latest

  or

  npx knex migrate:latest
  ```

- Rollback last set of migrations:

  ```
  npm run migrate:rollback

  or

  npx knex migrate:rollback
  ```

- See other available Knex commands:

  ```
  npx knex --help
  ```

<br />

# Linting and Formatting

## Info

Linting and formatting is handled by a combiation of `ESlint` and `Prettier`. The reason for this, is that you get the best of both worlds: ESlint's larger selection of linting rules with Prettier's robust formatting rules. EditorConfig is additionally used to add enforce some basic IDE formatting rules.

### Technologies used

- [ESlint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [EditorConfig](http://editorconfig.org)

### Configuration files

- ESlint
  - .eslintrc
  - .eslintignore
- Prettier
  - .prettierrc
  - .prettierignore
- EditorConfig
  - .editorconfig

## Run Linters

- Lint the `*.ts` files using `ESLint`.

```
npm run lint
```

## Run Linters + Formatters

_Note: In the worst case scenario, where linting/formatting has been neglected, then these `lint-fix` commands have the potential to create 100's of file changes. In this case, it is recommended to only run these commands as part of a separate commit._

_Note: Not all linting/formatting errors can be automatically fixed, and will require human intervention._

- Lint and fix the `*.ts` files using `ESLint` + `Prettier`.

```
npm run lint-fix
```

<br />

# Logging

A centralized logger has been created (see `api/utils/logger.ts`).

## Logger configuration

The loggers log level can be configured via an environment variable: `LOG_LEVEL`

Set this variable to one of: `error`, `warn`, `info`, `debug`

Default value: `info`

## Instantiating the logger in your class/file

```
const log = require('./logger)('a meaningful label, typically the class name`)
```

## Using the logger

```
log.error({ label: 'functionName', message: 'Used when logging unexpected errors. Generally these will only exist in catch() blocks', error })

log.warn({ label: 'functionName', message: 'Used when logging soft errors. For example, if your request finished but returned a 404 not found' });

log.info({ label: 'functionName', message: 'General log messages about the state of the application' });

log.debug({ label: 'functionName', message: 'Useful for logging objects and other developer data', aJSONObjectToPrint, anotherObject);
or
log.debug({ label: 'functionName', message: 'Useful for logging objects and other developer data', someLabel: aJSONObjectToPrint, anotherObject });
```

Supported log properties:

```
- timestamp: overwrite the default time of `now` with your own timestamp.
- level: overwrite the default level (via log.<level>()) with your own level string.
- label: adds an additional label to the log message.
- message: a log message.
- <anyObject>: any additional object properties will be JSON.stringify'd and appended to the log message.
```

<br />

# Testing

- To access the API without logging in to the front end, you can manually add a user this way:

```
$ make database
$ psql
psql_prompt: insert into application_user (first_name, last_name, email,preferred_username) values ('micheal', 'wells', 'micheal.w.wells@bananasInPajamas.ca','officialUserName@idir');

psql_prompt: insert into user_role (user_id, role_code_id) values (8,3);
```

## Info

### Technologies used

- [Mocha](https://www.npmjs.com/package/mocha)
- [Chai](https://www.npmjs.com/package/chai)
- [SuperTest](https://www.npmjs.com/package/supertest)
- [Nock](https://www.npmjs.com/package/nock)

## Run Tests

- Run the unit tests

```
npm run test
```

<br />

# Keycloak

This project uses [Keycloak](https://www.keycloak.org/) to handle authentication.

# Troubleshooting

There can sometimes be issues with the validation of the API JSON Schema Specification. If this is ever noticed, few things to keep in mind are:

- Syntax errors or issues with naming within the spec
- `oneOf` errors where there are multiple fields in the spec that are all considered valid `oneOf` records. This can cause specific actions to fail such as syncing of records. To fix this, ensure that fields have required properties to make them unique

# GDAL Setup

## Mac CLI Install

`conda install -c conda-forge gdal`

> Make sure conda is installed for CLI install

### Go [here](https://gdal.org/download.html) for more info on other ways to install

# GDAL Usage

## Step 1: Pull your GeoJSON from the DB

Open up Dbeaver and run the SQL Console in the Local DB. After type: `SELECT geojson FROM invasivesbc.iapp_site_summary_and_geojson`

You should see an output on the bottom. You select all the values then right click the view and export data. Make sure you select JSON and then hit the next button until you can hit the proceed button.

## Step 2: Convert to GeoTiff

We need to change the file type of the data we just exported so that it's a .geojson file. Next wee need to convert that to a GeoTIFF: `gdal_rasterize -burn 255 -burn 0 -burn 0 -ts 360 240 data.geojson data.tiff`

> The burn values are for _red green blue_ > `-ts` is used for _size width_ and height which you can use `-tr` for resolution There are other file formats, but if need be look at the [docs](https://gdal.org/index.html)

**Mac solution** If you have troubles running any of the commands try `conda update -c rdonnellyr -c main --all`
