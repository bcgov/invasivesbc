# bcgov/invasivesbc/database


## Technologies Used

| Technology | Version | Website                              | Description          |
| ---------- | ------- | ------------------------------------ | -------------------- |
| node       | 10.x.x  | https://nodejs.org/en/               | JavaScript Runtime   |
| npm        | 6.x.x   | https://www.npmjs.com/               | Node Package Manager |
| PostgreSQL | 9.6     | https://www.postgresql.org/download/ | PSQL database        |

<br />

# Port forward to remote database

1. Open a terminal
2. Log in to OpenShift using the login command copied from the web-console
3. Get onto the correct project
   ```
   oc projects
   oc project <correct project name>
   ```
4. Find the database pod
   ```
   oc get pods
   ```
5. Port forward

   ```
   oc port-forward <pod name> <local port to use>:<remove port to forward>

   Ex:

   oc port-forward invasivesbci-db-postgresql-dev-deploy-100 5555:5432
   ```

<br />

# General PSQL commands

## Dumping the database

Doc: https://www.postgresql.org/docs/9.6/app-pgdump.html

```
pg_dump databaseName > dumpFileName
```

### Useful options:

    --schema-only
    --data-only

## Restoring the database from a dump

Doc: https://www.postgresql.org/docs/9.6/app-pgrestore.html

```
pg_restore dumpFileName
```

### Useful options:

    --schema-only
    --data-only

<br />

# Troubleshooting

`Error: knex: Required configuration option 'client' is missing.`

Run from database/src/: npx knex --knexfile ./knexfile.ts migrate:make <insert name here> --env local

- Double check that your environment variables have been set correctly.
- Double check that the line endings of the `.env` file are `LF` and not `CLRF`

# Development

## Database Migrations

Create a new Typescript migration file

```bash
knex migrate:make --env local -x ts filename
```

Run new migrations

```knex
knex migrate:latest --env local
```

## Seeding the Database

For running in Openshift. Mount the database on port 5432. Then run:

```bash
cd database/src
knex seed:run --env local --specific 05_riso.ts
```

For running on Docker

```bash
cd database/src
knex seed:run --env local --specific 09_pmp.ts --knexfile knexfile-local.ts
```

# Managing data in S3

For custom datasets that are too large to store in Github, we use an object store owned by the Ministry. The technology follows the Amazon S3 standard. Thus allowing us to use the AWS SDK to upload and manage large SQL backups.

There are helper functions for uploading and downloading S3 data in [file-utils.ts](../api/src/utils/file-utils.ts). You can see them being utilized in [media.ts](../api/src/paths/media.ts). This works well for software but isn't ideal for managing data and performing custom tasks.

## Installing the AWS-SDK

The Amazon _Software Development Kit (SDK)_ is used for manipulating all AWS cloud services. You need to install the entire tool to obtain the S3 commands we need. Luckily it is a Node Module much like all our other dependencies

```bash
npm -gi aws-sdk
```

## Configure

```bash
aws configure invasivesbc
```

You will be prompted to add a key and secret.

## List buckets

```bash
aws s3 --endpoint-url https://nrs.objectstore.gov.bc.ca --profile invasivesbc ls
```

## Create bucket

```bash
aws s3 --endpoint-url https://nrs.objectstore.gov.bc.ca --profile invasivesbc mb s3://seeds
```

## Upload public file

```bash
aws s3 cp ./aggregate.sql.gz s3://seeds/aggregate.sql.gz \
  --endpoint-url https://nrs.objectstore.gov.bc.ca \
  --profile invasivesbc \
  --acl public-read \
```

## List contents of a bucket

```bash
aws s3 --endpoint-url https://nrs.objectstore.gov.bc.ca --profile invasivesbc ls s3://seeds/
```

## Downloading data

```bash
curl https://nrs.objectstore.gov.bc.ca/seeds/aggregate.sql.gz > aggregate.sql.gz
```

# Backup Database from Prod

## Step 2: Pull down a prod backup

`oc projects` displays all projects on openshift credentials `oc project <prod project name>` assigs the project you want to use `oc get pods | grep <name of db> - | grep api - | grep backup -' shows pods

> grep narrows it down by looking for if the name has any matching cases

rsync to your computer

> can name anything, but this is more convenient and keep date current date for convenience `oc rsync <podname>:/backups/daily/2022-05-03/invasivesbci-db-postgresql-prod-InvasivesBC_2022-05-03_12-18-00.sql.gz .`

## Step 3: Apply to local docker db

to unzip the db backup `gzip -d invasivesbci-db-postgresql-prod-InvasivesBC_2022-05-03_12-18-00.sql.gz .`

to copy to docker container `docker cp invasivesbci-db-postgresql-prod-InvasivesBC_2022-05-03_12-18-00.sql.gz <docker_postgres_container>:/`

to go into the container `docker exec -it <docker_postgres_container> /bin/bash`

to log into the postgres db `psql -d InvasivesBC -U invasivebc`

drop schemas `drop schema public cascade;` `drop schema invasivesbc cascade;`

to apply db into database `create schema public;` `\i invasivesbci-db-...sql`

## Step 4: Run net new migrations

start setup container `docker start <docker_postgres_setup_container>`

logs the output of the setup container until it's finished `docker logs -f <docker_postgres_setup_container>`

> This is about observation so look if there's any errors which if it keeps restarting that's a problem
