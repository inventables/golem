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

  var ws = new WebSocket("ws://localhost:8081");
  ws.onopen = function(evt) {

    ws.onmessage = function(message) {
      var data = JSON.parse(message.data);
      switch(data.topic) {
      case "recorder-status":
        recordState.setState(data.data);
        break;
      case "proxy-status":
        proxyState.setState(data.data);
        break;
      }
    };

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
        return { recording: recordState.getState() };
      },

      componentDidMount: function() {
        var component = this;
        recordState.bind('change', function(recording) {
          component.setState({recording: recording});
        });
        ws.send("status");
      },

      startRecording: function() {
        ws.send("start");
      },

      stopRecording: function() {
        ws.send("stop");
      },

      render: function() {
        var startRecordingButton = <button type="button" onClick={this.startRecording}>Start Recording</button>;

        var stopRecordingButton = <button type="button" onClick={this.stopRecording}>Stop Recording</button>;

        return <div className="recorder-controls">
          {this.state.recording ? stopRecordingButton : startRecordingButton}
        </div>;
      }
    });

    ReactDOM.render(
        <div>
        <ProxyState/>
        <RecorderControls/>
        </div>,
      document.getElementById('golem')
    );
  };

})();
