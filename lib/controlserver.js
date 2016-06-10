var express = require('express');
var ws = require("nodejs-websocket");

var ControlServer = function(httpPort, websocketPort, staticDir) {
  var that = {};

  webserver = express();
  webserver.use(express.static(staticDir));

  var start = function(callbacks) {
    var onStatus = callbacks.onStatus || function(cb) { };
    var getStatus = callbacks.getStatus || function() {};
    var startRecording = callbacks.startRecording || function() {};
    var stopRecording = callbacks.stopRecording || function() {};
    var onMessage = callbacks.onMessage || function(cb) {};

    webserver.listen (httpPort);
    var socketserver = ws.createServer(function(conn){

      onStatus(function(status) {
        conn.sendText(JSON.stringify({topic: "status", data: status}));
      });

      onMessage(function(message) {
        conn.sendText(JSON.stringify({topic: "message", data: message}));
      });

      conn.on("text", function(text) {
        switch(text) {
        case "status":
          getStatus();
          break;
        case "start":
          startRecording();
          break;
        case "stop":
          stopRecording();
          break;
        };
      });
    }).listen(websocketPort);
  };

  that.start = start;

  return that;
};

module.exports = ControlServer;
