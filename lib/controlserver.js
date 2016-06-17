var express = require('express');
var ws = require("nodejs-websocket");

var ControlServer = function(httpPort, websocketPort, staticDir) {
  var that = {};

  webserver = express();
  webserver.use(express.static(staticDir));

  var start = function(callbacks) {
    var onProxyStatus = callbacks.onProxyStatus || function(cb, conn) { };
    var onRecorderStatus = callbacks.onRecorderStatus || function(cb, conn) { };
    var onMessage = callbacks.onMessage || function(cb, conn) {};
    var getStatus = callbacks.getStatus || function() {};
    var startRecording = callbacks.startRecording || function() {};
    var stopRecording = callbacks.stopRecording || function() {};
    var closed = callbacks.closed || function(conn) {};

    webserver.listen (httpPort);
    var socketserver = ws.createServer(function(conn){

      onProxyStatus(function(status) {
        conn.sendText(JSON.stringify({topic: "proxy-status", data: status}));
      }, conn);

      onRecorderStatus(function(status) {
        conn.sendText(JSON.stringify({topic: "recorder-status", data: status}));
      }, conn);

      onMessage(function(message) {
        conn.sendText(JSON.stringify({topic: "message", data: message}));
      }, conn);

      conn.on("close", function(code, reason) {
        closed(conn);
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
