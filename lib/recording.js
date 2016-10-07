var Immutable = require('Immutable');
var fs = require('fs');
var escape = require('js-string-escape');
var mustache = require('mustache');

var Recording = function (name) {

  var eventStream = Immutable.List();
  var writePos = 0;
  var readPos = 0;

  var loadingFailed = true;
  var loadError = null;

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
           eventStream.get(currentPos).source == "INBOUND") {

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
             eventStream.get(currentPos).source == "INBOUND") {
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
      "source": message.source,
      "message": message.source === "INBOUND" ? function(out, msg) { out(message.message); } : message.message
    });
    writePos++;
  };

  var advance = function(messageCallback) {
    console.log("readpos = " + readPos);
    console.log("eventStream size is "+ eventStream.size);
    while (readPos < eventStream.size &&
           eventStream.get(readPos).source === "INBOUND") {
      console.log("playing message " + readPos);
      var message = eventStream.get(readPos).message;
      if (arguments.length > 1) {
        message(messageCallback, arguments[1]);
      } else {
        message(messageCallback);
      }
      readPos++;
    }
  };

  var reset = function() {
    readPos = 0;
  };

  var advancePast = function(messageToMatch, messageCallback) {
    if (readPos < eventStream.size && eventStream.get(readPos).message == messageToMatch) {
      readPos++;
      advance(messageCallback, eventStream.get(readPos));
    } else if(readPos < eventStream.size) {
      console.log("Looking for \n" + eventStream.get(readPos).message + "\n but got \n" + messageToMatch);
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
