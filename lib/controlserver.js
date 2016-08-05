var express = require('express');
var ws = require("nodejs-websocket");

var ControlServer = function(httpPort, websocketPort, staticDir) {
  var that = {};

  webserver = express();
  webserver.use(express.static(staticDir));

  var startPlaybackCallbacks = [];
  var startPlayback = function() {
    startPlaybackCallbacks.forEach(function(cb){cb();});
  };

  var start = function(callbacks) {
    var onProxyStatus = callbacks.onProxyStatus || function(cb, conn) { };
    var onRecorderStatus = callbacks.onRecorderStatus || function(cb, conn) { };
    var onReplayerStatus = callbacks.onReplayerStatus || function(cb, conn) { };
    var onMessage = callbacks.onMessage || function(cb, conn) {};
    var getStatus = callbacks.getStatus || function() {};
    var getMessages = callbacks.getMessages || function(cb) {};
    var startRecording = callbacks.startRecording || function() {};
    var stopRecording = callbacks.stopRecording || function() {};
    var saveRecording = callbacks.saveRecording || function(onSuccess, onError) {};
    if (callbacks.startPlayback) {
      startPlaybackCallbacks.push(callbacks.startPlayback);
    }

    var stopPlayback = callbacks.stopPlayback || function() {};
    var closed = callbacks.closed || function(conn) {};

    webserver.listen (httpPort);
    var socketserver = ws.createServer(function(conn){

      onProxyStatus(function(status) {
        conn.sendText(JSON.stringify({topic: "proxy-status", data: status}));
      }, conn);

      onRecorderStatus(function(status) {
        conn.sendText(JSON.stringify({topic: "recorder-status", data: status}));
      }, conn);

      onReplayerStatus(function(status) {
        conn.sendText(JSON.stringify({topic: "replayer-status", data: status}));
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
        case "messages":
          getMessages(function(messages) {
            conn.sendText(JSON.stringify({topic: "messages", data: messages}));
          });
          break;
        case "start-recording":
          startRecording();
          break;
        case "stop-recording":
          stopRecording();
          break;
        case "start-playback":
          startPlayback();
          break;
        case "stop-playback":
          stopPlayback();
          break;
        case "save":
          var onSuccess = function() {
            conn.sendText(JSON.stringify({topic: "recording-saved"}));
          };
          var onFailure = function() {
            conn.sendText(JSON.stringify({topic: "recording-failed-save"}));
          };
          saveRecording(onSuccess, onFailure);;
          break;
        };
      });
    }).listen(websocketPort);
  };

  that.start = start;
  that.startPlayback = startPlayback;

  return that;
};

module.exports = ControlServer;
