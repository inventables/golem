var Recorder = require('./lib/recorder');
var Proxy = require('./lib/proxy');
var ControlServer = require('./lib/controlserver');
var express = require('express');
var Immutable = require('Immutable');

var sourcePort = 1339;
var targetPort = 1340;
var httpPort = 8080;

// TODO - get this value into the client, where it's currently hardcoded.
var controlPort = 8081;

var recorder = Recorder();

var controlServer = ControlServer(httpPort, controlPort, __dirname + '/public');

var proxyStatusCallbacks = Immutable.Map();
var recorderStatusCallbacks = Immutable.Map();
var messageCallbacks = Immutable.Map();

var proxy = Proxy(sourcePort, targetPort);

controlServer.start({
  onProxyStatus: function(cb, conn) {
    proxyStatusCallbacks = proxyStatusCallbacks.update(conn,
                                             Immutable.List(),
                                             function(l) { return l.push(cb);});
  },
  onRecorderStatus: function(cb, conn) {
    recorderStatusCallbacks = recorderStatusCallbacks.update(conn,
                                                             Immutable.List(),
                                                             function(l) { return l.push(cb);});
  },
  onMessage: function(cb, conn) {
    messageCallbacks = messageCallbacks.update(conn,
                                               Immutable.List(),
                                               function(l) { return l.push(cb);});
  },
  closed: function(conn) {
    proxyStatusCallbacks = proxyStatusCallbacks.delete(conn);
    recorderStatusCallbacks = recorderStatusCallbacks.delete(conn);
    messageCallbacks = messageCallbacks.delete(conn);
  },

  getStatus: function() {
    proxy.getStatus();
    recorder.getStatus();
  },

  startRecording: recorder.start,

  stopRecording: recorder.stop
});

recorder.onStatus(function(status) {
  recorderStatusCallbacks.forEach(function(cbs) {
    cbs.forEach(function(cb) {
      cb(status);
    });
  });
});

recorder.onMessage(function(message) {
  messageCallbacks.forEach(function(cbs) {
    cbs.forEach(function(cb) {
      cb(message);
    });
  });
});

proxy.start({
  onSourceMessage: function (text, next) {
    recorder.receiveMessage(Recorder.OUTBOUND, text);
    next(text);
  },
  onTargetMessage: function (text, next) {
    recorder.receiveMessage(Recorder.INBOUND, text);
    next(text);
  },
  onStatus: function(status) {
    proxyStatusCallbacks.forEach(function(cbs) {
      cbs.forEach(function(cb) {
        cb(status);
      });
    });
  }
});
