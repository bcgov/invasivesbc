'use strict';
const config = require('./lib/config.js');
const deployDatabaseTask = require('./lib/db.deploy.js');

const settings = { ...config, phase: settings.options.env };

// deploying database
deployDatabaseTask(settings);
