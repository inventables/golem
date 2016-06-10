var Recorder = require('./lib/recorder');
var Proxy = require('./lib/proxy');
var ControlServer = require('./lib/controlserver');
var express = require('express');

var sourcePort = 1339;
var targetPort = 1340;
var httpPort = 8080;

// TODO - get this value into the client, where it's currently hardcoded.
var controlPort = 8081;

var recorder = Recorder();
var proxy = Proxy(sourcePort, targetPort, {
  onSourceMessage: function (text, next) {
    recorder.onMessage(Recorder.OUTBOUND, text);
    next(text);
  },
  onTargetMessage: function (text, next) {
    recorder.onMessage(Recorder.INBOUND, text);
    next(text);
  }});

proxy.start();

var controlServer = ControlServer(httpPort, controlPort, __dirname + '/public');
controlServer.start({});
