var Immutable = require('Immutable');
var fs = require('fs');

var Recording = function (name) {

  var messages = Immutable.List();
  var writePos = 0;
  var readPos = 0;

  var loadingFailed = true;
  var loadError = null;

  if (fs.existsSync(name)) {
    data = fs.readFileSync(name, {encoding: 'utf8'});
    data.split("\n").forEach(function(message) {
      messages = messages.push(JSON.parse(message));
    });
  };

  var load = function() {
    return messages;
  };

  var save = function(onSuccess, onFailure) {

    fs.writeFile(name, messages.map(JSON.stringify).join("\n"), (err) => {
      if (err) {
        onFailure(err);
      } else {
        onSuccess();
        console.log("Saved. messages size is " + messages.size);
      }
    });
  };

  var add = function(message) {
    messages = messages.push(message);
    writePos++;
  };

  var advance = function(messageCallback) {
    console.log("readpos = " + readPos);
    console.log("messages size is "+ messages.size);
    while (readPos < messages.size &&
           messages.get(readPos).source === "INBOUND") {
      console.log("playing message " + readPos);
      messageCallback(messages.get(readPos).message);
      readPos++;
    }
  };

  var reset = function() {
    readPos = 0;
  };

  var advancePast = function(messageToMatch, messageCallback) {
    if (readPos < messages.size && messages.get(readPos).message == messageToMatch) {
      readPos++;
      advance(messageCallback);
    } else if(readPos < messages.size) {
      console.log("Looking for \n" + messages.get(readPos).message + "\n but got \n" + messageToMatch);
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
