g = org.inventables.golem;

g.expect(g.literal("function (out) {\n                      out(msg);\n                    }"), function(out, msg) {
 });

g.expect(g.literal("2[\"message\",\"Bob\"]"), function(out, msg) {
 });

g.expect(g.literal("function (out, msg) {\n  out(\"2[\\\"message\\\",\\\"{\\\\\\\"type\\\\\\\":\\\\\\\"color\\\\\\\",\\\\\\\"data\\\\\\\":\\\\\\\"green\\\\\\\"}\\\"]\");\n  out(\"2[\\\"message\\\",\\\"{\\\\\\\"type\\\\\\\":\\\\\\\"message\\\\\\\",\\\\\\\"data\\\\\\\":{\\\\\\\"time\\\\\\\":1473458540874,\\\\\\\"text\\\\\\\":\\\\\\\"Hello, Bob\\\\\\\",\\\\\\\"author\\\\\\\":\\\\\\\"system\\\\\\\",\\\\\\\"color\\\\\\\":\\\\\\\"black\\\\\\\"}}\\\"]\");\n }"), function(out, msg) {
 });

g.expect(g.literal("2[\"message\",\"Hi there\"]"), function(out, msg) {
 });

g.expect(g.literal("function (out, msg) {\n  out(\"2[\\\"message\\\",\\\"{\\\\\\\"type\\\\\\\":\\\\\\\"message\\\\\\\",\\\\\\\"data\\\\\\\":{\\\\\\\"time\\\\\\\":1473458542354,\\\\\\\"text\\\\\\\":\\\\\\\"Hi there\\\\\\\",\\\\\\\"author\\\\\\\":\\\\\\\"Bob\\\\\\\",\\\\\\\"color\\\\\\\":\\\\\\\"green\\\\\\\"}}\\\"]\");\n }"), function(out, msg) {
 });

g.expect(g.literal("2[\"message\",\"/time\"]"), function(out, msg) {
 });

g.expect(g.literal("function (out, msg) {\n  out(\"2[\\\"message\\\",\\\"{\\\\\\\"type\\\\\\\":\\\\\\\"message\\\\\\\",\\\\\\\"data\\\\\\\":{\\\\\\\"time\\\\\\\":1473458543813,\\\\\\\"text\\\\\\\":\\\\\\\"2016-09-09T22:02:23.813Z\\\\\\\",\\\\\\\"author\\\\\\\":\\\\\\\"system\\\\\\\",\\\\\\\"color\\\\\\\":\\\\\\\"black\\\\\\\"}}\\\"]\");\n }"), function(out, msg) {
  out("0");
 });

g.expect(g.literal("2[\"message\",\"Bob\"]"), function(out, msg) {
  out("2[\"message\",\"{\\\"type\\\":\\\"color\\\",\\\"data\\\":\\\"blue\\\"}\"]");
  out("2[\"message\",\"{\\\"type\\\":\\\"message\\\",\\\"data\\\":{\\\"time\\\":1475863866579,\\\"text\\\":\\\"Hello, Bob\\\",\\\"author\\\":\\\"system\\\",\\\"color\\\":\\\"black\\\"}}\"]");
 });

g.expect(g.literal("2[\"message\",\"Hi there\"]"), function(out, msg) {
  out("2[\"message\",\"{\\\"type\\\":\\\"message\\\",\\\"data\\\":{\\\"time\\\":1475863868553,\\\"text\\\":\\\"Hi there\\\",\\\"author\\\":\\\"Bob\\\",\\\"color\\\":\\\"blue\\\"}}\"]");
 });

g.expect(g.literal("2[\"message\",\"/time\"]"), function(out, msg) {
  out("2[\"message\",\"{\\\"type\\\":\\\"message\\\",\\\"data\\\":{\\\"time\\\":1475863870296,\\\"text\\\":\\\"2016-10-07T18:11:10.296Z\\\",\\\"author\\\":\\\"system\\\",\\\"color\\\":\\\"black\\\"}}\"]");
 });

g.expect(g.literal("2[\"message\",\"bye\"]"), function(out, msg) {
  out("2[\"message\",\"{\\\"type\\\":\\\"message\\\",\\\"data\\\":{\\\"time\\\":1475863871989,\\\"text\\\":\\\"bye\\\",\\\"author\\\":\\\"Bob\\\",\\\"color\\\":\\\"blue\\\"}}\"]");
 });

