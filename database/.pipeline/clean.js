'use strict';
const config = require('./lib/config.js');
const cleanTask = require('./lib/clean.js');

const settings = { ...config, phase: settings.options.env };

cleanTask(settings);
