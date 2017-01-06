var Immutable = require('Immutable');
var fs = require('fs');
var escape = require('js-string-escape');
var mustache = require('mustache');
var util = require('util');

var Recording = function (name) {

  var eventStream = Immutable.List();
  var writePos = 0;
  var readPos = 0;
  var rules = Immutable.List();

  var loadingFailed = true;
  var loadError = null;

  var ruleFactories = {
    "literal": function(matcher, application) {
      return {
        matches: function(messageToMatch) {
          return messageToMatch === matcher.value;
        },
        apply: function(messageCallback, matchedMessage) {
          return application(messageCallback, matchedMessage);
        },
        matcherDescription: function() {
          return matcher.value;
        }};
    },
    "pattern": function(matcher, application) {
      console.log("Adding pattern of " + application);
      return {
        matches: function(messageToMatch) {
          return matcher.value.test(messageToMatch);
        },
        apply: function(messageCallback, matchedMessage) {
          var match = matcher.value.exec(matchedMessage);
          return application.apply(this, [messageCallback, matchedMessage].concat(match.slice(1)));
        },
        matcherDescription: function() {
          return "PATTERN:" + matcher.value;
        }
      };
    }
  };

  var loadEvents = function(data) {

    var ret = Immutable.List();

    var org = { inventables:
                { golem: {
                  output: function(msg) {
                    ret = ret.push({type: "INBOUND", message: function(out) {
                      out(msg);
                    }});
                  },
                  literal: function(s) {
                    return {type: "literal",
                            value: s};
                  },
                  pattern: function(p) {
                    return {type: "pattern",
                            value: p};
                  },
                  when: function(matcher, onMatch) {
                    // todo - return a rule handle to allow unsetting rules
                    ret = ret.push({type: "RULE_ADD",
                                    matchType: matcher.type,
                                    matcher: matcher,
                                    application: onMatch
                                   });
                  },
                  expect: function(matcher, onMatch) {
                    ret = ret.push({type: "OUTBOUND", message: matcher.value});
                    ret = ret.push({type: "INBOUND", message: onMatch });
                  }
                }}};

    eval(data);
    return ret;
  };

  if (fs.existsSync(name)) {
    data = fs.readFileSync(name, {encoding: 'utf8'});
    eventStream = loadEvents(data);
  };

  var load = function() {
    return eventStream;
  };

  var save = function(onSuccess, onFailure) {
    var outfile = "g = org.inventables.golem;\n\n";

    var currentPos = 0;
    while (currentPos < eventStream.size &&
           eventStream.get(currentPos).type == "INBOUND") {

      var outtemplate = { message: null };
      eventStream.get(currentPos).message(function(s) {
        outtemplate.message = escape(s);
      });

      outfile += mustache.render('g.output("{{{message}}}");\n', outtemplate);
      currentPos++;
    }

    while (currentPos < eventStream.size) {
      message = eventStream.get(currentPos);
      var template = { outermessage: escape(eventStream.get(currentPos).message),
                       innermessage: ""};
      currentPos++;

      while (currentPos < eventStream.size &&
             eventStream.get(currentPos).type == "INBOUND") {
        eventStream.get(currentPos).message(function(s) {
          template.innermessage += mustache.render('  out("{{{message}}}");\n', {message: escape(s) } );
        });
        currentPos++;
      }

      console.log("template is " + template.outermessage);
      outfile += mustache.render('g.expect(g.literal("{{{outermessage}}}"), function(out, msg) {\n{{{innermessage}}} });\n\n', template);
    }

    fs.writeFile(name, outfile, (err) => {
      if (err) {
        onFailure(err);
      } else {
        onSuccess();
        console.log("Saved. eventStream size is " + eventStream.size);
      }
    });
  };

  var add = function(message) {
    eventStream = eventStream.push({
      "id": message.id,
      "type": message.type,
      "message": message.type === "INBOUND" ? function(out, msg) { out(message.message); } : message.message
    });
    writePos++;
  };

  var advance = function(messageCallback) {

    var processNext = function(message) {
      switch (message.type) {
      case "INBOUND":
        console.log("playing an inbound message");
        if (arguments.length > 1) {
          message.message(messageCallback, arguments[1]);
        } else {
          message.message(messageCallback);
        }
        return true;
      case "RULE_ADD":
        console.log("Adding rule for " + util.inspect(message.matcher));
        rules = rules.push(ruleFactories[message.matchType](message.matcher, message.application));
        return true;
      default:
        return false;
      }};

    console.log("readpos = " + readPos);
    console.log("eventStream size is "+ eventStream.size);
    while(readPos < eventStream.size &&
          processNext(eventStream.get(readPos))) {
      readPos++;
    }
  };

  var reset = function() {
    readPos = 0;
  };

  var advancePast = function(messageToMatch, messageCallback) {
    rules.forEach(function(rule) {
      if (rule.matches(messageToMatch)) {
        console.log("Applying rule");
        rule.apply(messageCallback, messageToMatch);
      } else {
        console.log("Rule does not match: " + rule.matcherDescription());
      }
      return true;
    });

    if (readPos < eventStream.size && eventStream.get(readPos).message == messageToMatch) {
      readPos++;
      advance(messageCallback, eventStream.get(readPos));
    } else if(readPos < eventStream.size) {
      console.log("Looking for \n" + util.inspect(eventStream.get(readPos)) + "\n but got \n" + messageToMatch);
    }
  };

  return {
    add: add,
    save: save,
    load: load,
    advance: advance,
    reset: reset,
    advancePast: advancePast
  };
};

module.exports = Recording;
