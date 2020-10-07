'use strict';
const deploySchemaspyTask = require('./lib/schemaspy.deploy.js');
const config = require('./lib/config.js');

const settings = { ...config, phase: settings.options.env };

// deploy schemaspy
deploySchemaspyTask(settings);
