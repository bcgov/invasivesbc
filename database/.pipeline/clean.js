'use strict';
const config = require('./config.js');
const cleanTask = require('./lib/clean.js');

const settings = { ...config, phase: settings.options.env };

cleanTask(settings);
