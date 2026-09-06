const test = require("node:test");
const assert = require("node:assert/strict");

const core = require("../src/core.js");

test("normalizes names for exact case-insensitive matching", () => {
  const names = core.normalizeNames([" Dionis404 ", "", "DIONIS404"]);

  assert.equal(names.size, 1);
  assert.equal(core.isTarget("dionis404", names), true);
  assert.equal(core.isTarget("Dionis404-bot", names), false);
});

test("extracts only a GitHub profile login from a relative href", () => {
  assert.equal(core.githubLoginFromHref("/Dionis404"), "Dionis404");
  assert.equal(core.githubLoginFromHref("/Dionis404/repositories"), "");
  assert.equal(core.githubLoginFromHref("https://github.com/Dionis404"), "");
});

test("cleans and limits replacement text", () => {
  assert.equal(core.replacementText("  Nice Idea!  "), "Nice Idea!");
  assert.equal(core.replacementText("   "), "Nice Idea!");
  assert.equal(core.replacementText("abcdef", "fallback", 4), "abcd");
});
