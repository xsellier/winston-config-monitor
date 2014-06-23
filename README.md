# winston-config-monitor [![Build Status](https://travis-ci.org/binogure/winston-config-monitor.png?branch=master)](http://travis-ci.org/binogure/winston-config-monitor)

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