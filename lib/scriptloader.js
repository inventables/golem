var fs = require('fs');
var Immutable = require('Immutable');

var ScriptLoader = function() {

data = fs.readFileSync("savedrecording.js", {encoding: 'utf8'});
  var messages = function() {

    var ret = Immutable.List();

    // We want output to behave differently depending on on when it's being run
    // While eval'ing the conversation script, we want to defer output.
    // When we're executing the coversation, we want the output to occur
    var outputFn = function(msg) {
      ret = ret.push({source: "INBOUND", message: function() {
        outputFn(msg);
      }});
    };

    var org = { inventables:
                { golem: {
                  output: function(msg) {
                    // We need to stay wrapped in a function because when the value of outputFn changes, we want the behvaior of this function to change
                    outputFn(msg);
                  },
                  literal: function(s) {
                    return {type: "literal",
                            value: s};
                  },
                  expect: function(matcher, onMatch) {
                    ret = ret.push({source: "OUTBOUND", message: matcher.value});
                    ret = ret.push({source: "INBOUND", message: onMatch });
                  }
                }}};

    eval(data);

    // Now that we've evaled the script, when we encounter outputs, we no longer want to defer
    outputFn = function(msg) {
      console.log("OUTPUTTING:" + msg);
    };
    return ret;
  };

  return {messages: messages};

};

module.exports = ScriptLoader;
