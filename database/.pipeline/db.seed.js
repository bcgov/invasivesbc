'use strict';
const config = require('./lib/config.js');
const seedTask = require('./lib/seed.js');

const settings = { ...config, phase: settings.options.env };

seedTask(settings);
