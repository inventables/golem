g = org.inventables.golem;

g.output("0");
g.expect(g.literal("2[\"message\",\"Bob\"]"), function(out, msg) {
  out("2[\"message\",\"{\\\"type\\\":\\\"color\\\",\\\"data\\\":\\\"green\\\"}\"]");
  out("2[\"message\",\"{\\\"type\\\":\\\"message\\\",\\\"data\\\":{\\\"time\\\":1473458540874,\\\"text\\\":\\\"Hello, Bob\\\",\\\"author\\\":\\\"system\\\",\\\"color\\\":\\\"black\\\"}}\"]");
 });

g.expect(g.literal("2[\"message\",\"Hi there\"]"), function(out, msg) {
  out("2[\"message\",\"{\\\"type\\\":\\\"message\\\",\\\"data\\\":{\\\"time\\\":1473458542354,\\\"text\\\":\\\"Hi there\\\",\\\"author\\\":\\\"Bob\\\",\\\"color\\\":\\\"green\\\"}}\"]");
 });

g.expect(g.literal("2[\"message\",\"/time\"]"), function(out, msg) {
  out("2[\"message\",\"{\\\"type\\\":\\\"message\\\",\\\"data\\\":{\\\"time\\\":1473458543813,\\\"text\\\":\\\"2016-09-09T22:02:23.813Z\\\",\\\"author\\\":\\\"system\\\",\\\"color\\\":\\\"black\\\"}}\"]");
 });

