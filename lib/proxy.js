var ws = require("nodejs-websocket");

var Proxy = function(sourcePort, targetPort, callbacks) {

  var that = {};

  var onSourceMessage = callbacks.onSourceMessage || function(text, next) {
    next(text);
  };

  var onTargetMessage = callbacks.onTargetMessage || function(text, next) {
    next(text);
  };

  var onOpen = callbacks.onOpen || function() {};
  var onClose = callbacks.onClose || function() {};

  var start = function() {
    var server = ws.createServer(function(sourceConnection) {
      var targetConnection = ws.connect("ws://localhost:" + targetPort,
                                        {"extraHeaders": {"origin": sourceConnection.headers.origin}});

      sourceConnection.on("text", function(text) {
        onSourceMessage(text, function(text) { targetConnection.sendText(text);});
      });

      sourceConnection.on("close", function(code, reason) {
        targetConnection.close(code, reason);
        onClose();
      });

      targetConnection.on("text", function(text) {
        onTargetMessage(text, function(text) { sourceConnection.sendText(text);});
      });

      targetConnection.on("close", function(code, reason) {
        sourceConnection.close(code, reason);
        onClose();
      });

      onOpen();
    }).listen(sourcePort);
  };

  that.start = start;

  return that;
};

module.exports = Proxy;
