var Immutable = require('Immutable');

var Recorder = function() {
  var currentRecord = Immutable.List();
  var onStatusCallbacks = Immutable.List();
  var onMessageCallbacks = Immutable.List();

  var recording = false;

  var getStatus = function() {
    onStatusCallbacks.forEach(function(cb) {
      cb(recording);
    });
  };

  var start = function() {
    if (!recording) {
      recording = true;
      getStatus ();
    }
  };

  var stop = function() {
    if (recordig) {
      recording = false;
      getStatus ();
    }
  };



  var save = function(filename) {
    // TODO
  };

  var receiveMessage = function(source, text) {
    if (recording) {
      currentRecord = currentRecord.push({"source": source,
                                          "message": text});
    }
    onMessageCallbacks.forEach(function(cb) {
      cb({"source": source,
          "message": text,
          "recorded": recording});
    });
  };

  var onStatus = function(callback) {
    onStatusCallbacks = onStatusCallbacks.push(callback);
  };

  var onMessage = function(callback) {
    onMessageCallbacks = onMessageCallbacks.push(callback);
  };

  var that = {};

  that.OUTBOUND = "OUTBOUND";
  that.INBOUND = "INBOUND";

  that.receiveMessage = onMessage;
  that.getStatus = getStatus;
  that.start = start;
  that.stop = stop;
  that.save = save;
  that.onStatus = onStatus;
  that.onMessage = onMessage;

  return that;
};

module.exports = Recorder;
