'use strict';

const config = require('./config.js');
const setupTask = require('./lib/setup.js');

const settings = { ...config, phase: config.options.env };

// Performs any general setup (ie: database migrations)
setupTask(settings);
