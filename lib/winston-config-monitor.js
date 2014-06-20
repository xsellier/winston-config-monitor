"use strict";

var fs             = require('fs')
  , _              = require('lodash')
  , winston        = require('winston');

winstonConfigMonitor = function() {
  this._prefix      = "configFile_";
  this.configFiles  = {};
  this.watchedFiles = [];

  this.addTransport = function(transport, configFile, optionsPath) {
    var uuid           = _.uniqueId(this._prefix)
      , loggersOptions = {}
      , fileContent    = this.loadConfigFile(configFile);

    if (!_.isEmpty(optionsPath) && !_.isEmpty(fileContent)) {
      optionsPath = optionsPath.split(".");

      for (var path in optionsPath) {
        if (!_.isEmpty(loggersOptions)) {
          loggersOptions = loggersOptions[path];
        }
      }
    } else {
      loggersOptions = fileContent;
    }

    if (!_.isEmpty(loggersOptions)) {
      this.configFiles[uuid].transport   = transport;
      this.configFiles[uuid].configFile  = configFile;
      this.configFiles[uuid].optionsPath = optionsPath;
      this.configFiles[uuid].fileContent = fileContent;

      this.watchFile(configFile);

      winston.add(transport, loggersOptions);
    } else {
      winston.log("Loggers options are invalid (%).", JSON.stringify(loggersOptions));
    }
  };

  this.refreshTransport = function(uuid, fileContent) {
    var optionsPath    = this.configFiles[uuid].optionsPath
      , loggersOptions = this.configFiles[uuid].loggersOptions;


    if (!_.isEmpty(optionsPath) && !_.isEmpty(fileContent)) {
      optionsPath = optionsPath.split(".");

      for (var path in optionsPath) {
        if (!_.isEmpty(loggersOptions)) {
          loggersOptions = loggersOptions[path];
        }
      }
    } else {
      loggersOptions = fileContent;
    }

    if (!_.isEmpty(loggersOptions)) {
      this.configFiles[uuid].transport   = transport;
      this.configFiles[uuid].fileContent = fileContent;

      winston.remove(transport).add(transport, loggersOptions);
      winston.info("Logger has been reloaded (%).", JSON.stringify(loggersOptions));
    } else {
      winston.info("Loggers options are invalid (%).", JSON.stringify(loggersOptions));
    }
  }

  this.watchFile = function(filePath) {
    var self = this;

    if (_.indexOf(this.watchedFiles, filePath < 0) {
      this.watchedFiles.push(filePath);

      fs.watch(filePath, function (watchEvent, filename) {
        winston.info("[%] was reloaded: %", filename, watchEvent);

        var fileContent = loadConfigFile(filename)
          , keys        = Object.key(configFiles);

        for (var index = 0; index < keys.length; ++index {
          var key = keys[index];
          if (configFiles[key].configFile == filename) {
            self.refreshTransport(key, fileContent);
          }
        }
      });
    }
  };

  this.loadConfigFile = function(filePath) {
    var config      = {}
      , fileContent = null;

    try {
      fileContent = fs.readFileSync filePath
    } catch (ioError) {
      winston.error("Cannot open [%s] (reason: %).", filePath, ioError);
    }

    if (fileContent) {
      var fileConfig
        , fileConfigKey
        , fileConfigValue;

      try {
        fileConfig = JSON.parse(fileContent);
        for (fileConfigKey in fileConfig) {
          fileConfigValue       = fileConfig[fileConfigKey];
          config[fileConfigKey] = fileConfigValue;
        }
        winston.info("Using config file located at: %s", filePath);
      } catch (syntaxError) {
        winston.error('Could not parse JSON file at file path [%s], error: %', filePath, syntaxError);
      }
    }

    return config;
  };

  this.getLogger = function() {
    return winston;
  }

  return this;
};

module.exports = winstonConfigMonitor