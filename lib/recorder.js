var Immutable = require('Immutable');

var Recorder = function(recording) {
  var lastMessageId = 0;
  var onStatusCallbacks = Immutable.List();
  var onMessageCallbacks = Immutable.List();

  var isRecording = false;
  var seenMessages = Immutable.List();

  seenMessages = recording.load();

  var getStatus = function() {
    onStatusCallbacks.forEach(function(cb) {
      cb(isRecording);
    });
  };

  var start = function() {
    if (!isRecording) {
      isRecording = true;
      getStatus ();
    }
  };

  var stop = function() {
    if (isRecording) {
      isRecording = false;
      getStatus ();
    }
  };

  var save = function(onSuccess, onFailure) {
    recording.save(onSuccess, onFailure);
  };

  var getMessages = function() {
    return seenMessages;
  };


  var receiveMessage = function(source, text) {
    var messageId = lastMessageId++;


    message = {"id": messageId,
               "type": source,
               "message": text,
               "recorded": isRecording};
    if (isRecording) {
      recording.add(message);
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
