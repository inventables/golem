var engineIoServer = require('engine.io');
var engineIoClient = require('engine.io-client');

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

  that.connected = function() {
    return connected;
  };

  return that;
};

var Proxy = function(sourcePort, targetPort) {


  var isReplaying = false;

  var statusCallbacks = [];

  var sendMessageToSource = function(message) {};

  var connectionState = ConnectionState(function(newState) {
    statusCallbacks.forEach(function(cb) {
      cb(newState);
    });
  });

  var startReplay = function() {
    isReplaying = true;
    return function(message) {
      sendMessageToSource(message);
    };
  };

  var stopReplay = function() {
    isReplaying = false;
  };

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

    var httpServer = http.createServer();
    var app = httpServer.listen(sourcePort);;
    var server = engineIoServer.attach(app);

    httpServer.on('upgrade', function(req, socket, head) {
      server.handleUpgrade(req, socket, head);
    });

    httpServer.on('request', function(req, res){
      server.handleRequest(req, res);
    });


    var passThroughMode = function(sourceConnection) {
       // TODO: get targetPath from sourceConnection.request.url (this requires some troubleshooting)
      targetPath = "/socket.io/";

      var targetConnection = engineIoClient("ws://localhost:" + targetPort,
                                            { path: targetPath,
                                              extraHeaders:
                                             {
                                               origin: sourceConnection.request.headers.origin
                                             }});

      sourceConnection.on("message", function(message) {
        onSourceMessage(message, function(message) { targetConnection.send(message);});
      });

      sourceConnection.on("close", function() {
        console.log("source disconnected");
        targetConnection.close();
        connectionState.disconnect();
      });

      targetConnection.on("open", function() {
        console.log("we have a target connection");
        connectionState.connect();
      });

      targetConnection.on("error", function(error) {
        console.log("Received connection error: " + error);
      });

       targetConnection.on("message", function(message) {
        onTargetMessage(message, function(message) { sourceConnection.send(message);});
      });

      targetConnection.on("close", function() {
        console.log("target disconnected");
        sourceConnection.close();
        connectionState.disconnect();
      });
    };

    var playbackMode = function(sourceConnection) {
      sendMessageToSource = function(message) {
        console.log("sending message: " + message);
        sourceConnection.send(message);
      };

      sourceConnection.on("message", function(message) {
        console.log("received source message");
        onSourceMessage(message, function(message) {});
      });

      sourceConnection.on("close", function() {
        connectionState.disconnect();
        sendMessageToSource = function() {};
      });

      connectionState.connect();
    };

    server.on('connection', function(sourceConnection) {
      if (isReplaying) {
        playbackMode(sourceConnection);
      } else {
        passThroughMode(sourceConnection);
      }
    });
  };

  var getStatus = function() {
    statusCallbacks.forEach(function(cb) {
      cb(connectionState.connected());
    });
  };

  return {
    start: start,
    getStatus: getStatus,
    startReplay: startReplay,
    stopReplay: stopReplay
  };
};

module.exports = Proxy;
