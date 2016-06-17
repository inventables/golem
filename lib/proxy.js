var Immutable = require('Immutable');

var ws = require("nodejs-websocket");

var ConnectionState = function(onStateChange) {
  var that = {};
  var connected = false;

  that.connect = function() {
    if (!connected) {
      connected = true;
      onStateChange(true);
    }
  };

  that.disconnect = function() {
    if (connected) {
      connected = false;
      onStateChange(false);
    }
  };

  return that;
};

var Proxy = function(sourcePort, targetPort) {

  var that = {};

  var statusCallbacks = Immutable.List();

  var connectionState = ConnectionState(function(newState) {
    statusCallbacks.forEach(function(cb) {
      cb(newState);
    });
  });


  var start = function(callbacks) {
    var onSourceMessage = callbacks.onSourceMessage || function(text, next) {
      next(text);
    };

    var onTargetMessage = callbacks.onTargetMessage || function(text, next) {
      next(text);
    };

    if (callbacks.onStatus) {
      statusCallbacks.push(callbacks.onStatus);
    }
    console.log("starting the proxy server on " + sourcePort);
    var server = ws.createServer(function(sourceConnection) {
      console.log("We have a source connection - trying for the target");
      var targetConnection = ws.connect("ws://localhost:" + targetPort,
                                        {"extraHeaders": {"origin": sourceConnection.headers.origin}});


      sourceConnection.on("text", function(text) {
        onSourceMessage(text, function(text) { targetConnection.sendText(text);});
      });

      sourceConnection.on("close", function(code, reason) {
        targetConnection.close(code, reason);
        connectionState.disconnect();
      });

      targetConnection.on("connect", function() {
        console.log("we have a target connection");
        connectionState.connect();
      });

      targetConnection.on("text", function(text) {
        onTargetMessage(text, function(text) { sourceConnection.sendText(text);});
      });

      targetConnection.on("close", function(code, reason) {
        sourceConnection.close(code, reason);
        connectionState.disconnect();
      });

    }).listen(sourcePort);
  };

  var getStatus = function() {
    statusCallbacks.forEach(function(cb) {
      cb(connected);
    });
  };

  that.start = start;
  that.getStatus = getStatus;

  return that;
};

module.exports = Proxy;
