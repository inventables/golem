var Immutable = require('Immutable');

var Recorder = function() {
  var lastMessageId = 0;
  var currentRecord = Immutable.List();
  var onStatusCallbacks = Immutable.List();
  var onMessageCallbacks = Immutable.List();

  var recording = false;
  var seenMessages = Immutable.List();

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
    if (recording) {
      recording = false;
      getStatus ();
    }
  };

  var save = function(filename) {
    // TODO
  };

  var getMessages = function(filename) {
    return seenMessages;
  };

  var receiveMessage = function(source, text) {
    var messageId = lastMessageId++;

    message = {"id": messageId,
               "source": source,
               "message": text,
               "recorded": recording};
    if (recording) {
      currentRecord = currentRecord.push(message);
    }

    seenMessages = seenMessages.push(message);

    onMessageCallbacks.forEach(function(cb) {
      cb(message);
    });
  };

  var onStatus = function(callback) {
    onStatusCallbacks = onStatusCallbacks.push(callback);
  };

  var onMessage = function(callback) {
    onMessageCallbacks = onMessageCallbacks.push(callback);
  };

  var that = {};

  that.receiveMessage = receiveMessage;
  that.getStatus = getStatus;
  that.getMessages = getMessages;
  that.start = start;
  that.stop = stop;
  that.save = save;
  that.onStatus = onStatus;
  that.onMessage = onMessage;

  return that;
};

Recorder.OUTBOUND = "OUTBOUND";
Recorder.INBOUND = "INBOUND";



module.exports = Recorder;
