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
  var path               = require('path')
    , winstonConfMonitor = require('winston-config-monitor');

    var configFile       = "path/to/your/winston-options.json";

    winstonConfigMonitor.add(logger.transports.Console, configFile, "loggersOptions.console");
    winstonConfigMonitor.add(logger.transports.File, configFile, "loggersOptions.file");
```

winston-options.json should be defines as below:

``` js
{
  "loggersOptions": {
    "console": {
      "level": "info",
      "colorize": true
    },
    "file": {
      "timestamp": true,
      "json": false,
      "filename": "logs/app.log",
      "maxfiles": 5,
      "maxsize": 10485760,
      "level": "info"
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
0.1.1

 - Fix an issue with [fs.watch](see: https://github.com/joyent/node/search?q=issues+fs.watch+twice&ref=cmdform&type=Issues)

0.1.0

- First release

#### Author: [Xavier Sellier](http://github.com/xsellier)