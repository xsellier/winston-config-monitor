var fs                   = require('fs');
var winstonConfigMonitor = require('../lib/winston-config-monitor');
var winston              = require('winston');
var chai                 = require('chai');
var _                    = require('lodash');
var sinon                = require('sinon');
var spies                = require('chai-spies');

chai.use(spies);

var should          = chai.should();
var expect          = chai.expect;
var logger          = winstonConfigMonitor.getLogger();
var spyLoggerAdd    = chai.spy(logger.add);
var spyLoggerRemove = chai.spy(logger.remove);

logger.add          = spyLoggerAdd;
logger.remove       = spyLoggerRemove;

describe("The winston-config-monitor", function() {

  beforeEach(function(done) {
    winstonConfigMonitor.clear();
    done();
  });

  it("should load a well formed config file correctly", function(done) {
    var configFile      = "test/mock/winston-options-valid.json";

    winstonConfigMonitor.add(winston.transports.Console, configFile, "loggersOptions.Console");
    winstonConfigMonitor.add(winston.transports.File, configFile, "loggersOptions.File");

    fs.readFile(configFile, function(err, data) {
      var fileContent = JSON.parse(data);

      fileContent.loggersOptions.Console.level = "debug";

      fs.writeFile(configFile, JSON.stringify(fileContent, null, 2), function(err) {
        expect(err).to.not.exist;

        expect(spyLoggerAdd).to.have.been.called.exactly(2);
        expect(spyLoggerRemove).to.have.been.called.exactly(0);

        setTimeout(function() {
          fileContent.loggersOptions.Console.level = "info";
          fs.writeFile(configFile, JSON.stringify(fileContent, null, 2), function(err) {

            expect(spyLoggerAdd).to.have.been.called.exactly(4);
            expect(spyLoggerRemove).to.have.been.called.exactly(2);

            expect(fs.existsSync(fileContent.loggersOptions.File.filename)).to.be.true;
            fs.unlinkSync(fileContent.loggersOptions.File.filename);

            done();
          });
        }, 1000);
      });
    });
  });

  it("shouldn't load a bad formed config file", function(done) {
    var configFile = "test/mock/winston-options-invalid.json";
    var addConsole = function() {
      winstonConfigMonitor.add(winston.transports.Console, configFile, "loggersOptions.Console");
    };

    var addFile = function() {
      winstonConfigMonitor.add(winston.transports.File, configFile, "loggersOptions.File");
    };

    expect(addConsole).to.throw(/Could not parse JSON file at file path/);
    expect(addFile).to.throw(/Could not parse JSON file at file path/);

    done();
  });

  it("shouldn't load a well formed config file with an invalid logger options", function(done) {
    var configFile = "test/mock/winston-options-valid.json";
    var addConsole = function() {
      winstonConfigMonitor.add(winston.transports.Console, configFile, "loggersOptions.console");
    };

    var addFile = function() {
      winstonConfigMonitor.add(winston.transports.File, configFile, "loggersOptions.unknown");
    };

    expect(addConsole).to.throw(/Loggers options are invalid/);
    expect(addFile).to.throw(/Loggers options are invalid/);

    done();
  });
});

