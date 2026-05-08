import test from "node:test";
import assert from "node:assert/strict";
import { getFeedCursorFromRequest, isInvalidFeedCursorError } from "./route";

test("feed route cursor parser reads query params", () => {
  const request = new Request("https://example.test/api/feed?cursor=abc123");
  assert.equal(getFeedCursorFromRequest(request), "abc123");
});

test("feed route identifies invalid cursor errors", () => {
  assert.equal(isInvalidFeedCursorError(new Error("Invalid feed cursor")), true);
  assert.equal(isInvalidFeedCursorError(new Error("Other")), false);
});
