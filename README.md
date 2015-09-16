# winston-config-monitor [![Build Status](https://travis-ci.org/xsellier/winston-config-monitor.svg?branch=master)](https://travis-ci.org/xsellier/winston-config-monitor)

## Motivation
[winston](https://github.com/flatiron/winston) is designed to be a simple and universal logging library with support for multiple transports.
[winston-config](https://github.com/triplem/winston-config) is designed to configure winston via json files.

winston-config-monitor offers a file watcher over the config loader.

## Usage
You do have to put the `winston` dependency into your package.json. winston-config-monitor will not work correctly without this dependency
in your package.json.

winston-config-monitor can be used like described below:

``` js
  'use strict';

  var path                 = require('path');
  var winston              = require('winston');
  var winstonConfigMonitor = require('winston-config-monitor');

  var configFile     = path.join(process.cwd(), 'winston-options.json');
  var logOptions     = require(configFile);

  global.logger      = winstonConfigMonitor.getLogger();

  logger.exitOnError = true;

  // Clear all transport
  winstonConfigMonitor.clear();

  // Load dynamically all the logger options
  for (var transportName in logOptions.loggersOptions) {
    winstonConfigMonitor.add(winston.transports[transportName], configFile, 'loggersOptions.' + transportName);
  }

  module.exports = logger;
```

winston-options.json should be defines as below:

``` js
{
  "loggersOptions": {
    "Console": {
      "level"    : "debug",
      "colorize" : true
    },
    "File": {
      "timestamp" : true,
      "json"      : false,
      "filename"  : "logs/app.log",
      "maxFile"   : 5,
      "maxsize"   : 10485760,
      "level"     : "info"
    }
  }
}
```

## Installation

### Installing winston-config-monitor
```
  npm install winston-config-monitor --save
```

## Run Tests
All of the winston tests are written with mocha/chai/spy.

``` bash
  $ npm test
```

## Changelog
1.0.0

 - Declare a new winston as suggested in winston documentation. (Allow to stream log directly)

0.1.1

 - Fix an issue with [fs.watch](see: https://github.com/joyent/node/search?q=issues+fs.watch+twice&ref=cmdform&type=Issues)

0.1.0

- First release
