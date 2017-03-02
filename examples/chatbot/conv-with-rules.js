g = com.inventables.golem;

escape = require('js-string-escape');
util = require('util');


var sio = {
  inPattern: function(regex) {
    param = regex.toString().slice(1, -1);
    return new RegExp('^2\\[\\"message\\",\\"' + param + '\\"\\]$');
  },
  inMessage: function(msg) {
    return '2["message","' + msg + '"]';
  },
  outMessage: function(msg) {
    return util.format('2["message","%s"]', escape(JSON.stringify(msg)));
  }
};

g.output("0");
g.expect(g.pattern(sio.inPattern(/(\w+)/)), function(out, msg, match) {
  var colorMessage = {"type":"color", "data": "magenta"};
  var helloMessage = {"type": "message", "data": {"time": 1472834316527,
                                                  "author": "system",
                                              "text": "Hello, " + match}};

  out(sio.outMessage(colorMessage));
  out(sio.outMessage(helloMessage));
});

g.when(g.literal(sio.inMessage("What\'s up?")), function(out, msg) {
  var replyMessage = {"type": "message", "data": {"time": 1472834316527,
                                                  "author": "system",
                                                  "text": "Not too much"}};
  out(sio.outMessage(replyMessage));
});

g.expect(g.literal(sio.inMessage("Hi there")), function(out, msg) {
  var res = {"type": "message",
             "data": {"time": 1472834318896,
                      "text": "Hi there",
                      "author": "Bob",
                      "color": "magenta"}};

  out(sio.outMessage(res));
});

g.when(g.pattern(sio.inPattern(/I'm ([\w\s]+)/)), function(out, msg, match) {
  var replyMessage = {"type": "message", "data": {"time": 1472834316527,
                                                  "author": "system",
                                                  "text": "No, I&apos;M " + match}};

  out(sio.outMessage(replyMessage));
});

g.expect(g.literal(sio.inMessage("/time")), function(out, msg) {
  var res = {"type": "message",
             "data": {"time":1472834320618,
                      "text":"2016-09-02T16:38:40.618Z",
                      "author": "system",
                      "color": "black"}};
  out(sio.outMessage(res));
});
