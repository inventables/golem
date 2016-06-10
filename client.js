var ws = require("nodejs-websocket");

var passthroughClient = ws.connect("ws://localhost:8001", {"extraHeaders":{"origin":"foo"}});
