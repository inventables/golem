$(function () {
  "use strict";


  function getParameter( name ){
    var regex = new RegExp( "[\\?&]"+name+"=([^&#]*)"),
        results = regex.exec( window.location.search );
    if( results == null ){
      return "";
    } else{
      return decodeURIComponent(results[1].replace(/\+/g, " "));
    }
  }

  // for better performance - to avoid searching in DOM
  var content = $('#content');
  var input = $('#input');
  var status = $('#status');

  // my color assigned by the server
  var myColor = false;
  // my name sent to the server
  var myName = false;


 // open connection

  var port =  2338;

  var socket = io('http://127.0.0.1:' + port);

  socket.on('connect', function () {
    // first we want users to enter their names
    input.removeAttr('disabled');
    status.text('Choose name:');
  });

  socket.on('connect_error', function (error) {
    // just in there were some problems with conenction...
    content.html($('<p>', { text: 'Sorry, but there\'s some problem with your '
                            + 'connection or the server is down.' } ));
  });

  socket.on('message', function (message) {
    // try to parse JSON message. Because we know that the server always returns
    // JSON this should work without any problem but we should make sure that
    // the massage is not chunked or otherwise damaged.
    try {
      console.log(message);
      var json = JSON.parse(message);
    } catch (e) {
      console.log('This doesn\'t look like a valid JSON: ', message.data);
      return;
    }

    // NOTE: if you're not sure about the JSON structure
    // check the server source code above
    if (json.type === 'color') { // first response from the server with user's color
      myColor = json.data;
      status.text(myName + ': ').css('color', myColor);
      input.removeAttr('disabled').focus();
      // from now user can start sending messages
    } else if (json.type === 'history') { // entire message history
      // insert every single message to the chat window
      for (var i=0; i < json.data.length; i++) {
        addMessage(json.data[i].author, json.data[i].text,
                   json.data[i].color, new Date(json.data[i].time));
      }
    } else if (json.type === 'message') { // it's a single message
      input.removeAttr('disabled'); // let the user write another message
      addMessage(json.data.author, json.data.text,
                 json.data.color, new Date(json.data.time));
    } else {
      console.log('Hmm..., I\'ve never seen JSON like this: ', json);
    }
  });

    /**
   * Send mesage when user presses Enter key
   */
  input.keydown(function(e) {
    if (e.keyCode === 13) {
      var msg = $(this).val();
      if (!msg) {
        return;
      }
      // send the message as an ordinary text
      socket.send(msg);
      $(this).val('');

      // we know that the first message sent from a user their name
      if (myName === false) {
        myName = msg;
      }
    }
  });

  /**
   * Add message to the chat window
   */
  function addMessage(author, message, color, dt) {
    content.prepend('<p><span style="color:' + color + '">' + author + '</span> @ ' +
                    + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
                    + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
                    + ': ' + message + '</p>');
  }
});
