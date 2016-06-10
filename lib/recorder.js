var Immutable = require('Immutable');

var Recorder = function() {
  var currentRecord = Immutable.List();

  var recording = false;

  var start = function() {
    currentRecord = Immutable.List();
    recording = true;
  };

  var stop = function() {
    recording = false;
  };

  var save = function(filename) {
    // TODO
  };

  var onMessage = function(source, text) {
    if (recording) {
      currentRecord = currentRecord.push({"source": source,
                                          "message": text});
    }
  };

  var that = {};

  that.OUTBOUND = "OUTBOUND";
  that.INBOUND = "INBOUND";

  that.onMessage = onMessage;
  that.start = start;
  that.stop = stop;
  that.save = save;

  return that;
};

module.exports = Recorder;
