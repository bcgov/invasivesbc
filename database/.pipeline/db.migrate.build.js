'use strict';
const config = require('./config.js');
const buildDatabaseMigrationTask = require('./lib/db.migrate.build.js');

const settings = { ...config, phase: config.options.env };

// build database migrations image
buildDatabaseMigrationTask(settings);
