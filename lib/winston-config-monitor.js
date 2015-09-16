"use strict";

var fs             = require('fs');
var _              = require('lodash');
var Winston        = require('winston');
var winston        = new Winston.Logger({});

var loadConfigFile = function(filePath) {
  var config      = {};
  var fileContent = null;

  try {
    fileContent = fs.readFileSync(filePath, {encoding: 'utf8' });
  } catch (ioError) {
    throw new Error(ioError.message);
  }

  if (fileContent) {
    var fileConfig;
    var fileConfigKey;
    var fileConfigValue;

    try {
      config = JSON.parse(fileContent);
      winston.info("Using config file located at: %s", filePath);
    } catch (syntaxError) {
      throw new Error('Could not parse JSON file at file path [' + filePath + '], error: ' + syntaxError.message);
    }
  }

  return config;
};

module.exports = {
  _prefix      : "configFile_",
  configFiles  : {},
  watchedFiles : [],
  refreshing   : false,

  remove: function(transport) {
    var watchedFileLeft = []
      , fileToUnwatch   = null
      , keys            = Object.keys(this.configFiles);

    winston.remove(transport);

    for (var index = 0; index < keys.length; ++index) {
      var key = keys[index];
      if (this.configFiles[key].transport == transport) {
        delete this.configFiles[key];
      } else {
        watchedFileLeft.push(this.configFiles[key].configFile);
      }
    }

    fileToUnwatch    = _.difference(this.watchedFiles, watchedFileLeft);
    this.configFiles = watchedFileLeft;

    for (var index = 0; index < fileToUnwatch.length; ++index) {
      fs.unwatchFile(fileToUnwatch[fileToUnwatch]);
    }
  },

  clear: function() {
    for (var index = 0; index < this.watchedFiles.length; ++index) {
      fs.unwatchFile(this.watchedFiles[index]);
    }

    winston.clear();
    this.configFiles  = {};
    this.watchedFiles = [];
  },

  add: function(transport, configFile, optionsPath) {
    var uuid           = _.uniqueId(this._prefix)
      , fileContent    = loadConfigFile(configFile)
      , loggersOptions = fileContent;

    if (!_.isEmpty(optionsPath) && !_.isEmpty(fileContent)) {
      optionsPath = optionsPath.split(".");

      for (var index = 0; index < optionsPath.length; ++index) {
        var path = optionsPath[index];
        if (!_.isEmpty(loggersOptions)) {
          loggersOptions = loggersOptions[path];
        }
      }
    }

    if (!_.isEmpty(loggersOptions)) {
      this.configFiles[uuid]             = {};
      this.configFiles[uuid].transport   = transport;
      this.configFiles[uuid].configFile  = configFile;
      this.configFiles[uuid].optionsPath = optionsPath;
      this.configFiles[uuid].fileContent = fileContent;

      this.watchFile(configFile);

      winston.add(transport, loggersOptions);
    } else {
      throw new Error("Transport has not been added (Reason: Loggers options are invalid '"+ JSON.stringify(loggersOptions) + "').");
    }
  },

  watchFile : function(filePath) {
    var self = this;

    if (_.indexOf(self.watchedFiles, filePath < 0)) {
      self.watchedFiles.push(filePath);
      winston.info("Watching file [%s]", filePath);
      fs.watch(filePath, function (watchEvent, filename) {

        // To prevent successive calls
        if (self.refreshing == false) {
          self.refreshing = true;

          setTimeout(function() {

            var fileContent = null
              , keys        = Object.keys(self.configFiles);

            for (var index = 0; index < keys.length; ++index) {
              var key   = keys[index];
              var regex = new RegExp(filename + "$");

              if (!_.isEmpty(regex.exec(self.configFiles[key].configFile))) {
                if (_.isEmpty(fileContent)) {
                  fileContent = loadConfigFile(self.configFiles[key].configFile);
                }

                self.refresh(key, fileContent);
              }
            }

              self.refreshing = false;
          }, 100);
        }

      });
    }
  },

  refresh: function(uuid, fileContent) {
    var optionsPath    = this.configFiles[uuid].optionsPath
      , transport      = this.configFiles[uuid].transport
      , loggersOptions = fileContent;


    if (!_.isEmpty(optionsPath) && !_.isEmpty(fileContent)) {
      for (var index = 0; index < optionsPath.length; ++index) {
        var path = optionsPath[index];
        if (!_.isEmpty(loggersOptions)) {
          loggersOptions = loggersOptions[path];
        }
      }
    }

    if (!_.isEmpty(loggersOptions)) {
      this.configFiles[uuid].fileContent = fileContent;

      winston.remove(transport);

      winston.add(transport, loggersOptions);
      winston.info("Transport logger [%s] has been reloaded.", transport.prototype.name);
    }
  },

  getLogger: function() {
    return winston;
  }
};
