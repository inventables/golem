(function () {

  var RecordState = function() {
    var self = this;

    var isRecording = false;
    self.setRecording = function(val) {
      console.log("now we are " + val);
      if (!isRecording === val) {
        isRecording = val;
        self.trigger('change', val);
      }
      isRecording = val;
    };

    self.getRecording = function() {
      return isRecording;
    };
  };

  MicroEvent.mixin(RecordState);

  var recordState = new RecordState();

  var ws = new WebSocket("ws://localhost:8081");
  ws.onopen = function(evt) {

    ws.onmessage = function(message) {
      var data = JSON.parse(message.data);
      switch(data.topic) {
      case "recorder-status":
        console.log("triggering");
        recordState.setRecording(data.data);
        break;
      }
    };

    var RecorderControls = React.createClass({
      getInitialState: function() {
        return { recording: recordState.getRecording() };
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
        <RecorderControls/>,
      document.getElementById('golem')
    );
  };

})();
