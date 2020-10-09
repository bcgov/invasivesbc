'use strict';
const deploySchemaspyTask = require('./lib/schemaspy.deploy.js');
const config = require('./config.js');

const settings = { ...config, phase: config.options.env };

// deploy schemaspy
deploySchemaspyTask(settings);
