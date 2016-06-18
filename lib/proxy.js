var Immutable = require('Immutable');

var socketIoServer = require('socket.io');
var socketIoClient = require('socket.io-client');

var http = require('http');

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
    var onSourceMessage = callbacks.onSourceMessage || function(message, next) {
      next(message);
    };

    var onTargetMessage = callbacks.onTargetMessage || function(message, next) {
      next(message);
    };

    if (callbacks.onStatus) {
      statusCallbacks.push(callbacks.onStatus);
    }

    var app = http.createServer();
    var io = socketIoServer.listen(app);

    // TODO - restrict this
    io.origins("easel.dev:80");

    app.listen(sourcePort, "0.0.0.0");
    var sockets = io.sockets;

    sockets.on('connection', function(sourceConnection) {
      console.log("We have a source connection - trying for the target");

      var targetConnection = socketIoClient("ws://localhost:" + targetPort,
                                            {extraHeaders:
                                             {
                                               origin: sourceConnection.handshake.headers.origin
                                             }});

      sourceConnection.on("message", function(message) {
        console.log("source message: " + message);
        onSourceMessage(message, function(message) { targetConnection.send(message);});
      });

      sourceConnection.on("disconnect", function() {
        console.log("source disconnected");
        targetConnection.disconnect();
        connectionState.disconnect();
      });

      targetConnection.on("connect", function() {
        console.log("we have a target connection");
        connectionState.connect();
      });

      targetConnection.on("error", function(error) {
        console.log("Received connection error: " + error);
      });

      targetConnection.on("event", function(msg) {
        console.log("EVENT");
        console.log(msg);
      });

      targetConnection.on("version", function(msg) {
        console.log("WTF");
      });

      targetConnection.on("message", function(message) {
        console.log("target message: " + message);
        onTargetMessage(message, function(message) { sourceConnection.send(message);});
      });

      targetConnection.on("disconnect", function() {
        console.log("target disconnected");
        sourceConnection.disconnect();
        connectionState.disconnect();
      });
    });
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
