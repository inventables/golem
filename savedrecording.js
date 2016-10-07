g = org.inventables.golem;

g.output("0");
g.expect(g.literal("2[\"message\",\"Bill\"]"), function(out, msg) {
  out("2[\"message\",\"{\\\"type\\\":\\\"color\\\",\\\"data\\\":\\\"red\\\"}\"]");
  out("2[\"message\",\"{\\\"type\\\":\\\"message\\\",\\\"data\\\":{\\\"time\\\":1475867784320,\\\"text\\\":\\\"Hello, Bill\\\",\\\"author\\\":\\\"system\\\",\\\"color\\\":\\\"black\\\"}}\"]");
 });

g.expect(g.literal("2[\"message\",\"Hi there\"]"), function(out, msg) {
  out("2[\"message\",\"{\\\"type\\\":\\\"message\\\",\\\"data\\\":{\\\"time\\\":1475867789608,\\\"text\\\":\\\"Hi there\\\",\\\"author\\\":\\\"Bill\\\",\\\"color\\\":\\\"red\\\"}}\"]");
 });

g.expect(g.literal("2[\"message\",\"/time\"]"), function(out, msg) {
  out("2[\"message\",\"{\\\"type\\\":\\\"message\\\",\\\"data\\\":{\\\"time\\\":1475867791634,\\\"text\\\":\\\"2016-10-07T19:16:31.634Z\\\",\\\"author\\\":\\\"system\\\",\\\"color\\\":\\\"black\\\"}}\"]");
 });

g.expect(g.literal("2[\"message\",\"Bye\"]"), function(out, msg) {
  out("2[\"message\",\"{\\\"type\\\":\\\"message\\\",\\\"data\\\":{\\\"time\\\":1475867794263,\\\"text\\\":\\\"Bye\\\",\\\"author\\\":\\\"Bill\\\",\\\"color\\\":\\\"red\\\"}}\"]");
 });

