g = com.inventables.golem;

escape = require('js-string-escape');
util = require('util');

g.output("0");
g.expect(g.literal("2[\"message\",\"Bob\"]"), function(out, msg) {
  var colorMessage = {"type":"color", "data": "magenta"};
  var helloMessage = {"type": "message", "data": {"time": 1472834316527,
                                                  "author": "system",
                                              "text": "Hello, Bob"}};

  out(util.format('2["message","%s"]', escape(JSON.stringify(colorMessage))));
  out(util.format('2["message","%s"]', escape(JSON.stringify(helloMessage))));
});

g.expect(g.literal('2["message","Hi there"]'), function(out, msg) {
  var res = {"type": "message",
             "data": {"time": 1472834318896,
                      "text": "Hi there",
                      "author": "Bob",
                      "color": "magenta"}};

  out(util.format('2["message", "%s"]', escape(JSON.stringify(res))));
});

g.expect(g.literal('2["message","/time"]'), function(out, msg) {
  var res = {"type": "message",
             "data": {"time":1472834320618,
                      "text":"2016-09-02T16:38:40.618Z",
                      "author": "system",
                      "color": "black"}};
  out(util.format('2["message","%s"]', escape(JSON.stringify(res))));
});
