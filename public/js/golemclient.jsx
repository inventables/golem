(function () {

  var OnOffState = function(startValue) {
    var self = this;

    var isOn = startValue;
    self.setState = function(val) {
      if (!isOn === val) {
        isOn = val;
        self.trigger('change', val);
      }
      isOn = val;
    };

    self.getState = function() {
      return isOn;
    };
  };

  MicroEvent.mixin(OnOffState);

  var recordState = new OnOffState(false);
  var proxyState = new OnOffState(false);
  var playbackState = new OnOffState(false);

  var Messages = function() {
    var initialized = false;
    var self = this;

    var messagesList = [];

    self.init = function(messages) {
      if (!initialized) {
        messagesList = messages;
        initialized = true;
        self.trigger('change', messagesList);
        console.log(messagesList)
      }
    };

    self.get = function() {
      return messagesList;
    };

    self.add = function(message) {
      if (initialized) {
        messagesList.push(message);
        self.trigger('change', messagesList);
      }
    };

    self.clear = function() {
      if (intialized) {
        messagesList = [];
        self.trigger('change', messagesList);
      }
    };
  };

  MicroEvent.mixin(Messages);
  var recordedMessages = new Messages();

  var ws = new WebSocket("ws://localhost:8081");
  ws.onopen = function(evt) {

    ws.onmessage = function(message) {
      var data = JSON.parse(message.data);
      switch(data.topic) {
      case "recorder-status":
        recordState.setState(data.data);
        break;
      case "replayer-status":
        playbackState.setState(data.data);
        break;
      case "proxy-status":
        proxyState.setState(data.data);
        break;
      case "messages":
        recordedMessages.init(data.data);
        break;
      case "message":
        recordedMessages.add(data.data);
          break;
      case "recording-saved":
        console.log("saved recording");
        break;
      case "recording-failed-save":
        console.log("failed to save recording");
        break;
      }
    };

    var MessagesList = React.createClass({
      getInitialState: function() {
        return { messages: recordedMessages.get() };
      },

      componentDidMount: function() {
        var component = this;
        recordedMessages.bind('change', function(messages) {
          component.setState({ messages: messages });
        });
        ws.send("messages");
      },

      render: function() {

        var messages = this.state.messages;

        var message = function(msg) {
          var msgClassName = msg.source + "-message"
          var direction = msg.source === "INBOUND" ? " ---> " : " <--- ";
          return <li key={msg.id} className={msgClassName}><span>{direction}</span><span>{msg.message}</span></li>;
        };

        return <ul className="recorded-messages">{messages.map(message)}</ul>;
      }

    });

    var ProxyState = React.createClass({
      getInitialState: function() {
        return { connected: proxyState.getState() };
      },

      componentDidMount: function() {
        var component = this;
        proxyState.bind('change', function(connected) {
          component.setState({connected: connected});
        });
        ws.send("status");
      },

      render: function() {
        return <div className="proxy-status">
          The proxy is {this.state.connected ? "CONNECTED" : "DISCONNECTED"}.
        </div>;
      }
    });

    var RecorderControls = React.createClass({
      getInitialState: function() {
        return { recording: recordState.getState(),
                 playingBack: playbackState.getState()};
      },

      componentDidMount: function() {
        var component = this;
        recordState.bind('change', function(recording) {
          component.setState({recording: recording});
        });
        playbackState.bind('change', function(playingBack) {
          component.setState({playingBack: playingBack});
        });
        ws.send("status");
      },

      startRecording: function() {
        ws.send("start-recording");
      },

      stopRecording: function() {
        ws.send("stop-recording");
      },

      saveRecording: function() {
          ws.send("save");
      },

      startPlayback: function() {
        ws.send("start-playback");
      },

      stopPlayback: function() {
        ws.send("stop-playback");
      },

      render: function() {
        var startRecordingButton = <button type="button" onClick={this.startRecording}>Start Recording</button>;

        var stopRecordingButton = <button type="button" onClick={this.stopRecording}>Stop Recording</button>;

        var saveRecordingButton = <button type="button" onClick={this.saveRecording}>Save Recording</button>;

        var startPlaybackButton = <button type="button" onClick={this.startPlayback}>Start Playback</button>;

        var stopPlaybackButton = <button type="button" onClick={this.stopPlayback}>Stop Playback</button>;

        return <div className="recorder-controls">
              <div>
              {this.state.recording ? stopRecordingButton : startRecordingButton}
              {saveRecordingButton}
        </div>
        <div>
          {this.state.playingBack ? stopPlaybackButton : startPlaybackButton}
        </div>
        </div>;
      }
    });

    ReactDOM.render(
        <div>
        <ProxyState/>
        <RecorderControls/>
        <MessagesList/>
        </div>,
      document.getElementById('golem')
    );
  };

})();
