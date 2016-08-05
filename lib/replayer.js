var Immutable = require('Immutable');
var Recording = require('./recording');

var Replayer = function(name) {

  var isReplayEnabled = false;
  var isReplaying = false;

  var recording = new Recording(name);
  var onStatusCallbacks = Immutable.List();
  var onMessageCallbacks = Immutable.List();

  var messageCallback = function(message) {
    onMessageCallbacks.forEach(function(cb) {
      cb(message);
    });
  };

  var getStatus = function() {
    onStatusCallbacks.forEach(function(cb) {
      cb(isReplayEnabled);
    });
  };

  var disable = function() {
    if (isReplayEnabled) {
      isReplaying = false;
      isReplayEnabled = false;
      getStatus();
    }
  };

  var enable = function(onMessage) {
    if (!isReplayEnabled) {
      messageCallback = onMessage;
      isReplayEnabled = true;
      getStatus();
    }
  };

  var start = function() {
    if (!isReplaying && isReplayEnabled) {
      isReplaying = true;
      recording.advance(messageCallback);
    }
  };

  var reset = function() {
    if (isReplaying) {
      isReplaying = false;
      recording.reset();
    }
  };


  var receiveMessage = function(message) {
    if (isReplaying) {
      recording.advancePast(message, messageCallback);
    }
  };

  var onStatus = function(callback) {
    onStatusCallbacks = onStatusCallbacks.push(callback);
  };

  var onMessage = function(callback) {
    onMessageCallbacks = onMessageCallbacks.push(callback);
  };

  return {
    enable: enable,
    disable: disable,
    start: start,
    reset: reset,
    receiveMessage: receiveMessage,
    getStatus: getStatus,
    onStatus: onStatus,
    onMessage: onMessage
  };
};

module.exports = Replayer;
