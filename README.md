Internal representation:


Internally, 2 data structures are critical to the playback: the event stream, and the rule store.

The event stream contains events of 3 types: INBOUND, OUTBOUND, and RULE. INBOUND events represent messages to be sent to the client when that point in the event stream is reached. OUTBOUND events represent messages we are expecting to see from the client. The event stream will not advance further until those messages are seen. RULE events add new rules to the rule store.

The rule store consists of a list of message matchers to functions.

When a new message arrives from the client, we first check the rule store and apply any matching functions. Next, we advance the event stream to the appropriate place, firing OUTBOUND events as appropriate.

Internally, the recording is transformed into a list of events of certain types. Some events (OUTBOUND) are things the client is expected to send, some (INBOUND) are things the server will send when it reaces that point in the event stream, and some (RULE) have no immediate effects


Example of running:

node golem.js --recordingName=examplerecordings/conv-with-rules.js --isReplay=true --sourcePort=2338
