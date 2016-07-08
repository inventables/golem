var Immutable = require('Immutable');
var fs = require('fs');

var Recording = function (name) {

  var messages = Immutable.List();
  var writePos = 0;
  var readPos = 0;

  fs.readFile(name, function(err, data) {
    if (err) {
      // Nothing to do
    } else {
      // TODO - read in this data
    }
  });

  var save = function(onSuccess, onFailure) {

    fs.writeFile(name, messages.map(JSON.stringify).join("\n"), (err) => {
      if (err) {
        onFailure(err);
      } else {
        onSuccess();
      }
    });
  };

  var add = function(message) {
    messages = messages.push(message);
    writePos++;
  };

  var advance = function(messageCallback) {
    while (readPos < messages.size &&
           messages.get(readPos).source === "INBOUND") {
      messageCallback(messages.get(readPos));
      readPos++;
    }
  };

  var advancePast = function(messageToMatch, messageCallback) {
    if (readPos < messages.size && messages.get(readPos).message == messageToMatch) {
      readPos++;
      advance();
    }
  };

  return {
    add: add,
    save: save,
    advance: advance,
    advancePast: advancePast
  };
};

module.exports = Recording;
