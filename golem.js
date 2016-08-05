var Recorder = require('./lib/recorder');
var Replayer = require('./lib/replayer');
var Proxy = require('./lib/proxy');
var ControlServer = require('./lib/controlserver');
var express = require('express');
var Immutable = require('Immutable');

var sourcePort = 1339;
var targetPort = 1340;
var httpPort = 8080;

// TODO - get this value into the client, where it's currently hardcoded.
var controlPort = 8081;

var recordingName = "savedrecording.txt";
var recorder = Recorder(recordingName);
var replayer = Replayer(recordingName);

var controlServer = ControlServer(httpPort, controlPort, __dirname + '/public');

var proxyStatusCallbacks = Immutable.Map();
var recorderStatusCallbacks = Immutable.Map();
var replayerStatusCallbacks = Immutable.Map();
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
  onReplayerStatus: function(cb, conn) {
    replayerStatusCallbacks = replayerStatusCallbacks.update(conn,
                                                             Immutable.List(),
                                                             function(l) { return l.push(cb);});
  },
  onMessage: function(cb, conn) {
    messageCallbacks = messageCallbacks.update(conn,
                                               Immutable.List(),
                                               function(l) { return l.push(cb);});
}
  ,
  closed: function(conn) {
    proxyStatusCallbacks = proxyStatusCallbacks.delete(conn);
    recorderStatusCallbacks = recorderStatusCallbacks.delete(conn);
    replayerStatusCallbacks = replayerStatusCallbacks.delete(conn);
    messageCallbacks = messageCallbacks.delete(conn);
  },

  getStatus: function(conn) {
    proxy.getStatus();
    recorder.getStatus();
    replayer.getStatus();
  },
  getMessages: function(onMessages) {
    onMessages(recorder.getMessages());
  },

  startRecording: recorder.start,
  stopRecording: recorder.stop,
  saveRecording: recorder.save,
  startPlayback: function() {
    replayFunction = proxy.startReplay();
    replayer.enable(replayFunction);
  },
  stopPlayback: function() {
    replayer.disable();
    proxy.stopReplay();
  }
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

replayer.onStatus(function(status) {
  replayerStatusCallbacks.forEach(function(cbs) {
    cbs.forEach(function(cb) {
      cb(status);
    });
  });
});


proxy.start({
  onSourceMessage: function (text, next) {
    recorder.receiveMessage(Recorder.OUTBOUND, text);
    replayer.receiveMessage(text);
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
    if (status) {
      replayer.start();
    } else {
      replayer.reset();
    }
  }
});
