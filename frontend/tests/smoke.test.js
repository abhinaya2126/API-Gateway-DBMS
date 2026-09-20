import test from "node:test";
import assert from "node:assert/strict";

test("frontend test runner is configured", () => {
  assert.equal(typeof window, "undefined");
});