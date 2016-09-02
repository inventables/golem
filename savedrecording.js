g = org.inventables.golem;

escape = require('js-string-escape');

g.output("0");

g.expect(g.literal("2[\"message\",\"Bob\"]"), function(msg) {
  var colorMessage = {"type":"color", "data": "magenta"};
  var helloMessage = {"type": "message", "data": {"time": 1472834316527,
                                              "text": "Hello, Bob"}};

  g.output(util.format('2["message", "%s"]', escape(JSON.stringify(colorMessage))));
  g.output(util.format('2["message", "%s"]', escape(JSON.stringify(helloMessage))));});

g.expect(g.literal('2["message", "Hi there"]'), function(msg) {
  var out = {"type": "message",
             "data": {"time": 1472834318896,
                      "text": "Hi there",
                      "author": "Bob",
                      "color": "magenta"}};

  g.output(util.format('2["message", "%s"]', escape(JSON.stringify(out))));
});

g.expect(g.literal('2["message", "/time"]'), function(msg) {
  var out = {"type": "message",
             "data": {"time":1472834320618,
                      "text":"2016-09-02T16:38:40.618Z",
                      "author": "system",
                      "color": "black"}};
  g.output(util.format('2["message", "%s"]', escape(JSON.stringify(out))));
});
