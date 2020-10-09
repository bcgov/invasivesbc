'use strict';
const config = require('./config.js');
const seedTask = require('./lib/seed.js');

const settings = { ...config, phase: config.options.env };

seedTask(settings);
