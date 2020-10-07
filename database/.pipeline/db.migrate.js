'use strict';
const config = require('./lib/config.js');
const migrateDatabaseTask = require('./lib/db.migrate.js');

const settings = { ...config, phase: settings.options.env };

// apply database migrations
migrateDatabaseTask(settings);
