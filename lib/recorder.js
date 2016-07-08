var Immutable = require('Immutable');
var fs = require('fs');

var Recording = function (name) {

  var messages = Immutable.List();
  var pos = 0;

  fs.readFile(name, function(err, data) {
    if (err) {
      // Nothing to do
    } else {
      // TODO - read in this data
    }
  });

  var save = function(onSuccess, onFailure) {

    fs.writeFile(name, messages.map(JSON.stringify).join("\n"), (err) => {
      if (err) {
        onFailure(err);
      } else {
        onSuccess();
      }
    });
  };

  var add = function(message) {
    messages = messages.push(message);
    pos++;
  };

  var that = {};
  that.add = add;
  that.save = save;
  return that;

};

var Recorder = function() {
  var lastMessageId = 0;
  var recording = new Recording("savedrecording.txt");
  var onStatusCallbacks = Immutable.List();
  var onMessageCallbacks = Immutable.List();

  var isRecording = false;
  var seenMessages = Immutable.List();

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
               "source": source,
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
